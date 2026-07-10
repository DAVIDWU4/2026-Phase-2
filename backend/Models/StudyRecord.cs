using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
[Table("studyRecord")]
public class StudyRecord
{
    [Key]
    public int RecordID { get; set; }
    public int rID { get; set; }
    [ForeignKey(nameof(rID))]
    public User User { get; set; } = null!;
    public DateTime Date { get; set; }
    public int Duration { get; set; } // Duration in minutes
    public string Subject { get; set; } = string.Empty;
    public int EarnedPoints { get; set; }
    public int StreakCount { get; set; }

}
