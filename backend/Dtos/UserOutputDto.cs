namespace backend.Dtos;

public class UserOutputDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int TotalScore { get; set; }
    public int Level { get; set; }
    public int StreakDays { get; set; }
    public DateTime? LastStudyDate { get; set; }
    public DateTime CreatedAt { get; set; }
}