using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Services;
using System.Security.Claims;

namespace NovaSpaceVR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;

    public EnrollmentsController(IEnrollmentService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<EnrollmentDto>>> GetAllEnrollments()
    {
        var enrollments = await _enrollmentService.GetAllEnrollmentsAsync();
        return Ok(enrollments);
    }

    [HttpGet("account/{accountId}")]
    public async Task<ActionResult<IEnumerable<EnrollmentDto>>> GetEnrollmentsByAccount(string accountId)
    {
        // Ensure user can only access their own account's enrollments unless they are admin
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != accountId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        var enrollments = await _enrollmentService.GetEnrollmentsByAccountIdAsync(accountId);
        return Ok(enrollments);
    }

    [HttpGet("my-enrollments")]
    public async Task<ActionResult<IEnumerable<EnrollmentDto>>> GetMyEnrollments()
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var enrollments = await _enrollmentService.GetEnrollmentsByAccountIdAsync(currentUserId);
        return Ok(enrollments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<EnrollmentDto>> GetEnrollment(string id)
    {
        var enrollment = await _enrollmentService.GetEnrollmentByIdAsync(id);

        if (enrollment == null)
        {
            return NotFound();
        }

        // Ensure user can only access their own enrollment unless they are admin
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != enrollment.AccountId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        return Ok(enrollment);
    }

    [HttpPost]
    public async Task<ActionResult<EnrollmentDto>> CreateEnrollment([FromBody] CreateEnrollmentDto createEnrollmentDto)
    {
        try
        {
            var accountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            var enrollment = await _enrollmentService.CreateEnrollmentAsync(createEnrollmentDto, accountId);

            return CreatedAtAction(nameof(GetEnrollment), new { id = enrollment.Id }, enrollment);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<EnrollmentDto>> UpdateEnrollment(string id, [FromBody] UpdateEnrollmentDto updateEnrollmentDto)
    {
        var existingEnrollment = await _enrollmentService.GetEnrollmentByIdAsync(id);
        if (existingEnrollment == null)
        {
            return NotFound();
        }

        // Ensure user can only update their own enrollment unless they are admin
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != existingEnrollment.AccountId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        var enrollment = await _enrollmentService.UpdateEnrollmentAsync(id, updateEnrollmentDto);

        if (enrollment == null)
        {
            return NotFound();
        }

        return Ok(enrollment);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteEnrollment(string id)
    {
        var enrollment = await _enrollmentService.GetEnrollmentByIdAsync(id);
        if (enrollment == null)
        {
            return NotFound();
        }

        // Ensure user can only delete their own enrollment unless they are admin
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != enrollment.AccountId && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        var result = await _enrollmentService.DeleteEnrollmentAsync(id);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}