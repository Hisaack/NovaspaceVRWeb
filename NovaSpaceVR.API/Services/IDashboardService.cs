using NovaSpaceVR.API.DTOs;

namespace NovaSpaceVR.API.Services;

public interface IDashboardService
{
    Task<DashboardMetricsDto> GetMetricsAsync(string? organizationId = null);
    Task<IEnumerable<MonthlyGrowthDto>> GetGrowthDataAsync(int year);
    Task<IEnumerable<ImprovementDataDto>> GetImprovementDataAsync();
    Task<IEnumerable<TrainingDataDto>> GetRecentTraineesAsync(int count = 10);
}