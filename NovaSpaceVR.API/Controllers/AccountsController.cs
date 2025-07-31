using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Services;

namespace NovaSpaceVR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountsController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<AccountDto>>> GetAccounts()
    {
        var accounts = await _accountService.GetAllAccountsAsync();
        return Ok(accounts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AccountDto>> GetAccount(string id)
    {
        var account = await _accountService.GetAccountByIdAsync(id);
        
        if (account == null)
        {
            return NotFound();
        }

        return Ok(account);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]

    public async Task<ActionResult<AccountDto>> UpdateAccount(string id, [FromBody] UpdateAccountDto updateAccountDto)
    {
        var account = await _accountService.UpdateAccountAsync(id, updateAccountDto);
        
        if (account == null)
        {
            return NotFound();
        }

        return Ok(account);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]

    public async Task<ActionResult> DeleteAccount(string id)
    {
        var result = await _accountService.DeleteAccountAsync(id);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}