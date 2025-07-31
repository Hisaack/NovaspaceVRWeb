using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.Models;

public class VirtualUser
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(20)]
    public string UserCode { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string AccountId { get; set; } = string.Empty;
    
    public string Stage { get; set; } = string.Empty;
    public DateTime DateAdded { get; set; } = DateTime.UtcNow;
    public DateTime? LastLogin { get; set; }
    public int CoursesCompleted { get; set; } = 0;
    public string TotalTrainingTime { get; set; } = "0h 0m";
    public decimal AverageScore { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual ApplicationUser Account { get; set; } = null!;
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public virtual ICollection<TrainingData> TrainingData { get; set; } = new List<TrainingData>();
    public virtual ICollection<GraduatedUser> GraduatedCourses { get; set; } = new List<GraduatedUser>();
}