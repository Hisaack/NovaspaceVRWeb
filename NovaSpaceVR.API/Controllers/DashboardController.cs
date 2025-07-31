using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Services;

namespace NovaSpaceVR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("metrics")]
    public async Task<ActionResult<DashboardMetricsDto>> GetMetrics([FromQuery] string? organizationId = null)
    {
        var metrics = await _dashboardService.GetMetricsAsync(organizationId);
        return Ok(metrics);
    }

    [HttpGet("growth")]
    public async Task<ActionResult<IEnumerable<MonthlyGrowthDto>>> GetGrowthData([FromQuery] int year = 2024)
    {
        var growthData = await _dashboardService.GetGrowthDataAsync(year);
        return Ok(growthData);
    }

    [HttpGet("improvement")]
    public async Task<ActionResult<IEnumerable<ImprovementDataDto>>> GetImprovementData()
    {
        var improvementData = await _dashboardService.GetImprovementDataAsync();
        return Ok(improvementData);
    }

    [HttpGet("recent-trainees")]
    public async Task<ActionResult<IEnumerable<TrainingDataDto>>> GetRecentTrainees([FromQuery] int count = 10)
    {
        var recentTrainees = await _dashboardService.GetRecentTraineesAsync(count);
        return Ok(recentTrainees);
    }
}