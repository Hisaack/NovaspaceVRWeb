using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NovaSpaceVR.API.Data;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Services;

public class VirtualUserService : IVirtualUserService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IAlertService _alertService;

    public VirtualUserService(ApplicationDbContext context, IMapper mapper, IAlertService alertService)
    {
        _context = context;
        _mapper = mapper;
        _alertService = alertService;
    }

    public async Task<IEnumerable<VirtualUserDto>> GetAllAsync()
    {
        var virtualUsers = await _context.VirtualUsers
            .Include(vu => vu.Account)
            .ToListAsync();

        return _mapper.Map<IEnumerable<VirtualUserDto>>(virtualUsers);
    }

    public async Task<IEnumerable<VirtualUserDto>> GetByAccountIdAsync(string accountId)
    {
        var virtualUsers = await _context.VirtualUsers
            .Where(vu => vu.AccountId == accountId)
            .Include(vu => vu.Account)
            .ToListAsync();

        return _mapper.Map<IEnumerable<VirtualUserDto>>(virtualUsers);
    }

    public async Task<VirtualUserDto?> GetByIdAsync(string id)
    {
        var virtualUser = await _context.VirtualUsers
            .Include(vu => vu.Account)
            .FirstOrDefaultAsync(vu => vu.Id == id);

        return virtualUser != null ? _mapper.Map<VirtualUserDto>(virtualUser) : null;
    }

    public async Task<VirtualUserDto?> GetByEmailAsync(string email)
    {
        var virtualUser = await _context.VirtualUsers
            .Include(vu => vu.Account)
            .FirstOrDefaultAsync(vu => vu.Email == email);

        return virtualUser != null ? _mapper.Map<VirtualUserDto>(virtualUser) : null;
    }

    public async Task<VirtualUserDto?> GetByOrganizationAndCodeAsync(string organizationName, string userCode)
    {
        var virtualUser = await _context.VirtualUsers
            .Include(vu => vu.Account)
            .FirstOrDefaultAsync(vu => 
                vu.Account.OrganizationName.ToLower() == organizationName.ToLower() && 
                vu.UserCode.ToLower() == userCode.ToLower());

        return virtualUser != null ? _mapper.Map<VirtualUserDto>(virtualUser) : null;
    }

    public async Task<VirtualUserDto> CreateAsync(CreateVirtualUserDto createVirtualUserDto, string accountId)
    {
        var virtualUser = _mapper.Map<VirtualUser>(createVirtualUserDto);
        virtualUser.AccountId = accountId;
        virtualUser.UserCode = await GenerateUniqueUserCodeAsync();

        _context.VirtualUsers.Add(virtualUser);
        await _context.SaveChangesAsync();

        // Send alert
        await _alertService.CreateAlertAsync(new CreateAlertDto
        {
            AccountId = accountId,
            Type = "user",
            Title = "New Virtual User Added",
            Message = $"{virtualUser.Name} has been added to the system"
        });

        return _mapper.Map<VirtualUserDto>(virtualUser);
    }

    public async Task<IEnumerable<VirtualUserDto>> CreateBulkAsync(IEnumerable<CreateVirtualUserDto> createVirtualUserDtos, string accountId)
    {
        var virtualUsers = new List<VirtualUser>();

        foreach (var dto in createVirtualUserDtos)
        {
            var virtualUser = _mapper.Map<VirtualUser>(dto);
            virtualUser.AccountId = accountId;
            virtualUser.UserCode = await GenerateUniqueUserCodeAsync();
            virtualUsers.Add(virtualUser);
        }

        _context.VirtualUsers.AddRange(virtualUsers);
        await _context.SaveChangesAsync();

        // Send bulk alert
        await _alertService.CreateAlertAsync(new CreateAlertDto
        {
            AccountId = accountId,
            Type = "user",
            Title = "Bulk Virtual Users Added",
            Message = $"{virtualUsers.Count} virtual users have been added to the system"
        });

        return _mapper.Map<IEnumerable<VirtualUserDto>>(virtualUsers);
    }

    public async Task<VirtualUserDto?> UpdateAsync(string id, UpdateVirtualUserDto updateVirtualUserDto)
    {
        var virtualUser = await _context.VirtualUsers.FindAsync(id);
        if (virtualUser == null)
        {
            return null;
        }

        _mapper.Map(updateVirtualUserDto, virtualUser);
        await _context.SaveChangesAsync();

        return _mapper.Map<VirtualUserDto>(virtualUser);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var virtualUser = await _context.VirtualUsers.FindAsync(id);
        if (virtualUser == null)
        {
            return false;
        }

        _context.VirtualUsers.Remove(virtualUser);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateLastLoginAsync(string id)
    {
        var virtualUser = await _context.VirtualUsers.FindAsync(id);
        if (virtualUser == null)
        {
            return false;
        }

        virtualUser.LastLogin = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<string> GenerateUniqueUserCodeAsync()
    {
        string code;
        do
        {
            code = "U" + new Random().Next(1000, 9999).ToString();
        } while (await _context.VirtualUsers.AnyAsync(vu => vu.UserCode == code));

        return code;
    }
}