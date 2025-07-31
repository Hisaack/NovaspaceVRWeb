namespace NovaSpaceVR.API.Services;

public interface IEmailService
{
    Task<bool> SendOtpEmailAsync(string email, string otpCode, string subject);
    Task<bool> SendCertificateEmailAsync(string email, string userName, string courseName, byte[] certificatePdf);
    Task<bool> SendWelcomeEmailAsync(string email, string userName);
}