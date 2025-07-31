using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Services;
using System.Security.Claims;

namespace NovaSpaceVR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VirtualUsersController : ControllerBase
{
    private readonly IVirtualUserService _virtualUserService;

    public VirtualUsersController(IVirtualUserService virtualUserService)
    {
        _virtualUserService = virtualUserService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VirtualUserDto>>> GetVirtualUsers([FromQuery] string? accountId = null)
    {
        IEnumerable<VirtualUserDto> virtualUsers;
        
        if (string.IsNullOrEmpty(accountId))
        {
            virtualUsers = await _virtualUserService.GetAllAsync();
        }
        else
        {
            virtualUsers = await _virtualUserService.GetByAccountIdAsync(accountId);
        }

        return Ok(virtualUsers);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VirtualUserDto>> GetVirtualUser(string id)
    {
        var virtualUser = await _virtualUserService.GetByIdAsync(id);
        
        if (virtualUser == null)
        {
            return NotFound();
        }

        return Ok(virtualUser);
    }

    [HttpGet("organization/{organizationName}/code/{userCode}")]
    public async Task<ActionResult<VirtualUserDto>> GetVirtualUserByCode(string organizationName, string userCode)
    {
        var virtualUser = await _virtualUserService.GetByOrganizationAndCodeAsync(organizationName, userCode);
        
        if (virtualUser == null)
        {
            return NotFound();
        }

        return Ok(virtualUser);
    }

    [HttpPost]
    public async Task<ActionResult<VirtualUserDto>> CreateVirtualUser([FromBody] CreateVirtualUserDto createVirtualUserDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var virtualUser = await _virtualUserService.CreateAsync(createVirtualUserDto, userId);
        
        return CreatedAtAction(nameof(GetVirtualUser), new { id = virtualUser.Id }, virtualUser);
    }

    [HttpPost("bulk")]
    public async Task<ActionResult<IEnumerable<VirtualUserDto>>> CreateBulkVirtualUsers([FromBody] BulkCreateVirtualUserDto bulkCreateDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var virtualUsers = await _virtualUserService.CreateBulkAsync(bulkCreateDto.VirtualUsers, userId);
        
        return Ok(virtualUsers);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<VirtualUserDto>> UpdateVirtualUser(string id, [FromBody] UpdateVirtualUserDto updateVirtualUserDto)
    {
        var virtualUser = await _virtualUserService.UpdateAsync(id, updateVirtualUserDto);
        
        if (virtualUser == null)
        {
            return NotFound();
        }

        return Ok(virtualUser);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteVirtualUser(string id)
    {
        var result = await _virtualUserService.DeleteAsync(id);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}