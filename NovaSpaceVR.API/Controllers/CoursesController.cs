using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Services;
using System.Security.Claims;

namespace NovaSpaceVR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses()
    {
        try
        {
            Console.WriteLine("GetCourses endpoint called");
            var courses = await _courseService.GetAllCoursesAsync();
            Console.WriteLine($"Found {courses?.Count()} courses");
            return Ok(courses);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetCourses: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("public")]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetPublicCourses()
    {
        var courses = await _courseService.GetPublicCoursesAsync();
        return Ok(courses);
    }

    [HttpGet("organization/{organizationId}")]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetOrganizationCourses(string organizationId)
    {
        var courses = await _courseService.GetOrganizationCoursesAsync(organizationId);
        return Ok(courses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CourseDto>> GetCourse(string id)
    {
        var course = await _courseService.GetCourseByIdAsync(id);
        
        if (course == null)
        {
            return NotFound();
        }

        return Ok(course);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CourseDto>> CreateCourse([FromBody] CreateCourseDto createCourseDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var course = await _courseService.CreateCourseAsync(createCourseDto, userId);
        
        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CourseDto>> UpdateCourse(string id, [FromBody] UpdateCourseDto updateCourseDto)
    {
        var course = await _courseService.UpdateCourseAsync(id, updateCourseDto);
        
        if (course == null)
        {
            return NotFound();
        }

        return Ok(course);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> DeleteCourse(string id)
    {
        var result = await _courseService.DeleteCourseAsync(id);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpGet("{courseId}/modules")]
    public async Task<ActionResult<IEnumerable<CourseModuleDto>>> GetCourseModules(string courseId)
    {
        var modules = await _courseService.GetCourseModulesAsync(courseId);
        return Ok(modules);
    }

    [HttpPost("{courseId}/modules")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CourseModuleDto>> CreateModule(string courseId, [FromBody] CreateModuleDto createModuleDto)
    {
        var module = await _courseService.CreateModuleAsync(courseId, createModuleDto);
        return CreatedAtAction(nameof(GetCourseModules), new { courseId }, module);
    }

    [HttpPut("{courseId}/modules/{moduleId}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CourseModuleDto>> UpdateModule(string courseId, string moduleId, [FromBody] UpdateModuleDto updateModuleDto)
    {
        var module = await _courseService.UpdateModuleAsync(courseId, moduleId, updateModuleDto);
        
        if (module == null)
        {
            return NotFound();
        }

        return Ok(module);
    }

    [HttpDelete("{courseId}/modules/{moduleId}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> DeleteModule(string courseId, string moduleId)
    {
        var result = await _courseService.DeleteModuleAsync(courseId, moduleId);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}