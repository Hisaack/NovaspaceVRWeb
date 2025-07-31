using NovaSpaceVR.API.DTOs;

namespace NovaSpaceVR.API.Services;

public interface IVirtualUserService
{
    Task<IEnumerable<VirtualUserDto>> GetAllAsync();
    Task<IEnumerable<VirtualUserDto>> GetByAccountIdAsync(string accountId);
    Task<VirtualUserDto?> GetByIdAsync(string id);
    Task<VirtualUserDto?> GetByEmailAsync(string email);
    Task<VirtualUserDto?> GetByOrganizationAndCodeAsync(string organizationName, string userCode);
    Task<VirtualUserDto> CreateAsync(CreateVirtualUserDto createVirtualUserDto, string accountId);
    Task<IEnumerable<VirtualUserDto>> CreateBulkAsync(IEnumerable<CreateVirtualUserDto> createVirtualUserDtos, string accountId);
    Task<VirtualUserDto?> UpdateAsync(string id, UpdateVirtualUserDto updateVirtualUserDto);
    Task<bool> DeleteAsync(string id);
    Task<bool> UpdateLastLoginAsync(string id);
}