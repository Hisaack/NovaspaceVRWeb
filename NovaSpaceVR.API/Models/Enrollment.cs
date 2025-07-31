using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.Models;

public class Enrollment
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    public string VirtualUserId { get; set; } = string.Empty;
    
    [Required]
    public string CourseId { get; set; } = string.Empty;
    
    [Required]
    public string AccountId { get; set; } = string.Empty;
    
    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
    public int Progress { get; set; } = 0; // 0-100
    public string Status { get; set; } = "In Progress"; // In Progress, Completed
    
    // Navigation properties
    public virtual VirtualUser VirtualUser { get; set; } = null!;
    public virtual Course Course { get; set; } = null!;
    public virtual ApplicationUser Account { get; set; } = null!;
}