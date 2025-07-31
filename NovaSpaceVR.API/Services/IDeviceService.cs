using NovaSpaceVR.API.DTOs;

namespace NovaSpaceVR.API.Services;

public interface IDeviceService
{
    Task<IEnumerable<DeviceDto>> GetAllDevicesAsync();
    Task<IEnumerable<DeviceDto>> GetDevicesByAccountAsync(string accountId);
    Task<DeviceDto?> GetDeviceByIdAsync(string id);
    Task<DeviceDto?> UpdateDeviceAsync(string id, UpdateDeviceDto updateDeviceDto);
    Task<bool> DeleteDeviceAsync(string id);
}