using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class CreateStudyRecordDto
{
    [Required]
    public int UserId { get; set; }

    public DateTime StudyDate { get; set; } = DateTime.UtcNow;

    [Range(1, int.MaxValue, ErrorMessage = "Duration must be at least 1 minute.")]
    public int DurationMinutes { get; set; }

    [Required]
    [MaxLength(100)]
    public string Subject { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Notes { get; set; }
}
