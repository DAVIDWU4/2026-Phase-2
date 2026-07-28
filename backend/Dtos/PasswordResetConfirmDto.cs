using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class PasswordResetConfirmDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Code { get; set; } = string.Empty;

    [Required]
    public string NewPassword { get; set; } = string.Empty;
}
