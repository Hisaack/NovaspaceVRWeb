using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.Models;

public class Course
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [MaxLength(10)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    public string? Image { get; set; }
    public string? YoutubeUrl { get; set; }
    public int TargetSample { get; set; }
    public string TargetTime { get; set; } = string.Empty;
    public int NumberOfModules { get; set; }
    public bool IsPublic { get; set; } = true;
    public string? OrganizationId { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ApplicationUser? Organization { get; set; }
    public virtual ICollection<CourseModule> Modules { get; set; } = new List<CourseModule>();
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public virtual ICollection<TrainingData> TrainingData { get; set; } = new List<TrainingData>();
}