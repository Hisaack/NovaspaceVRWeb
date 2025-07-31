namespace NovaSpaceVR.API.Services;

public interface IOtpService
{
    Task<string> GenerateOtpAsync(string email, string purpose);
    Task<bool> ValidateOtpAsync(string email, string code, string purpose);
    Task CleanupExpiredOtpsAsync();
}