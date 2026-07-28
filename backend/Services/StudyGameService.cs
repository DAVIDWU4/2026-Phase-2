using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class StudyGameService(AppDbContext dbContext)
{
    private readonly AppDbContext _db = dbContext;

    /// <summary>
    /// Process submitted study record:
    /// Save record, calculate score based on duration, add earned score to user, create score log, unlock eligible badges
    /// </summary>
    /// <param name="record">User submitted study session</param>
    /// <returns>Saved study record entity</returns>
    /// <exception cref="KeyNotFoundException">User does not exist</exception>
    public async Task<StudyRecord> SubmitStudyRecordAsync(StudyRecord record)
    {
        _db.StudyRecords.Add(record);

        var user = await _db.Users.FindAsync(record.UserId);
        if (user is null)
        {
            throw new KeyNotFoundException("The specified user cannot be found.");
        }

        // Calculate score: 1 point per 10 minutes of study
        int earnedScore = record.DurationMinutes / 10;
        record.EarnedScore = earnedScore;

        // Calculate streak
        record.StreakCount = await CalculateStreakAsync(user.Id, record.StudyDate);

        user.TotalScore += earnedScore;

        var scoreEntry = new ScoreEntry
        {
            UserId = user.Id,
            Amount = record.EarnedScore,
            CreatedAt = DateTime.UtcNow,
            Reason = "Completed study session"
        };
        _db.Scores.Add(scoreEntry);

        var allBadges = await _db.Badges.ToListAsync();
        foreach (var badge in allBadges)
        {
            if (user.TotalScore >= badge.RequiredScore)
            {
                bool alreadyUnlocked = await _db.UserBadges
                    .AnyAsync(ub => ub.UserId == user.Id && ub.BadgeId == badge.Id);

                if (!alreadyUnlocked)
                {
                    _db.UserBadges.Add(new UserBadge
                    {
                        UserId = user.Id,
                        BadgeId = badge.Id,
                        UnlockedAt = DateTime.UtcNow
                    });
                }
            }
        }

        await _db.SaveChangesAsync();
        return record;
    }


    public async Task<List<StudyRecord>> GetAllStudyRecordsAsync()
    {
        return await _db.StudyRecords.ToListAsync();
    }

    public async Task<StudyRecord?> GetStudyRecordByIdAsync(int id)
    {
        return await _db.StudyRecords.FindAsync(id);
    }


    public async Task<List<StudyRecord>> GetStudyRecordsByUserIdAsync(int userId)
    {
        return await _db.StudyRecords
            .Where(r => r.UserId == userId)
           .ToListAsync();
    }



    public async Task<bool> UpdateStudyRecordAsync(int id, StudyRecord updatedRecord)
    {
        var entity = await _db.StudyRecords.FindAsync(id);
        if (entity is null) return false;

        entity.Subject = updatedRecord.Subject;
        entity.DurationMinutes = updatedRecord.DurationMinutes;
        entity.EarnedScore = updatedRecord.EarnedScore;
        entity.StudyDate = updatedRecord.StudyDate;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteStudyRecordAsync(int id)
    {
        var entity = await _db.StudyRecords.FindAsync(id);
        if (entity is null) return false;

        _db.StudyRecords.Remove(entity);
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Calculate the current streak count for a user based on their study history
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="currentDate">The date of the current study record</param>
    /// <returns>The streak count</returns>
    private async Task<int> CalculateStreakAsync(int userId, DateTime currentDate)
    {
        int streak = 1;
        
        // Get all study records for the user, ordered by date descending
        var records = await _db.StudyRecords
            .Where(r => r.UserId == userId && r.StudyDate < currentDate)
            .OrderByDescending(r => r.StudyDate)
            .ToListAsync();

        DateTime previousDate = currentDate.Date;
        
        foreach (var record in records)
        {
            DateTime recordDate = record.StudyDate.Date;
            TimeSpan difference = previousDate - recordDate;
            
            // If the previous record is exactly one day before, continue the streak
            if (difference.Days == 1)
            {
                streak++;
                previousDate = recordDate;
            }
            // If there's a gap larger than one day, break the streak
            else if (difference.Days > 1)
            {
                break;
            }
            // If same day, skip (don't increment streak)
        }

        return streak;
    }
}