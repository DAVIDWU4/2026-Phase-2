using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("study_record")]
public class StudyRecord
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    public User User { get; set; } = null!;

    [Column("study_date")]
    public DateTime StudyDate { get; set; } = DateTime.UtcNow;


    [Column("duration_minutes")]
    public int DurationMinutes { get; set; }

    [MaxLength(100)]
    [Column("subject")]
    public string Subject { get; set; } = string.Empty;

    [Column("earned_score")]
    public int EarnedScore { get; set; }

    [Column("streak_count")]
    public int StreakCount { get; set; }

    [MaxLength(500)]
    [Column("notes")]
    public string? Notes { get; set; }
}