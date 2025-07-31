namespace NovaSpaceVR.API.DTOs;

public class DashboardMetricsDto
{
    public int TrainedStudents { get; set; }
    public TrendDto TrainedStudentsTrend { get; set; } = new();
    
    public int CoursesAvailable { get; set; }
    public TrendDto CoursesAvailableTrend { get; set; } = new();
    
    public int GraduatedStudents { get; set; }
    public TrendDto GraduatedStudentsTrend { get; set; } = new();
    
    public int VirtualUsersTelemetry { get; set; }
    public TrendDto VirtualUsersTelemetryTrend { get; set; } = new();
}

public class TrendDto
{
    public int Value { get; set; }
    public bool IsPositive { get; set; }
}

public class MonthlyGrowthDto
{
    public string Month { get; set; } = string.Empty;
    public int VirtualUsers { get; set; }
    public int Accounts { get; set; }
}

public class ImprovementDataDto
{
    public string Month { get; set; } = string.Empty;
    public int Improvement { get; set; }
    public int Errors { get; set; }
}