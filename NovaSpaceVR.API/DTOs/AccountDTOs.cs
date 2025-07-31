using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.DTOs;

public class AccountDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool IsAccountGeneralPublic { get; set; }
    public int CapacityPool { get; set; }
    public DateTime CreatedDate { get; set; }
    public string? DeviceId { get; set; }
    public bool EmailConfirmed { get; set; }
    public string Role { get; set; } = string.Empty;
}

public class UpdateAccountDto
{
    public bool? IsActive { get; set; }
    public bool? TwoFactorEnabled { get; set; }
    public bool? IsAccountGeneralPublic { get; set; }
    public int? CapacityPool { get; set; }
}