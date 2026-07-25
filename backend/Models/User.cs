using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("username")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("nickname")]
    public string Nickname { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    [Column("role")]
    public string Role { get; set; } = "user";

    [Column("total_score")]
    public int TotalScore { get; set; } = 0;

    [Column("level")]
    public int Level { get; set; } = 1;

    [Column("streak_days")]
    public int StreakDays { get; set; } = 0;

    [Column("last_study_date")]
    public DateTime? LastStudyDate { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
    public ICollection<StudyRecord> StudyRecords { get; set; } = new List<StudyRecord>();
    public ICollection<ScoreEntry> Scores { get; set; } = new List<ScoreEntry>();
}