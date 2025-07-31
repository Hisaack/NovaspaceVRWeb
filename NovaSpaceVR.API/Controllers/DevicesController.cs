using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Services;
using System.Security.Claims;

namespace NovaSpaceVR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _deviceService;

    public DevicesController(IDeviceService deviceService)
    {
        _deviceService = deviceService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DeviceDto>>> GetDevices([FromQuery] string? accountId = null)
    {
        IEnumerable<DeviceDto> devices;
        
        if (string.IsNullOrEmpty(accountId))
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            devices = await _deviceService.GetDevicesByAccountAsync(userId);
        }
        else
        {
            devices = await _deviceService.GetDevicesByAccountAsync(accountId);
        }
        
        return Ok(devices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DeviceDto>> GetDevice(string id)
    {
        var device = await _deviceService.GetDeviceByIdAsync(id);
        
        if (device == null)
        {
            return NotFound();
        }

        return Ok(device);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DeviceDto>> UpdateDevice(string id, [FromBody] UpdateDeviceDto updateDeviceDto)
    {
        var device = await _deviceService.UpdateDeviceAsync(id, updateDeviceDto);
        
        if (device == null)
        {
            return NotFound();
        }

        return Ok(device);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteDevice(string id)
    {
        var result = await _deviceService.DeleteDeviceAsync(id);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}