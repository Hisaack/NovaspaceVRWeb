using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.Models;

public class TrainingStep
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    public string TrainingDataId { get; set; } = string.Empty;
    
    [Required]
    public string AccountId { get; set; } = string.Empty;
    
    public int StepNumber { get; set; }
    public int ElapsedTime { get; set; } // in minutes
    public int ExpectedTime { get; set; } // in minutes
    public int ErrorSum { get; set; }
    public decimal ErrorRate { get; set; }
    public string ErrorSummary { get; set; } = string.Empty;
    public decimal SuccessRate { get; set; }
    
    // Navigation properties
    public virtual TrainingData TrainingData { get; set; } = null!;
    public virtual ApplicationUser Account { get; set; } = null!;
}