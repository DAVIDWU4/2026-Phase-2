using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class StudyTask
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(20)]
    public string Difficulty { get; set; } = "Easy"; // Easy / Medium / Hard

    public int ExpReward { get; set; } = 10;

    public bool IsCompleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }
}