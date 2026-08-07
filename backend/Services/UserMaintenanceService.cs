using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

/// <summary>
/// One-time / startup maintenance for user data integrity.
/// </summary>
public static class UserMaintenanceService
{
    /// <summary>
    /// Merge users that share the same username (case-insensitive).
    /// Keeps the lowest Id, moves study/score/badge rows, then deletes duplicates.
    /// Must run before a unique Username index is applied.
    /// </summary>
    public static async Task DeduplicateUsernamesAsync(AppDbContext db)
    {
        var users = await db.Users.AsNoTracking().OrderBy(u => u.Id).ToListAsync();
        var duplicateGroups = users
            .GroupBy(u => u.Username.Trim().ToLowerInvariant())
            .Where(g => g.Count() > 1)
            .ToList();

        if (duplicateGroups.Count == 0)
        {
            Console.WriteLine("[DB] No duplicate usernames found.");
            return;
        }

        foreach (var group in duplicateGroups)
        {
            var ordered = group.OrderBy(u => u.Id).ToList();
            var keepId = ordered[0].Id;
            var removeIds = ordered.Skip(1).Select(u => u.Id).ToList();

            Console.WriteLine(
                $"[DB] Merging duplicate username '{group.Key}': keep user {keepId}, remove [{string.Join(", ", removeIds)}]");

            var keep = await db.Users.FindAsync(keepId);
            if (keep is null) continue;

            foreach (var removeId in removeIds)
            {
                var dup = await db.Users.FindAsync(removeId);
                if (dup is null) continue;

                keep.TotalScore += dup.TotalScore;
                keep.StreakDays = Math.Max(keep.StreakDays, dup.StreakDays);
                if (dup.LastStudyDate is not null
                    && (keep.LastStudyDate is null || dup.LastStudyDate > keep.LastStudyDate))
                {
                    keep.LastStudyDate = dup.LastStudyDate;
                }

                await db.StudyRecords
                    .Where(r => r.UserId == removeId)
                    .ExecuteUpdateAsync(s => s.SetProperty(r => r.UserId, keepId));

                await db.Scores
                    .Where(s => s.UserId == removeId)
                    .ExecuteUpdateAsync(s => s.SetProperty(x => x.UserId, keepId));

                var dupBadges = await db.UserBadges.Where(ub => ub.UserId == removeId).ToListAsync();
                var keepBadgeIds = await db.UserBadges
                    .Where(ub => ub.UserId == keepId)
                    .Select(ub => ub.BadgeId)
                    .ToListAsync();
                var keepBadgeSet = keepBadgeIds.ToHashSet();

                foreach (var ub in dupBadges)
                {
                    if (keepBadgeSet.Contains(ub.BadgeId))
                    {
                        db.UserBadges.Remove(ub);
                    }
                    else
                    {
                        db.UserBadges.Remove(ub);
                        db.UserBadges.Add(new Models.UserBadge
                        {
                            UserId = keepId,
                            BadgeId = ub.BadgeId,
                            UnlockedAt = ub.UnlockedAt
                        });
                        keepBadgeSet.Add(ub.BadgeId);
                    }
                }

                db.Users.Remove(dup);
            }

            keep.Level = Math.Max(1, keep.TotalScore / 100 + 1);
        }

        await db.SaveChangesAsync();
        Console.WriteLine($"[DB] Username deduplication complete ({duplicateGroups.Count} group(s)).");
    }
}
