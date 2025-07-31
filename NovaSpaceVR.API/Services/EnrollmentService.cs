using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NovaSpaceVR.API.Data;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Services
{
    public class EnrollmentService : IEnrollmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IAlertService _alertService;

        public EnrollmentService(ApplicationDbContext context, IMapper mapper, IAlertService alertService)
        {
            _context = context;
            _mapper = mapper;
            _alertService = alertService;
        }

        public async Task<IEnumerable<EnrollmentDto>> GetAllEnrollmentsAsync()
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.VirtualUser)
                .Include(e => e.Course)
                .OrderByDescending(e => e.EnrollmentDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<EnrollmentDto>>(enrollments);
        }

        public async Task<IEnumerable<EnrollmentDto>> GetEnrollmentsByAccountIdAsync(string accountId)
        {
            var enrollments = await _context.Enrollments
                .Where(e => e.AccountId == accountId)
                .Include(e => e.VirtualUser)
                .Include(e => e.Course)
                .OrderByDescending(e => e.EnrollmentDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<EnrollmentDto>>(enrollments);
        }

        public async Task<EnrollmentDto?> GetEnrollmentByIdAsync(string id)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.VirtualUser)
                .Include(e => e.Course)
                .FirstOrDefaultAsync(e => e.Id == id);

            return enrollment != null ? _mapper.Map<EnrollmentDto>(enrollment) : null;
        }

        public async Task<EnrollmentDto> CreateEnrollmentAsync(CreateEnrollmentDto createEnrollmentDto, string accountId)
        {
            // Check if enrollment already exists
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.VirtualUserId == createEnrollmentDto.VirtualUserId &&
                                        e.CourseId == createEnrollmentDto.CourseId);

            if (existingEnrollment != null)
            {
                throw new InvalidOperationException("User is already enrolled in this course");
            }

            var enrollment = _mapper.Map<Enrollment>(createEnrollmentDto);
            enrollment.AccountId = accountId;
            enrollment.EnrollmentDate = DateTime.UtcNow;

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            // Load related data for alert
            var virtualUser = await _context.VirtualUsers.FindAsync(enrollment.VirtualUserId);
            var course = await _context.Courses.FindAsync(enrollment.CourseId);

            if (virtualUser != null && course != null)
            {
                await _alertService.CreateAlertAsync(new CreateAlertDto
                {
                    AccountId = accountId,
                    Type = "enrollment",
                    Title = "New Enrollment",
                    Message = $"{virtualUser.Name} enrolled in course {course.Title}"
                });
            }

            // Return with related data
            var createdEnrollment = await _context.Enrollments
                .Include(e => e.VirtualUser)
                .Include(e => e.Course)
                .FirstOrDefaultAsync(e => e.Id == enrollment.Id);

            return _mapper.Map<EnrollmentDto>(createdEnrollment!);
        }

        public async Task<EnrollmentDto?> UpdateEnrollmentAsync(string id, UpdateEnrollmentDto updateEnrollmentDto)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.VirtualUser)
                .Include(e => e.Course)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enrollment == null)
            {
                return null;
            }

            _mapper.Map(updateEnrollmentDto, enrollment);
            await _context.SaveChangesAsync();

            return _mapper.Map<EnrollmentDto>(enrollment);
        }

        public async Task<bool> DeleteEnrollmentAsync(string id)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null)
            {
                return false;
            }

            _context.Enrollments.Remove(enrollment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
