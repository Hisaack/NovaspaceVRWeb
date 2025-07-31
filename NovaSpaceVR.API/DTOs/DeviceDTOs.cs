namespace NovaSpaceVR.API.DTOs;

public class DeviceDto
{
    public string Id { get; set; } = string.Empty;
    public string DeviceName { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Ram { get; set; } = string.Empty;
    public string Storage { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string OsVersion { get; set; } = string.Empty;
    public DateTime LastSeen { get; set; }
    public string? UserId { get; set; }
}

public class UpdateDeviceDto
{
    public string? Status { get; set; }
}