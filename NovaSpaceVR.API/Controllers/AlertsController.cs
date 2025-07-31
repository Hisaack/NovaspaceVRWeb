using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Services;
using System.Security.Claims;

namespace NovaSpaceVR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;

    public AlertsController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AlertDto>>> GetAlerts([FromQuery] string? accountId = null)
    {
        var userId = accountId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var alerts = await _alertService.GetAlertsAsync(userId);
        return Ok(alerts);
    }

    [HttpPost]
    public async Task<ActionResult<AlertDto>> CreateAlert([FromBody] CreateAlertDto createAlertDto)
    {
        // If no accountId provided, use current user's ID
        if (string.IsNullOrEmpty(createAlertDto.AccountId))
        {
            createAlertDto.AccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        }
        
        var alert = await _alertService.CreateAlertAsync(createAlertDto);
        return Ok(alert);
    }

    [HttpPut("{id}/mark-read")]
    public async Task<ActionResult> MarkAsRead(string id)
    {
        var result = await _alertService.MarkAsReadAsync(id);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAlert(string id)
    {
        var result = await _alertService.DeleteAlertAsync(id);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("all")]
    public async Task<ActionResult> DeleteAllAlerts()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var result = await _alertService.DeleteAllAlertsAsync(userId);
        
        if (!result)
        {
            return BadRequest();
        }

        return NoContent();
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount([FromQuery] string? accountId = null)
    {
        var userId = accountId ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var count = await _alertService.GetUnreadCountAsync(userId);
        return Ok(count);
    }
}