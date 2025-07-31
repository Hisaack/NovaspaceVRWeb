using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NovaSpaceVR.API.Data;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Services;

public class TrainingService : ITrainingService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IAlertService _alertService;
    private readonly IEmailService _emailService;

    public TrainingService(ApplicationDbContext context, IMapper mapper, IAlertService alertService, IEmailService emailService)
    {
        _context = context;
        _mapper = mapper;
        _alertService = alertService;
        _emailService = emailService;
    }

    public async Task<IEnumerable<TrainingDataDto>> GetAllTrainingDataAsync()
    {
        var trainingData = await _context.TrainingData
            .Where(td => td.VirtualUser != null && td.Course != null)
            .ToListAsync();

        return _mapper.Map<IEnumerable<TrainingDataDto>>(trainingData);
    }

    public async Task<IEnumerable<TrainingDataDto>> GetTrainingDataByAccountAsync(string accountId)
    {
        var trainingData = await _context.TrainingData
            .Where(td => td.AccountId == accountId)
            .ToListAsync();

        return _mapper.Map<IEnumerable<TrainingDataDto>>(trainingData);
    }

    public async Task<TrainingDataDto?> GetTrainingDataByIdAsync(string id)
    {
        var trainingData = await _context.TrainingData
            .FirstOrDefaultAsync(td => td.Id == id);

        return trainingData != null ? _mapper.Map<TrainingDataDto>(trainingData) : null;
    }

    public async Task<TrainingStepsDto?> GetTrainingStepsAsync(string trainingId)
    {
        var trainingData = await _context.TrainingData
            .FirstOrDefaultAsync(td => td.Id == trainingId);

        if (trainingData == null)
        {
            return null;
        }

        var trainingSteps = await _context.TrainingSteps
            .Where(ts => ts.TrainingDataId == trainingId)
            .OrderBy(ts => ts.StepNumber)
            .ToListAsync();

        var virtualUser = await _context.VirtualUsers.FindAsync(trainingData.VirtualUserId);
        var course = await _context.Courses.FindAsync(trainingData.CourseId);

        return new TrainingStepsDto
        {
            UserId = trainingData.VirtualUserId,
            UserName = virtualUser?.Name ?? "Unknown",
            CourseCode = course?.Code ?? "Unknown",
            StepsData = trainingSteps.Select(ts => new StepDataDto
            {
                Step = ts.StepNumber,
                ErrorRate = ts.ErrorRate,
                SuccessRate = ts.SuccessRate
            }).ToList(),
            TimeData = trainingSteps.Select(ts => new TimeDataDto
            {
                Step = ts.StepNumber,
                ElapsedTime = ts.ElapsedTime,
                ExpectedTime = ts.ExpectedTime
            }).ToList(),
            SummaryData = trainingSteps.Select(ts => new SummaryDataDto
            {
                StepNumber = ts.StepNumber,
                ElapsedTime = $"{ts.ElapsedTime} min",
                ExpectedTime = $"{ts.ExpectedTime} min",
                ErrorSum = ts.ErrorSum,
                ErrorRate = $"{ts.ErrorRate:F1}%",
                ErrorSummary = ts.ErrorSummary,
                SuccessRate = $"{ts.SuccessRate:F1}%"
            }).ToList()
        };
    }

    public async Task<IEnumerable<GraduatedUserDto>> GetGraduatedUsersAsync()
    {
        var graduatedUsers = await _context.GraduatedUsers
            .ToListAsync();

        return _mapper.Map<IEnumerable<GraduatedUserDto>>(graduatedUsers);
    }

    public async Task<IEnumerable<GraduatedUserDto>> GetGraduatedUsersByAccountAsync(string accountId)
    {
        var graduatedUsers = await _context.GraduatedUsers
            .Where(gu => gu.VirtualUser.AccountId == accountId)
            .ToListAsync();

        return _mapper.Map<IEnumerable<GraduatedUserDto>>(graduatedUsers);
    }

    public async Task<GraduatedUserDto> CreateGraduatedUserAsync(CreateGraduatedUserDto createGraduatedUserDto)
    {
        var virtualUser = await _context.VirtualUsers.FindAsync(createGraduatedUserDto.VirtualUserId);
        if (virtualUser == null)
        {
            throw new ArgumentException("Virtual user not found");
        }

        var graduatedUser = _mapper.Map<GraduatedUser>(createGraduatedUserDto);
        graduatedUser.CertificateId = $"CERT{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

        _context.GraduatedUsers.Add(graduatedUser);
        await _context.SaveChangesAsync();

        // Load related data for alert
        var course = await _context.Courses.FindAsync(createGraduatedUserDto.CourseId);

        // Send alert
        await _alertService.CreateAlertAsync(new CreateAlertDto
        {
            AccountId = virtualUser.AccountId,
            Type = "graduation",
            Title = "Training Completed",
            Message = $"{virtualUser.Name} has successfully completed {course?.Title ?? "course"}"
        });
      

        // Send certificate email (mock PDF for now)
        var mockCertificatePdf = new byte[] { 0x25, 0x50, 0x44, 0x46 }; // Mock PDF header
        await _emailService.SendCertificateEmailAsync(
            virtualUser.Email,
            virtualUser.Name,
            course?.Title ?? "Course",
            mockCertificatePdf);

        graduatedUser.CertificateSent = true;
        await _context.SaveChangesAsync();

        return _mapper.Map<GraduatedUserDto>(graduatedUser);
    }
}