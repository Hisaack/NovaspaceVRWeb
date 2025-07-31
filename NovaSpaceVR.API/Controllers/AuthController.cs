using Microsoft.AspNetCore.Mvc;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Services;

namespace NovaSpaceVR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("verify-email")]
    public async Task<ActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        var result = await _authService.VerifyEmailAsync(verifyEmailDto);
        
        if (!result)
        {
            return BadRequest(new { message = "Invalid verification code" });
        }

        return Ok(new { message = "Email verified successfully" });
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
    {
        var result = await _authService.ForgotPasswordAsync(forgotPasswordDto);
        
        if (!result)
        {
            return BadRequest(new { message = "User not found" });
        }

        return Ok(new { message = "Password reset code sent to your email" });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
    {
        var result = await _authService.ResetPasswordAsync(resetPasswordDto);
        
        if (!result)
        {
            return BadRequest(new { message = "Invalid verification code or password reset failed" });
        }

        return Ok(new { message = "Password reset successfully" });
    }

    [HttpPost("virtual-user-login")]
    public async Task<ActionResult<AuthResponseDto>> VirtualUserLogin([FromBody] VirtualUserLoginDto virtualUserLoginDto)
    {
        var result = await _authService.VirtualUserLoginAsync(virtualUserLoginDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("verify-virtual-user-otp")]
    public async Task<ActionResult> VerifyVirtualUserOtp([FromBody] VerifyVirtualUserOtpDto verifyOtpDto)
    {
        var result = await _authService.VerifyVirtualUserOtpAsync(verifyOtpDto);
        
        if (!result)
        {
            return BadRequest(new { message = "Invalid verification code" });
        }

        return Ok(new { message = "Virtual user verified successfully" });
    }

    [HttpPost("validate-token")]
    public async Task<ActionResult> ValidateToken([FromBody] ValidateTokenDto validateTokenDto)
    {
        var result = await _authService.ValidateTokenAsync(validateTokenDto.Token);
        
        if (!result)
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        return Ok(new { message = "Token is valid" });
    }
}