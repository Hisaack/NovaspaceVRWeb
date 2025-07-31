using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Services;

public class AccountService : IAccountService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;

    public AccountService(UserManager<ApplicationUser> userManager, IMapper mapper)
    {
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AccountDto>> GetAllAccountsAsync()
    {
        var users = await _userManager.Users.ToListAsync();
        var accountDtos = new List<AccountDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var accountDto = _mapper.Map<AccountDto>(user);
            accountDto.Role = roles.FirstOrDefault() ?? "User";
            accountDtos.Add(accountDto);
        }

        return accountDtos;
    }

    public async Task<AccountDto?> GetAccountByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);
        var accountDto = _mapper.Map<AccountDto>(user);
        accountDto.Role = roles.FirstOrDefault() ?? "User";

        return accountDto;
    }

    public async Task<AccountDto?> UpdateAccountAsync(string id, UpdateAccountDto updateAccountDto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return null;
        }

        _mapper.Map(updateAccountDto, user);
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);
        var accountDto = _mapper.Map<AccountDto>(user);
        accountDto.Role = roles.FirstOrDefault() ?? "User";

        return accountDto;
    }

    public async Task<bool> DeleteAccountAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return false;
        }

        var result = await _userManager.DeleteAsync(user);
        return result.Succeeded;
    }
}