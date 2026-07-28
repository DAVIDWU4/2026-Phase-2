using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace backend.Services;

public sealed class PasswordResetService
{
    private readonly ConcurrentDictionary<string, PasswordResetEntry> _store = new();

    public string CreateResetCode(string email)
    {
        var normalizedEmail = NormalizeEmail(email);
        var code = GenerateNumericCode(6);
        var entry = new PasswordResetEntry(code, DateTime.UtcNow.AddMinutes(10));
        _store[normalizedEmail] = entry;
        return code;
    }

    public bool ValidateResetCode(string email, string code)
    {
        var normalizedEmail = NormalizeEmail(email);
        if (!_store.TryGetValue(normalizedEmail, out var entry))
        {
            return false;
        }

        if (DateTime.UtcNow > entry.ExpiresAt)
        {
            _store.TryRemove(normalizedEmail, out _);
            return false;
        }

        if (!string.Equals(entry.Code, code?.Trim(), StringComparison.Ordinal))
        {
            return false;
        }

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
