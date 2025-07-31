using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.DTOs;

public class VirtualUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string UserCode { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AccountId { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
    public DateTime DateAdded { get; set; }
    public DateTime? LastLogin { get; set; }
    public int CoursesCompleted { get; set; }
    public string TotalTrainingTime { get; set; } = string.Empty;
    public decimal AverageScore { get; set; }
    public bool IsActive { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
}

public class CreateVirtualUserDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Stage { get; set; } = string.Empty;
}

public class UpdateVirtualUserDto
{
    [StringLength(100)]
    public string? Name { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    public string? Stage { get; set; }

    public bool? IsActive { get; set; }
}

public class BulkCreateVirtualUserDto
{
    [Required]
    public List<CreateVirtualUserDto> VirtualUsers { get; set; } = new();
}