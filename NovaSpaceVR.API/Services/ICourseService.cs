using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Services;

public interface ICourseService
{
    Task<IEnumerable<CourseDto>> GetAllCoursesAsync();
    Task<IEnumerable<CourseDto>> GetPublicCoursesAsync();
    Task<IEnumerable<CourseDto>> GetOrganizationCoursesAsync(string organizationId);
    Task<CourseDto?> GetCourseByIdAsync(string id);
    Task<CourseDto> CreateCourseAsync(CreateCourseDto createCourseDto, string userId);
    Task<CourseDto?> UpdateCourseAsync(string id, UpdateCourseDto updateCourseDto);
    Task<bool> DeleteCourseAsync(string id);
    Task<IEnumerable<CourseModuleDto>> GetCourseModulesAsync(string courseId);
    Task<CourseModuleDto> CreateModuleAsync(string courseId, CreateModuleDto createModuleDto);
    Task<CourseModuleDto?> UpdateModuleAsync(string courseId, string moduleId, UpdateModuleDto updateModuleDto);
    Task<bool> DeleteModuleAsync(string courseId, string moduleId);
}