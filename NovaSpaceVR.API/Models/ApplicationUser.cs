using Microsoft.AspNetCore.Identity;

namespace NovaSpaceVR.API.Models;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string OrganizationName { get; set; } = string.Empty;
    public new bool TwoFactorEnabled { get; set; } = false;
    public bool IsAccountGeneralPublic { get; set; }
    public int CapacityPool { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string? DeviceId { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
    public virtual ICollection<VirtualUser> VirtualUsers { get; set; } = new List<VirtualUser>();
    public virtual ICollection<Alert> Alerts { get; set; } = new List<Alert>();
}