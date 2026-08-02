using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Security.Cryptography;

namespace backend.Services;

public sealed class PasswordResetService
{
    private const int CooldownSeconds = 60;
    private const int CodeExpiryMinutes = 10;

    private readonly AppDbContext _db;
    private readonly string? _sendGridKey;
    private readonly string? _senderMail;
    private readonly string _senderName;
    private readonly bool _isDevelopment;

    public PasswordResetService(
        AppDbContext db,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        _db = db;
        _isDevelopment = environment.IsDevelopment();
        _sendGridKey = configuration["SendGrid:ApiKey"] ?? configuration["SendGrid__ApiKey"];
        _senderMail = configuration["SendGrid:SenderEmail"] ?? configuration["SendGrid__SenderEmail"];
        _senderName = configuration["SendGrid:SenderName"]
            ?? configuration["SendGrid__SenderName"]
            ?? "Study Tracker";
    }

    public async Task<(bool Sent, string? Error)> TrySendResetCodeAsync(string email)
    {
        var normalizedEmail = NormalizeEmail(email);
        if (string.IsNullOrEmpty(normalizedEmail))
            return (false, "Invalid email address.");

        var existing = await _db.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.Email == normalizedEmail);

        if (existing is not null &&
            (DateTime.UtcNow - existing.CreatedAt).TotalSeconds < CooldownSeconds)
        {
            var wait = CooldownSeconds - (int)(DateTime.UtcNow - existing.CreatedAt).TotalSeconds;
            return (false, $"Please wait {wait} seconds before requesting another code.");
        }

        var code = GenerateNumericCode(6);
        var now = DateTime.UtcNow;

        if (existing is null)
        {
            _db.PasswordResetTokens.Add(new PasswordResetToken
            {
                Email = normalizedEmail,
                Code = code,
                ExpiresAt = now.AddMinutes(CodeExpiryMinutes),
                CreatedAt = now
            });
        }
        else
        {
            existing.Code = code;
            existing.ExpiresAt = now.AddMinutes(CodeExpiryMinutes);
            existing.CreatedAt = now;
        }

        await _db.SaveChangesAsync();

        try
        {
            await SendResetMailAsync(normalizedEmail, code);
            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    public async Task<bool> ValidateResetCodeAsync(string email, string code)
    {
        var normalizedEmail = NormalizeEmail(email);
        var token = await _db.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.Email == normalizedEmail);

        if (token is null)
            return false;

        if (DateTime.UtcNow > token.ExpiresAt)
        {
            _db.PasswordResetTokens.Remove(token);
            await _db.SaveChangesAsync();
            return false;
        }

        if (!string.Equals(token.Code, code?.Trim(), StringComparison.Ordinal))
            return false;

        _db.PasswordResetTokens.Remove(token);
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task SendResetMailAsync(string targetEmail, string code)
    {
        if (_isDevelopment)
        {
            Console.WriteLine($"Password reset code for {targetEmail}: {code}");
        }

        if (string.IsNullOrWhiteSpace(_sendGridKey) || string.IsNullOrWhiteSpace(_senderMail))
        {
            throw new InvalidOperationException(
                "SendGrid is not configured. Set SendGrid__ApiKey and SendGrid__SenderEmail.");
        }

        var client = new SendGridClient(_sendGridKey);
        var mail = new SendGridMessage
        {
            From = new EmailAddress(_senderMail, _senderName),
            Subject = "Password Reset Verification Code",
            PlainTextContent = $"Your reset code: {code}\nValid for {CodeExpiryMinutes} minutes.",
            HtmlContent = $"<h3>Password Reset</h3><p>Your verification code: <strong>{code}</strong></p><p>Valid within {CodeExpiryMinutes} minutes.</p>"
        };
        mail.AddTo(new EmailAddress(targetEmail));

        var response = await client.SendEmailAsync(mail);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Body.ReadAsStringAsync();
            throw new Exception($"Send mail failed: {err}");
        }
    }

    private static string GenerateNumericCode(int length)
    {
        const string digits = "0123456789";
        var result = new char[length];
        for (var i = 0; i < length; i++)
        {
            result[i] = digits[RandomNumberGenerator.GetInt32(digits.Length)];
        }
        return new string(result);
    }

    private static string NormalizeEmail(string email)
    {
        return email?.Trim().ToLowerInvariant() ?? string.Empty;
    }
}
