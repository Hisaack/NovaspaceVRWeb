using NovaSpaceVR.API.DTOs;

namespace NovaSpaceVR.API.Services
{
    public interface IEnrollmentService
    {
        Task<IEnumerable<EnrollmentDto>> GetAllEnrollmentsAsync();
        Task<IEnumerable<EnrollmentDto>> GetEnrollmentsByAccountIdAsync(string accountId);
        Task<EnrollmentDto?> GetEnrollmentByIdAsync(string id);
        Task<EnrollmentDto> CreateEnrollmentAsync(CreateEnrollmentDto createEnrollmentDto, string accountId);
        Task<EnrollmentDto?> UpdateEnrollmentAsync(string id, UpdateEnrollmentDto updateEnrollmentDto);
        Task<bool> DeleteEnrollmentAsync(string id);
    }
}
