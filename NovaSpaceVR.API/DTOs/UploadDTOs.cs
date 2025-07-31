using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.DTOs;

public class ImageUploadDto
{
    [Required]
    public IFormFile Image { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string Folder { get; set; } = string.Empty;

    [StringLength(255)]
    public string? Filename { get; set; }
}

public class ImageUploadResponseDto
{
    public bool Success { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}