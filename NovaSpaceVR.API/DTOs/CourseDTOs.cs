using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.DTOs;

public class CourseDto
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Image { get; set; }
    public string? YoutubeUrl { get; set; }
    public int TargetSample { get; set; }
    public string TargetTime { get; set; } = string.Empty;
    public int NumberOfModules { get; set; }
    public bool IsPublic { get; set; }
    public string? OrganizationId { get; set; }
    public DateTime CreatedDate { get; set; }
    public int Enrolled { get; set; }
}

public class CreateCourseDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    public string? Image { get; set; }

    [Url]
    public string? YoutubeUrl { get; set; }
    public bool IsPublic { get; set; } = true;

    public string? OrganizationId { get; set; }
}

public class UpdateCourseDto
{
    [StringLength(200)]
    public string? Title { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    public string? Image { get; set; }

    [Url]
    public string? YoutubeUrl { get; set; }
    public bool? IsPublic { get; set; }

    public string? OrganizationId { get; set; }
}

public class CourseModuleDto
{
    public string Id { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? LongDescription { get; set; }
    public string? Thumbnail { get; set; }
    public string? YoutubeUrl { get; set; }
    public int SampleSize { get; set; }
    public int EstimatedTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}

public class CreateModuleDto
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? LongDescription { get; set; }

    public string? Thumbnail { get; set; }

    [Url]
    public string? YoutubeUrl { get; set; }
    [Range(1, 100)]
    public int SampleSize { get; set; }

    [Range(1, 300)]
    public int EstimatedTime { get; set; }

    public string Status { get; set; } = "available";
}

public class UpdateModuleDto
{
    [StringLength(200)]
    public string? Title { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(2000)]
    public string? LongDescription { get; set; }

    public string? Thumbnail { get; set; }

    [Url]
    public string? YoutubeUrl { get; set; }
    [Range(1, 100)]
    public int? SampleSize { get; set; }

    [Range(1, 300)]
    public int? EstimatedTime { get; set; }

    public string? Status { get; set; }
}