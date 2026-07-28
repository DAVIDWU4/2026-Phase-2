using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class PasswordResetRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
