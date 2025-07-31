using NovaSpaceVR.API.DTOs;

namespace NovaSpaceVR.API.Services;

public interface IAlertService
{
    Task<IEnumerable<AlertDto>> GetAlertsAsync(string accountId);
    Task<AlertDto> CreateAlertAsync(CreateAlertDto createAlertDto);
    Task<bool> MarkAsReadAsync(string alertId);
    Task<bool> DeleteAlertAsync(string alertId);
    Task<bool> DeleteAllAlertsAsync(string accountId);
    Task<int> GetUnreadCountAsync(string accountId);
}