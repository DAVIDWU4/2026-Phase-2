using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class StudyGameService(AppDbContext dbContext)
{
    private readonly AppDbContext _db = dbContext;

    /// <summary>
    /// Process submitted study record:
    /// Save record, add earned score to user, create score log, unlock eligible badges
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

        user.TotalScore += record.EarnedScore;

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
}