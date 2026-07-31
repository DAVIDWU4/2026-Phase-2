using System.Collections.Concurrent;
using System.Security.Cryptography;
using SendGrid;
using SendGrid.Helpers.Mail;
using Microsoft.Extensions.Configuration;

namespace backend.Services;

public sealed class PasswordResetService
{
    private readonly ConcurrentDictionary<string, PasswordResetEntry> _store = new();
    private readonly string? _sendGridKey;
    private readonly string? _senderMail;
    private readonly string _senderName;

    public PasswordResetService(IConfiguration configuration)
    {
        // Env vars use SendGrid__ApiKey; IConfiguration maps that to SendGrid:ApiKey
        _sendGridKey = configuration["SendGrid:ApiKey"] ?? configuration["SendGrid__ApiKey"];
        _senderMail = configuration["SendGrid:SenderEmail"] ?? configuration["SendGrid__SenderEmail"];
        _senderName = configuration["SendGrid:SenderName"]
            ?? configuration["SendGrid__SenderName"]
            ?? "Study Tracker";
    }

    public string CreateResetCode(string email)
    {
        var normalizedEmail = NormalizeEmail(email);
        var code = GenerateNumericCode(6);
        var entry = new PasswordResetEntry(code, DateTime.UtcNow.AddMinutes(10));
        _store[normalizedEmail] = entry;
        return code;
    }

    public async Task SendResetMailAsync(string targetEmail, string code)
    {
        Console.WriteLine($"Password reset code for {targetEmail}: {code}");

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
            PlainTextContent = $"Your reset code: {code}\nValid for 10 minutes.",
            HtmlContent = $"<h3>Password Reset</h3><p>Your verification code: <strong>{code}</strong></p><p>Valid within 10 minutes.</p>"
        };
        mail.AddTo(new EmailAddress(targetEmail));

        var response = await client.SendEmailAsync(mail);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Body.ReadAsStringAsync();
            throw new Exception($"Send mail failed: {err}");
        }
    }

    public bool ValidateResetCode(string email, string code)
    {
        var normalizedEmail = NormalizeEmail(email);
        if (!_store.TryGetValue(normalizedEmail, out var entry))
            return false;

        if (DateTime.UtcNow > entry.ExpiresAt)
        {
            _store.TryRemove(normalizedEmail, out _);
            return false;
        }

        if (!string.Equals(entry.Code, code?.Trim(), StringComparison.Ordinal))
            return false;

        _store.TryRemove(normalizedEmail, out _);
        return true;
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

internal sealed record PasswordResetEntry(string Code, DateTime ExpiresAt);
