using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Services;
using System.Security.Claims;

namespace NovaSpaceVR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrainingController : ControllerBase
{
    private readonly ITrainingService _trainingService;

    public TrainingController(ITrainingService trainingService)
    {
        _trainingService = trainingService;
    }

    [HttpGet("data")]
    public async Task<ActionResult<IEnumerable<TrainingDataDto>>> GetTrainingData([FromQuery] string? accountId = null)
    {
        IEnumerable<TrainingDataDto> trainingData;
        
        if (string.IsNullOrEmpty(accountId))
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            trainingData = await _trainingService.GetTrainingDataByAccountAsync(userId);
        }
        else
        {
            trainingData = await _trainingService.GetTrainingDataByAccountAsync(accountId);
        }

        return Ok(trainingData);
    }

    [HttpGet("data/{id}")]
    public async Task<ActionResult<TrainingDataDto>> GetTrainingDataById(string id)
    {
        var trainingData = await _trainingService.GetTrainingDataByIdAsync(id);
        
        if (trainingData == null)
        {
            return NotFound();
        }

        return Ok(trainingData);
    }

    [HttpGet("steps/{trainingId}")]
    public async Task<ActionResult<TrainingStepsDto>> GetTrainingSteps(string trainingId)
    {
        var trainingSteps = await _trainingService.GetTrainingStepsAsync(trainingId);
        
        if (trainingSteps == null)
        {
            return NotFound();
        }

        return Ok(trainingSteps);
    }

    [HttpGet("graduated")]
    public async Task<ActionResult<IEnumerable<GraduatedUserDto>>> GetGraduatedUsers([FromQuery] string? accountId = null)
    {
        IEnumerable<GraduatedUserDto> graduatedUsers;
        
        if (string.IsNullOrEmpty(accountId))
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            graduatedUsers = await _trainingService.GetGraduatedUsersByAccountAsync(userId);
        }
        else
        {
            graduatedUsers = await _trainingService.GetGraduatedUsersByAccountAsync(accountId);
        }

        return Ok(graduatedUsers);
    }

    [HttpPost("graduated")]
    public async Task<ActionResult<GraduatedUserDto>> CreateGraduatedUser([FromBody] CreateGraduatedUserDto createGraduatedUserDto)
    {
        var graduatedUser = await _trainingService.CreateGraduatedUserAsync(createGraduatedUserDto);
        return Ok(graduatedUser);
    }
}