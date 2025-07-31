using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NovaSpaceVR.API.Data;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Services;

public class AlertService : IAlertService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AlertService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AlertDto>> GetAlertsAsync(string accountId)
    {
        var alerts = await _context.Alerts
            .Where(a => a.AccountId == accountId)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync();

        return _mapper.Map<IEnumerable<AlertDto>>(alerts);
    }

    public async Task<AlertDto> CreateAlertAsync(CreateAlertDto createAlertDto)
    {
        var alert = _mapper.Map<Alert>(createAlertDto);
        
        _context.Alerts.Add(alert);
        await _context.SaveChangesAsync();

        return _mapper.Map<AlertDto>(alert);
    }

    public async Task<bool> MarkAsReadAsync(string alertId)
    {
        var alert = await _context.Alerts.FindAsync(alertId);
        if (alert == null)
        {
            return false;
        }

        alert.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAlertAsync(string alertId)
    {
        var alert = await _context.Alerts.FindAsync(alertId);
        if (alert == null)
        {
            return false;
        }

        _context.Alerts.Remove(alert);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAllAlertsAsync(string accountId)
    {
        var alerts = await _context.Alerts
            .Where(a => a.AccountId == accountId)
            .ToListAsync();

        _context.Alerts.RemoveRange(alerts);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetUnreadCountAsync(string accountId)
    {
        return await _context.Alerts
            .CountAsync(a => a.AccountId == accountId && !a.IsRead);
    }
}