using System.ComponentModel.DataAnnotations;

namespace NovaSpaceVR.API.DTOs;

public class TrainingDataDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string UserCode { get; set; } = string.Empty;
    public string TrainedTime { get; set; } = string.Empty;
    public string ElapsedTime { get; set; } = string.Empty;
    public int AccumulatedSample { get; set; }
    public string CourseCode { get; set; } = string.Empty;
    public DateTime TrainingDate { get; set; }
    public bool IsCompleted { get; set; }
}

public class TrainingStepsDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string CourseCode { get; set; } = string.Empty;
    public List<StepDataDto> StepsData { get; set; } = new();
    public List<TimeDataDto> TimeData { get; set; } = new();
    public List<SummaryDataDto> SummaryData { get; set; } = new();
}

public class StepDataDto
{
    public int Step { get; set; }
    public decimal ErrorRate { get; set; }
    public decimal SuccessRate { get; set; }
}

public class TimeDataDto
{
    public int Step { get; set; }
    public int ElapsedTime { get; set; }
    public int ExpectedTime { get; set; }
}

public class SummaryDataDto
{
    public int StepNumber { get; set; }
    public string ElapsedTime { get; set; } = string.Empty;
    public string ExpectedTime { get; set; } = string.Empty;
    public int ErrorSum { get; set; }
    public string ErrorRate { get; set; } = string.Empty;
    public string ErrorSummary { get; set; } = string.Empty;
    public string SuccessRate { get; set; } = string.Empty;
}

public class GraduatedUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string UserCode { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public DateTime DateIssued { get; set; }
    public string CertificateId { get; set; } = string.Empty;
    public bool CertificateSent { get; set; }
}

public class CreateGraduatedUserDto
{
    [Required]
    public string VirtualUserId { get; set; } = string.Empty;

    [Required]
    public string CourseId { get; set; } = string.Empty;
}