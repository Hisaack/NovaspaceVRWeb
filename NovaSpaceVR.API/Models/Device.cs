using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.Models;

public class Device
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(100)]
    public string DeviceName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Brand { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Model { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Country { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string Ram { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string Storage { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string Status { get; set; } = "Active"; // Active, Blocked
    
    [MaxLength(50)]
    public string OsVersion { get; set; } = string.Empty;
    
    public DateTime LastSeen { get; set; } = DateTime.UtcNow;
    
    [MaxLength(20)]
    public string? UserId { get; set; }
    
    [Required]
    public string AccountId { get; set; } = string.Empty;
    
    // Navigation properties
    public virtual ApplicationUser Account { get; set; } = null!;
}