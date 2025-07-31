using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using NovaSpaceVR.API.DTOs;
using NovaSpaceVR.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace NovaSpaceVR.API.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly IOtpService _otpService;
    private readonly IEmailService _emailService;
    private readonly IVirtualUserService _virtualUserService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        IOtpService otpService,
        IEmailService emailService,
        IVirtualUserService virtualUserService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _otpService = otpService;
        _emailService = emailService;
        _virtualUserService = virtualUserService;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null)
        {
            return new AuthResponseDto { Success = false, Message = "Invalid email or password" };
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
        if (!result.Succeeded)
        {
            return new AuthResponseDto { Success = false, Message = "Invalid email or password" };
        }

        // Check if 2FA is enabled
        if (user.TwoFactorEnabled)
        {
            // Generate and send OTP
            var otpCode = await _otpService.GenerateOtpAsync(user.Email, "login");
            await _emailService.SendOtpEmailAsync(user.Email, otpCode, "Login Verification");
            
            return new AuthResponseDto 
            { 
                Success = true, 
                RequiresTwoFactor = true,
                Message = "OTP sent to your email" 
            };
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = await GenerateJwtTokenAsync(user.Id, user.Email!, roles);

        return new AuthResponseDto
        {
            Success = true,
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                OrganizationName = user.OrganizationName,
                Role = roles.FirstOrDefault() ?? "User"
            }
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
        if (existingUser != null)
        {
            return new AuthResponseDto { Success = false, Message = "User already exists" };
        }

        var user = new ApplicationUser
        {
            UserName = registerDto.UserName,
            Email = registerDto.Email,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            OrganizationName = registerDto.AccountName,
            TwoFactorEnabled = false,
            IsAccountGeneralPublic = false,
            CapacityPool = 25, // Default capacity
            CreatedDate = DateTime.UtcNow,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            return new AuthResponseDto 
            { 
                Success = false, 
                Message = string.Join(", ", result.Errors.Select(e => e.Description)) 
            };
        }

        // Assign User role by default
        await _userManager.AddToRoleAsync(user, "User");

        // Generate and send verification OTP
        var otpCode = await _otpService.GenerateOtpAsync(user.Email, "signup");
        await _emailService.SendOtpEmailAsync(user.Email, otpCode, "Email Verification");

        return new AuthResponseDto 
        { 
            Success = true, 
            Message = "Registration successful. Please check your email for verification code." 
        };
    }

    public async Task<bool> VerifyEmailAsync(VerifyEmailDto verifyEmailDto)
    {
        var isValid = await _otpService.ValidateOtpAsync(verifyEmailDto.Email, verifyEmailDto.Code, verifyEmailDto.Type);
        if (!isValid)
        {
            return false;
        }

        if (verifyEmailDto.Type == "signup")
        {
            var user = await _userManager.FindByEmailAsync(verifyEmailDto.Email);
            if (user != null)
            {
                user.EmailConfirmed = true;
                await _userManager.UpdateAsync(user);
            }
        }

        return true;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
    {
        var user = await _userManager.FindByEmailAsync(forgotPasswordDto.Email);
        if (user == null)
        {
            return false;
        }

        var otpCode = await _otpService.GenerateOtpAsync(user.Email, "forgot-password");
        await _emailService.SendOtpEmailAsync(user.Email, otpCode, "Password Reset");

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
    {      
        var user = await _userManager.FindByEmailAsync(resetPasswordDto.Email);
        if (user == null)
        {
            return false;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, resetPasswordDto.NewPassword);

        return result.Succeeded;
    }

    public async Task<AuthResponseDto> VirtualUserLoginAsync(VirtualUserLoginDto virtualUserLoginDto)
    {
        var virtualUser = await _virtualUserService.GetByOrganizationAndCodeAsync(
            virtualUserLoginDto.OrganizationName, 
            virtualUserLoginDto.UserCode);

        if (virtualUser == null)
        {
            return new AuthResponseDto 
            { 
                Success = false, 
                Message = "Virtual user not found. Please check your organization name and user code." 
            };
        }

        // Generate and send OTP
        var otpCode = await _otpService.GenerateOtpAsync(virtualUser.Email, "virtual-user");
        await _emailService.SendOtpEmailAsync(virtualUser.Email, otpCode, "Virtual User Login");

        return new AuthResponseDto 
        { 
            Success = true, 
            RequiresTwoFactor = true,
            Message = "OTP sent to your email",
            VirtualUserEmail = virtualUser.Email
        };
    }

    public async Task<bool> VerifyVirtualUserOtpAsync(VerifyVirtualUserOtpDto verifyOtpDto)
    {
        var isValid = await _otpService.ValidateOtpAsync(verifyOtpDto.Email, verifyOtpDto.Code, "virtual-user");
        if (!isValid)
        {
            return false;
        }

        // Update last login
        var virtualUser = await _virtualUserService.GetByEmailAsync(verifyOtpDto.Email);
        if (virtualUser != null)
        {
            await _virtualUserService.UpdateLastLoginAsync(virtualUser.Id);
        }

        return true;
    }

    public async Task<string> GenerateJwtTokenAsync(string userId, string email, IList<string> roles)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expiryInHours = int.Parse(jwtSettings["ExpiryInHours"]!);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryInHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        try
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(secretKey!);

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return true;
        }
        catch
        {
            return false;
        }
    }
}