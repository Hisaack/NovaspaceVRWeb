using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.Models;

public class GraduatedUser
{
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    public string VirtualUserId { get; set; } = string.Empty;
    
    [Required]
    public string CourseId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string CertificateId { get; set; } = string.Empty;
    
    public DateTime DateIssued { get; set; } = DateTime.UtcNow;
    public bool CertificateSent { get; set; } = false;
    
    // Navigation properties
    public virtual VirtualUser VirtualUser { get; set; } = null!;
    public virtual Course Course { get; set; } = null!;
}