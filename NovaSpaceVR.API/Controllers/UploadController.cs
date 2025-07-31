using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaSpaceVR.API.DTOs;

namespace NovaSpaceVR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<UploadController> _logger;

    public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    [HttpPost("image")]
    public async Task<ActionResult<ImageUploadResponseDto>> UploadImage([FromForm] ImageUploadDto uploadDto)
    {
        try
        {
            // Validate input
            if (uploadDto.Image == null || uploadDto.Image.Length == 0)
            {
                return BadRequest(new { message = "No image file provided" });
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(uploadDto.Image.ContentType.ToLower()))
            {
                return BadRequest(new { message = "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image." });
            }

            // Validate file size (5MB limit)
            const long maxSize = 5 * 1024 * 1024; // 5MB
            if (uploadDto.Image.Length > maxSize)
            {
                return BadRequest(new { message = "File size too large. Please upload an image smaller than 5MB." });
            }

            // Validate folder
            var allowedFolders = new[] { "courses", "modules" };
            if (string.IsNullOrEmpty(uploadDto.Folder) || !allowedFolders.Contains(uploadDto.Folder.ToLower()))
            {
                return BadRequest(new { message = "Invalid folder. Must be 'courses' or 'modules'." });
            }

            // Generate filename if not provided
            var filename = uploadDto.Filename;
            if (string.IsNullOrEmpty(filename))
            {
                var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                var randomString = Guid.NewGuid().ToString("N")[..10];
                var extension = Path.GetExtension(uploadDto.Image.FileName)?.ToLower() ?? ".jpg";
                filename = $"{uploadDto.Folder}_{timestamp}_{randomString}{extension}";
            }

            // Ensure safe filename
            filename = Path.GetFileName(filename);

            // Create upload directory structure
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads");
            var folderPath = Path.Combine(uploadsPath, uploadDto.Folder.ToLower());

            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Full file path
            var filePath = Path.Combine(folderPath, filename);

            // Check if file already exists and generate new name if needed
            var counter = 1;
            var originalFilename = filename;
            while (System.IO.File.Exists(filePath))
            {
                var nameWithoutExt = Path.GetFileNameWithoutExtension(originalFilename);
                var extension = Path.GetExtension(originalFilename);
                filename = $"{nameWithoutExt}_{counter}{extension}";
                filePath = Path.Combine(folderPath, filename);
                counter++;
            }

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await uploadDto.Image.CopyToAsync(stream);
            }

            // Return the URL
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var imageUrl = $"{baseUrl}/uploads/{uploadDto.Folder.ToLower()}/{filename}";

            _logger.LogInformation("Image uploaded successfully: {ImageUrl}", imageUrl);

            return Ok(new ImageUploadResponseDto
            {
                Success = true,
                Url = imageUrl,
                Message = "Image uploaded successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image");
            return StatusCode(500, new { message = "Internal server error during image upload" });
        }
    }

    [HttpDelete("image/{filename}")]
    public ActionResult DeleteImage(string filename, [FromQuery] string folder = "")
    {
        try
        {
            if (string.IsNullOrEmpty(filename))
            {
                return BadRequest(new { message = "Filename is required" });
            }

            // Ensure safe filename
            filename = Path.GetFileName(filename);

            // If folder is not specified, try to determine from filename
            if (string.IsNullOrEmpty(folder))
            {
                if (filename.StartsWith("course_"))
                    folder = "courses";
                else if (filename.StartsWith("modules_"))
                    folder = "modules";
                else
                    return BadRequest(new { message = "Cannot determine folder from filename" });
            }

            var folderPath = Path.Combine(_environment.WebRootPath, "uploads", folder.ToLower());
            var filePath = Path.Combine(folderPath, filename);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
                _logger.LogInformation("Image deleted successfully: {FilePath}", filePath);
                return Ok(new { message = "Image deleted successfully" });
            }

            return NotFound(new { message = "Image not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image: {Filename}", filename);
            return StatusCode(500, new { message = "Internal server error during image deletion" });
        }
    }

    [HttpGet("image/{folder}/{filename}")]
    public ActionResult GetImage(string folder, string filename)
    {
        try
        {
            // Validate folder
            var allowedFolders = new[] { "courses", "modules" };
            if (!allowedFolders.Contains(folder.ToLower()))
            {
                return BadRequest(new { message = "Invalid folder" });
            }

            // Ensure safe filename
            filename = Path.GetFileName(filename);

            var folderPath = Path.Combine(_environment.WebRootPath, "uploads", folder.ToLower());
            var filePath = Path.Combine(folderPath, filename);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound();
            }

            var contentType = GetContentType(filename);
            var fileBytes = System.IO.File.ReadAllBytes(filePath);

            return File(fileBytes, contentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error serving image: {Folder}/{Filename}", folder, filename);
            return StatusCode(500);
        }
    }

    private static string GetContentType(string filename)
    {
        var extension = Path.GetExtension(filename).ToLower();
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };
    }
}