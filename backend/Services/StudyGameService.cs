using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class StudyGameService(AppDbContext dbContext)
{
    public const string CheckinNote = "study-checkin";

    private readonly AppDbContext _db = dbContext;

    public sealed record UserStudyStats(
        int TotalMinutes,
        int DistinctSubjectCount,
        int DistinctStudyDays,
        int StreakDays,
        int QualifyingSessionCount);

    /// <summary>
    /// Process submitted study record: save, score, update user metrics, reconcile badges.
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

        await ReconcileUserBadgesAsync(user.Id);
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

        var user = await _db.Users.FindAsync(entity.UserId);
        if (user is not null)
        {
            var newEarned = updatedRecord.DurationMinutes / 10;
            user.TotalScore = Math.Max(0, user.TotalScore - entity.EarnedScore + newEarned);
            user.Level = Math.Max(1, user.TotalScore / 100 + 1);
            entity.EarnedScore = newEarned;
        }

        entity.Subject = updatedRecord.Subject;
        entity.DurationMinutes = updatedRecord.DurationMinutes;
        entity.StudyDate = updatedRecord.StudyDate;
        entity.Notes = updatedRecord.Notes;

        await RecalculateUserStudyMetricsAsync(entity.UserId);
        await ReconcileUserBadgesAsync(entity.UserId);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteStudyRecordAsync(int id)
    {
        var entity = await _db.StudyRecords.FindAsync(id);
        if (entity is null) return false;

        var userId = entity.UserId;
        var user = await _db.Users.FindAsync(userId);
        if (user is not null)
        {
            user.TotalScore = Math.Max(0, user.TotalScore - entity.EarnedScore);
            user.Level = Math.Max(1, user.TotalScore / 100 + 1);
        }

        _db.StudyRecords.Remove(entity);
        await RecalculateUserStudyMetricsAsync(userId);
        await ReconcileUserBadgesAsync(userId);
        await _db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Recompute badge unlock state from current study records and user score.
    /// Removes stale unlocks and adds newly eligible badges.
    /// </summary>
    public async Task ReconcileUserBadgesAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return;

        var stats = await GetUserStudyStatsAsync(userId);
        var existingBadges = await _db.UserBadges
            .Where(ub => ub.UserId == userId)
            .ToListAsync();
        var existingIds = existingBadges.Select(ub => ub.BadgeId).ToHashSet();

        var allBadges = await _db.Badges.ToListAsync();
        foreach (var badge in allBadges)
        {
            var eligible = IsBadgeEligible(badge, user, stats);
            var hasBadge = existingIds.Contains(badge.Id);

            if (eligible && !hasBadge)
            {
                _db.UserBadges.Add(new UserBadge
                {
                    UserId = userId,
                    BadgeId = badge.Id,
                    UnlockedAt = DateTime.UtcNow
                });
            }
            else if (!eligible && hasBadge)
            {
                var stale = existingBadges.First(ub => ub.BadgeId == badge.Id);
                _db.UserBadges.Remove(stale);
            }
        }
    }

    public async Task<UserStudyStats> GetUserStudyStatsAsync(int userId)
    {
        var qualifying = await QualifyingRecords(_db.StudyRecords.Where(r => r.UserId == userId))
            .ToListAsync();

        var totalMinutes = qualifying.Sum(r => r.DurationMinutes);
        var distinctSubjects = qualifying.Select(r => r.Subject).Distinct().Count();
        var distinctStudyDays = qualifying.Select(r => r.StudyDate.Date).Distinct().Count();
        var streakDays = CalculateStreakFromDates(
            qualifying.Select(r => r.StudyDate.Date).Distinct().ToList());

        return new UserStudyStats(
            totalMinutes,
            distinctSubjects,
            distinctStudyDays,
            streakDays,
            qualifying.Count);
    }

    private async Task RecalculateUserStudyMetricsAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return;

        var allRecords = await _db.StudyRecords
            .Where(r => r.UserId == userId)
            .ToListAsync();

        user.LastStudyDate = allRecords.Count > 0
            ? allRecords.Max(r => r.StudyDate)
            : null;

        var streakDates = allRecords.Select(r => r.StudyDate.Date).Distinct().ToList();
        user.StreakDays = CalculateStreakFromDates(streakDates);
    }

    private static IQueryable<StudyRecord> QualifyingRecords(IQueryable<StudyRecord> query)
    {
        return query.Where(r => r.Notes != CheckinNote);
    }

    private static int CalculateStreakFromDates(List<DateTime> dates)
    {
        if (dates.Count == 0) return 0;

        var ordered = dates.Distinct().OrderByDescending(d => d).ToList();
        var streak = 1;
        for (var i = 1; i < ordered.Count; i++)
        {
            if ((ordered[i - 1] - ordered[i]).Days == 1)
                streak++;
            else
                break;
        }

        return streak;
    }

    private static bool IsBadgeEligible(Badge badge, User user, UserStudyStats stats)
    {
        if (badge.RequiredScore > 0)
            return user.TotalScore >= badge.RequiredScore;

        return badge.Id switch
        {
            1 => stats.QualifyingSessionCount >= 1,
            6 => stats.StreakDays >= 3,
            7 => stats.StreakDays >= 7,
            8 => stats.StreakDays >= 15,
            9 => stats.StreakDays >= 30,
            10 => stats.TotalMinutes >= 60,
            11 => stats.TotalMinutes >= 300,
            12 => stats.TotalMinutes >= 600,
            13 => stats.DistinctSubjectCount >= 3,
            14 => stats.DistinctSubjectCount >= 5,
            15 => stats.DistinctStudyDays >= 100,
            _ => false
        };
    }

    private async Task<int> CalculateStreakAsync(int userId, DateTime currentDate)
    {
        var records = await _db.StudyRecords
            .Where(r => r.UserId == userId && r.StudyDate < currentDate)
            .OrderByDescending(r => r.StudyDate)
            .ToListAsync();

        var streak = 1;
        var previousDate = currentDate.Date;

        foreach (var record in records)
        {
            var recordDate = record.StudyDate.Date;
            var difference = previousDate - recordDate;

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
