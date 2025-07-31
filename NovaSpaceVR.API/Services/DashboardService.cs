using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NovaSpaceVR.API.Data;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DashboardService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<DashboardMetricsDto> GetMetricsAsync(string? organizationId = null)
    {
        IQueryable<VirtualUser> virtualUsersQuery = _context.VirtualUsers;
        IQueryable<TrainingData> trainingDataQuery = _context.TrainingData.Include(td => td.VirtualUser);
        IQueryable<GraduatedUser> graduatedUsersQuery = _context.GraduatedUsers.Include(gu => gu.VirtualUser);
        
        if (!string.IsNullOrEmpty(organizationId) && organizationId != "all")
        {
            virtualUsersQuery = virtualUsersQuery.Where(vu => vu.AccountId == organizationId);
            trainingDataQuery = trainingDataQuery.Where(td => td.VirtualUser.AccountId == organizationId);
            graduatedUsersQuery = graduatedUsersQuery.Where(gu => gu.VirtualUser.AccountId == organizationId);
        }

        var virtualUsersCount = await virtualUsersQuery.CountAsync();
        var trainingDataCount = await trainingDataQuery.CountAsync();
        var graduatedUsersCount = await graduatedUsersQuery.CountAsync();
        var coursesCount = await _context.Courses.CountAsync();

        // Calculate trends (mock data for now - in real app, compare with previous period)
        var lastMonth = DateTime.UtcNow.AddMonths(-1);
        
        var lastMonthVirtualUsers = await virtualUsersQuery
            .CountAsync(vu => vu.DateAdded <= lastMonth);
        var lastMonthTrainingData = await trainingDataQuery
            .CountAsync(td => td.TrainingDate <= lastMonth);
        var lastMonthGraduatedUsers = await graduatedUsersQuery
            .CountAsync(gu => gu.DateIssued <= lastMonth);

        return new DashboardMetricsDto
        {
            TrainedStudents = trainingDataCount,
            TrainedStudentsTrend = CalculateTrend(trainingDataCount, lastMonthTrainingData),
            
            CoursesAvailable = coursesCount,
            CoursesAvailableTrend = CalculateTrend(coursesCount, coursesCount), // Courses don't change monthly
            
            GraduatedStudents = graduatedUsersCount,
            GraduatedStudentsTrend = CalculateTrend(graduatedUsersCount, lastMonthGraduatedUsers),
            
            VirtualUsersTelemetry = virtualUsersCount,
            VirtualUsersTelemetryTrend = CalculateTrend(virtualUsersCount, lastMonthVirtualUsers)
        };
    }

    public async Task<IEnumerable<MonthlyGrowthDto>> GetGrowthDataAsync(int year)
    {
        var months = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        var growthData = new List<MonthlyGrowthDto>();

        for (int i = 0; i < 12; i++)
        {
            var month = i + 1;
            var endDate = new DateTime(year, month, DateTime.DaysInMonth(year, month));
            
            var virtualUsersCount = await _context.VirtualUsers
                .CountAsync(vu => vu.DateAdded <= endDate);
                
            var accountsCount = await _context.Users
                .CountAsync(u => u.CreatedDate <= endDate);

            growthData.Add(new MonthlyGrowthDto
            {
                Month = months[i],
                VirtualUsers = virtualUsersCount,
                Accounts = accountsCount
            });
        }

        return growthData;
    }

    public async Task<IEnumerable<ImprovementDataDto>> GetImprovementDataAsync()
    {
        // Mock improvement data - in real app, calculate from actual training results
        var months = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun" };
        var improvementData = new List<ImprovementDataDto>();

        var baseImprovement = 65;
        var baseErrors = 35;

        for (int i = 0; i < months.Length; i++)
        {
            improvementData.Add(new ImprovementDataDto
            {
                Month = months[i],
                Improvement = baseImprovement + (i * 5) + new Random().Next(-3, 4),
                Errors = baseErrors - (i * 4) + new Random().Next(-2, 3)
            });
        }

        return improvementData;
    }

    public async Task<IEnumerable<TrainingDataDto>> GetRecentTraineesAsync(int count = 10)
    {
        var recentTraining = await _context.TrainingData
            .Include(td => td.VirtualUser)
            .Include(td => td.Course)
            .OrderByDescending(td => td.TrainingDate)
            .Take(count)
            .ToListAsync();

        return _mapper.Map<IEnumerable<TrainingDataDto>>(recentTraining);
    }

    private static TrendDto CalculateTrend(int current, int previous)
    {
        if (previous == 0)
        {
            return new TrendDto { Value = 0, IsPositive = true };
        }

        var percentageChange = ((double)(current - previous) / previous) * 100;
        return new TrendDto
        {
            Value = (int)Math.Round(Math.Abs(percentageChange)),
            IsPositive = percentageChange >= 0
        };
    }
}