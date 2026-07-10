using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("badge")]
public class Badge
{
    [Key]
    public int BadgeID { get; set; }
    [Required]
    [MaxLength(50)]
    public string BadgeName { get; set; } = string.Empty;
    [MaxLength(255)]
    public string BadgeImage { get; set; } = string.Empty;
    [MaxLength(300)]
    public string BadgeDescription { get; set; } = string.Empty;
    public int BadgePoints { get; set; }

    public List<User> Users { get; set; } = new List<User>();
}