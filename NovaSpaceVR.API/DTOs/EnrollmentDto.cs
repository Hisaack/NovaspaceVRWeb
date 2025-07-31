using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.DTOs
{
    public class EnrollmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string VirtualUserId { get; set; } = string.Empty;
        public string CourseId { get; set; } = string.Empty;
        public string AccountId { get; set; } = string.Empty;
        public string VirtualUserName { get; set; } = string.Empty;
        public string CourseTitle { get; set; } = string.Empty;
        public string UserCode { get; set; } = string.Empty;
        public DateTime EnrollmentDate { get; set; }
        public int Progress { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CreateEnrollmentDto
    {
        [Required]
        public string VirtualUserId { get; set; } = string.Empty;

        [Required]
        public string CourseId { get; set; } = string.Empty;

        [Range(0, 100)]
        public int Progress { get; set; } = 0;

        public string Status { get; set; } = "In Progress";
    }

    public class UpdateEnrollmentDto
    {
        [Range(0, 100)]
        public int? Progress { get; set; }

        public string? Status { get; set; }
    }
}
