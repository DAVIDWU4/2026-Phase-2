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
    public async Task<StudyRecord> SubmitStudyRecordAsync(StudyRecord record)
    {
        var user = await _db.Users.FindAsync(record.UserId);
        if (user is null)
        {
            throw new KeyNotFoundException("The specified user cannot be found.");
        }

        int earnedScore = record.DurationMinutes / 10;
        record.EarnedScore = earnedScore;
        record.StreakCount = await CalculateStreakAsync(user.Id, record.StudyDate);

        user.TotalScore += earnedScore;
        user.StreakDays = record.StreakCount;
        user.LastStudyDate = record.StudyDate;
        user.Level = Math.Max(1, user.TotalScore / 100 + 1);

        _db.StudyRecords.Add(record);

        _db.Scores.Add(new ScoreEntry
        {
            UserId = user.Id,
            Amount = record.EarnedScore,
            CreatedAt = DateTime.UtcNow,
            Reason = "Completed study session"
        });

        await UnlockEligibleBadgesAsync(user, record);
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
        entity.Notes = updatedRecord.Notes;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteStudyRecordAsync(int id)
    {
        var entity = await _db.StudyRecords.FindAsync(id);
        if (entity is null) return false;

        var user = await _db.Users.FindAsync(entity.UserId);
        if (user is not null)
        {
            user.TotalScore = Math.Max(0, user.TotalScore - entity.EarnedScore);
            user.Level = Math.Max(1, user.TotalScore / 100 + 1);
        }

        _db.StudyRecords.Remove(entity);
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task UnlockEligibleBadgesAsync(User user, StudyRecord record)
    {
        var existingBadgeIds = await _db.UserBadges
            .Where(ub => ub.UserId == user.Id)
            .Select(ub => ub.BadgeId)
            .ToHashSetAsync();

        var priorMinutes = await _db.StudyRecords
            .Where(r => r.UserId == user.Id)
            .SumAsync(r => (int?)r.DurationMinutes) ?? 0;
        var totalMinutes = priorMinutes + record.DurationMinutes;

        var priorSubjects = await _db.StudyRecords
            .Where(r => r.UserId == user.Id)
            .Select(r => r.Subject)
            .ToListAsync();
        var distinctSubjectCount = priorSubjects
            .Append(record.Subject)
            .Distinct()
            .Count();

        var priorDays = await _db.StudyRecords
            .Where(r => r.UserId == user.Id)
            .Select(r => r.StudyDate.Date)
            .ToListAsync();
        var distinctStudyDays = priorDays
            .Append(record.StudyDate.Date)
            .Distinct()
            .Count();

        var allBadges = await _db.Badges.ToListAsync();
        foreach (var badge in allBadges)
        {
            if (existingBadgeIds.Contains(badge.Id)) continue;

            if (IsBadgeEligible(badge, user, totalMinutes, distinctSubjectCount, distinctStudyDays))
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

    /// <summary>
    /// Badge eligibility rules aligned with seed data in AppDbContext.
    /// Badges with RequiredScore &gt; 0 use score thresholds; others use Id-specific rules.
    /// </summary>
    private static bool IsBadgeEligible(
        Badge badge,
        User user,
        int totalStudyMinutes,
        int distinctSubjectCount,
        int distinctStudyDays)
    {
        if (badge.RequiredScore > 0)
            return user.TotalScore >= badge.RequiredScore;

        return badge.Id switch
        {
            1 => true,  // First Step — awarded on first completed session
            6 => user.StreakDays >= 3,
            7 => user.StreakDays >= 7,
            8 => user.StreakDays >= 15,
            9 => user.StreakDays >= 30,
            10 => totalStudyMinutes >= 60,
            11 => totalStudyMinutes >= 300,
            12 => totalStudyMinutes >= 600,
            13 => distinctSubjectCount >= 3,
            14 => distinctSubjectCount >= 5,
            15 => distinctStudyDays >= 100,
            _ => false
        };
    }

    private async Task<int> CalculateStreakAsync(int userId, DateTime currentDate)
    {
        int streak = 1;

        var records = await _db.StudyRecords
            .Where(r => r.UserId == userId && r.StudyDate < currentDate)
            .OrderByDescending(r => r.StudyDate)
            .ToListAsync();

        DateTime previousDate = currentDate.Date;

        foreach (var record in records)
        {
            DateTime recordDate = record.StudyDate.Date;
            TimeSpan difference = previousDate - recordDate;

            if (difference.Days == 1)
            {
                streak++;
                previousDate = recordDate;
            }
            else if (difference.Days > 1)
            {
                break;
            }
        }

        return streak;
    }
}
