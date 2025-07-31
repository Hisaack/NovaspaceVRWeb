using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.Models;

public class TrainingData
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    public string VirtualUserId { get; set; } = string.Empty;
    
    [Required]
    public string CourseId { get; set; } = string.Empty;
    
    [Required]
    public string AccountId { get; set; } = string.Empty;
    
    public string TrainedTime { get; set; } = string.Empty;
    public string ElapsedTime { get; set; } = string.Empty;
    public int AccumulatedSample { get; set; }
    public DateTime TrainingDate { get; set; } = DateTime.UtcNow;
    public bool IsCompleted { get; set; } = false;
    
    // Navigation properties
    public virtual VirtualUser VirtualUser { get; set; } = null!;
    public virtual Course Course { get; set; } = null!;
    public virtual ApplicationUser Account { get; set; } = null!;
    public virtual ICollection<TrainingStep> TrainingSteps { get; set; } = new List<TrainingStep>();
}