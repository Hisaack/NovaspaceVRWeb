using NovaSpaceVR.API.DTOs;

namespace NovaSpaceVR.API.Services;

public interface IAccountService
{
    Task<IEnumerable<AccountDto>> GetAllAccountsAsync();
    Task<AccountDto?> GetAccountByIdAsync(string id);
    Task<AccountDto?> UpdateAccountAsync(string id, UpdateAccountDto updateAccountDto);
    Task<bool> DeleteAccountAsync(string id);
}