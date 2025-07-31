using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NovaSpaceVR.API.Data;
using NovaSpaceVR.API.DTOs;

namespace NovaSpaceVR.API.Services;

public class DeviceService : IDeviceService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public DeviceService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<DeviceDto>> GetAllDevicesAsync()
    {
        var devices = await _context.Devices.ToListAsync();
        return _mapper.Map<IEnumerable<DeviceDto>>(devices);
    }

    public async Task<IEnumerable<DeviceDto>> GetDevicesByAccountAsync(string accountId)
    {
        var devices = await _context.Devices
            .Where(d => d.AccountId == accountId)
            .ToListAsync();
        return _mapper.Map<IEnumerable<DeviceDto>>(devices);
    }

    public async Task<DeviceDto?> GetDeviceByIdAsync(string id)
    {
        var device = await _context.Devices.FindAsync(id);
        return device != null ? _mapper.Map<DeviceDto>(device) : null;
    }

    public async Task<DeviceDto?> UpdateDeviceAsync(string id, UpdateDeviceDto updateDeviceDto)
    {
        var device = await _context.Devices.FindAsync(id);
        if (device == null)
        {
            return null;
        }

        _mapper.Map(updateDeviceDto, device);
        await _context.SaveChangesAsync();

        return _mapper.Map<DeviceDto>(device);
    }

    public async Task<bool> DeleteDeviceAsync(string id)
    {
        var device = await _context.Devices.FindAsync(id);
        if (device == null)
        {
            return false;
        }

        _context.Devices.Remove(device);
        await _context.SaveChangesAsync();
        return true;
    }
}