using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NovaSpaceVR.API.Data;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Services;

public class CourseService : ICourseService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IAlertService _alertService;

    public CourseService(ApplicationDbContext context, IMapper mapper, IAlertService alertService)
    {
        _context = context;
        _mapper = mapper;
        _alertService = alertService;
    }

    public async Task<IEnumerable<CourseDto>> GetAllCoursesAsync()
    {
        var courses = await _context.Courses
            .Include(c => c.Modules)
            .Include(c => c.Enrollments)
            .ToListAsync();

        return _mapper.Map<IEnumerable<CourseDto>>(courses);
    }

    public async Task<IEnumerable<CourseDto>> GetPublicCoursesAsync()
    {
        var courses = await _context.Courses
            .Where(c => c.IsPublic)
            .Include(c => c.Modules)
            .Include(c => c.Enrollments)
            .ToListAsync();

        return _mapper.Map<IEnumerable<CourseDto>>(courses);
    }

    public async Task<IEnumerable<CourseDto>> GetOrganizationCoursesAsync(string organizationId)
    {
        var courses = await _context.Courses
            .Where(c => !c.IsPublic && c.OrganizationId == organizationId)
            .Include(c => c.Modules)
            .Include(c => c.Enrollments)
            .ToListAsync();

        return _mapper.Map<IEnumerable<CourseDto>>(courses);
    }

    public async Task<CourseDto?> GetCourseByIdAsync(string id)
    {
        var course = await _context.Courses
            .Include(c => c.Modules)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == id);

        return course != null ? _mapper.Map<CourseDto>(course) : null;
    }

    public async Task<CourseDto> CreateCourseAsync(CreateCourseDto createCourseDto, string userId)
    {
        var course = _mapper.Map<Course>(createCourseDto);
        course.Code = await GenerateUniqueCourseCodeAsync();
        
        if (!course.IsPublic)
        {
            course.OrganizationId = createCourseDto.OrganizationId;
        }

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        // Send alerts based on course visibility
        if (course.IsPublic)
        {
            // Alert only General Public accounts for public courses
            var generalPublicAccountIds = await _context.Users
                .Where(u => u.IsAccountGeneralPublic)
                .Select(u => u.Id)
                .ToListAsync();

            foreach (var accountId in generalPublicAccountIds)
            {
                await _alertService.CreateAlertAsync(new CreateAlertDto
                {
                    AccountId = accountId,
                    Type = "course",
                    Title = "New Public Course Added",
                    Message = $"{course.Title} course is now available"
                });
            }
        }
        else if (!string.IsNullOrEmpty(course.OrganizationId))
        {
            // Alert only the specific organization
            await _alertService.CreateAlertAsync(new CreateAlertDto
            {
                AccountId = course.OrganizationId!,
                Type = "course",
                Title = "New Organization Course Added",
                Message = $"{course.Title} course has been created for your organization"
            });
        }

        return _mapper.Map<CourseDto>(course);
    }

    public async Task<CourseDto?> UpdateCourseAsync(string id, UpdateCourseDto updateCourseDto)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
        {
            return null;
        }

        _mapper.Map(updateCourseDto, course);
        await _context.SaveChangesAsync();

        return _mapper.Map<CourseDto>(course);
    }

    public async Task<bool> DeleteCourseAsync(string id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null)
        {
            return false;
        }

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<CourseModuleDto>> GetCourseModulesAsync(string courseId)
    {
        var modules = await _context.CourseModules
            .Where(m => m.CourseId == courseId)
            .OrderBy(m => m.CreatedDate)
            .ToListAsync();

        return _mapper.Map<IEnumerable<CourseModuleDto>>(modules);
    }

    public async Task<CourseModuleDto> CreateModuleAsync(string courseId, CreateModuleDto createModuleDto)
    {
        var module = _mapper.Map<CourseModule>(createModuleDto);
        module.CourseId = courseId;

        _context.CourseModules.Add(module);
        await _context.SaveChangesAsync();

        // Update course metrics
        await UpdateCourseMetricsAsync(courseId);

        // Send alert for new module
        var course = await _context.Courses.FindAsync(courseId);
        if (course != null)
        {
            if (course.IsPublic)
            {
                // Alert only General Public accounts for public course modules
                var generalPublicAccountIds = await _context.Users
                    .Where(u => u.IsAccountGeneralPublic)
                    .Select(u => u.Id)
                    .ToListAsync();
                    
                foreach (var accountId in generalPublicAccountIds)
                {
                    await _alertService.CreateAlertAsync(new CreateAlertDto
                    {
                        AccountId = accountId,
                        Type = "module",
                        Title = "New Module Added to Public Course",
                        Message = $"{module.Title} module added to {course.Title}"
                    });
                }
            }
            else if (!string.IsNullOrEmpty(course.OrganizationId))
            {
                // Alert only the specific organization for private course modules
                await _alertService.CreateAlertAsync(new CreateAlertDto
                {
                    AccountId = course.OrganizationId,
                    Type = "module",
                    Title = "New Module Added to Private Course",
                    Message = $"{module.Title} module added to {course.Title}"
                });
            }
        }

        return _mapper.Map<CourseModuleDto>(module);
    }

    public async Task<CourseModuleDto?> UpdateModuleAsync(string courseId, string moduleId, UpdateModuleDto updateModuleDto)
    {
        var module = await _context.CourseModules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.CourseId == courseId);

        if (module == null)
        {
            return null;
        }

        _mapper.Map(updateModuleDto, module);
        await _context.SaveChangesAsync();

        // Update course metrics
        await UpdateCourseMetricsAsync(courseId);

        return _mapper.Map<CourseModuleDto>(module);
    }

    public async Task<bool> DeleteModuleAsync(string courseId, string moduleId)
    {
        var module = await _context.CourseModules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.CourseId == courseId);

        if (module == null)
        {
            return false;
        }

        _context.CourseModules.Remove(module);
        await _context.SaveChangesAsync();

        // Update course metrics
        await UpdateCourseMetricsAsync(courseId);

        return true;
    }

    private async Task<string> GenerateUniqueCourseCodeAsync()
    {
        string code;
        do
        {
            code = GenerateRandomCode();
        } while (await _context.Courses.AnyAsync(c => c.Code == code));

        return code;
    }

    private static string GenerateRandomCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    private async Task UpdateCourseMetricsAsync(string courseId)
    {
        var course = await _context.Courses
            .Include(c => c.Modules)
            .Include(c => c.Enrollments)
            .FirstOrDefaultAsync(c => c.Id == courseId);

        if (course != null)
        {
            course.NumberOfModules = course.Modules.Count;
            course.TargetSample = course.Modules.Sum(m => m.SampleSize);
            course.TargetTime = $"{course.Modules.Sum(m => m.EstimatedTime)} min";

            await _context.SaveChangesAsync();
        }
    }
}