using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models;

[Table("badge")]
public class Badge
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(255)]
    [Column("icon")]
    public string Icon { get; set; } = string.Empty;

    [MaxLength(300)]
    [Column("description")]
    public string Description { get; set; } = string.Empty;


    [Column("required_score")]
    public int RequiredScore { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
}