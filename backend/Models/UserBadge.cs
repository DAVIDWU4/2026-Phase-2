using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models;

[Table("user_badge")]
public class UserBadge
{
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("badge_id")]
    public int BadgeId { get; set; }

    [Column("unlocked_at")]
    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public User User { get; set; } = null!;
    [JsonIgnore]
    public Badge Badge { get; set; } = null!;
}