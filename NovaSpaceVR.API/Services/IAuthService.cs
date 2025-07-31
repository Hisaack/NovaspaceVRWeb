using NovaSpaceVR.API.DTOs;

namespace NovaSpaceVR.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<bool> VerifyEmailAsync(VerifyEmailDto verifyEmailDto);
    Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto);
    Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);
    Task<AuthResponseDto> VirtualUserLoginAsync(VirtualUserLoginDto virtualUserLoginDto);
    Task<bool> VerifyVirtualUserOtpAsync(VerifyVirtualUserOtpDto verifyOtpDto);
    Task<string> GenerateJwtTokenAsync(string userId, string email, IList<string> roles);
    Task<bool> ValidateTokenAsync(string token);
}