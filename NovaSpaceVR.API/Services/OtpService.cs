using Microsoft.EntityFrameworkCore;
using NovaSpaceVR.API.Data;
using NovaSpaceVR.API.Models;

namespace NovaSpaceVR.API.Services;

public class OtpService : IOtpService
{
    private readonly ApplicationDbContext _context;

    public OtpService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateOtpAsync(string email, string purpose)
    {
        // Clean up any existing OTPs for this email and purpose
        var existingOtps = await _context.OtpCodes
            .Where(o => o.Email == email && o.Purpose == purpose)
            .ToListAsync();

        _context.OtpCodes.RemoveRange(existingOtps);

        // Generate new 6-digit OTP
        var random = new Random();
        var otpCode = random.Next(100000, 999999).ToString();

        var otp = new OtpCode
        {
            Email = email,
            Code = otpCode,
            Purpose = purpose,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            IsUsed = false
        };

        _context.OtpCodes.Add(otp);
        await _context.SaveChangesAsync();

        return otpCode;
    }

    public async Task<bool> ValidateOtpAsync(string email, string code, string purpose)
    {
        var otp = await _context.OtpCodes
            .FirstOrDefaultAsync(o =>
                o.Email == email.Trim().ToLower() &&
                o.Code == code.Trim() &&
                o.Purpose == purpose.Trim().ToLower() &&
                !o.IsUsed &&
                o.ExpiresAt >= DateTime.UtcNow);

        if (otp == null)
        {
            return false;
        }

        // Mark as used
        otp.IsUsed = true;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task CleanupExpiredOtpsAsync()
    {
        var expiredOtps = await _context.OtpCodes
            .Where(o => o.ExpiresAt <= DateTime.UtcNow || o.IsUsed)
            .ToListAsync();

        _context.OtpCodes.RemoveRange(expiredOtps);
        await _context.SaveChangesAsync();
    }
}