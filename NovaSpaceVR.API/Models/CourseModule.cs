using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.Models;

public class CourseModule
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    public string CourseId { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? LongDescription { get; set; }

    public string? Thumbnail { get; set; }
    public string? YoutubeUrl { get; set; }
    public int SampleSize { get; set; }
    public int EstimatedTime { get; set; } // in minutes
    public string Status { get; set; } = "available"; // available, coming-soon
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Course Course { get; set; } = null!;
}