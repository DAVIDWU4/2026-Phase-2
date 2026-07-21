using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class StudyRecordsController : ControllerBase
{
    private readonly AppDbContext _context;

    public StudyRecordsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/StudyRecords/user/5
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<StudyRecord>>> GetUserStudyRecords(int userId)
    {
        return await _context.StudyRecords
            .Where(r => r.rID == userId)
            .OrderByDescending(r => r.Date)
            .ToListAsync();
    }

    // POST: api/StudyRecords
    [HttpPost]
    public async Task<ActionResult<StudyRecord>> CreateStudyRecord(StudyRecord record)
    {
        // Calculate points (1 point per minute, max 100 per day)
        int dailyPoints = await _context.StudyRecords
            .Where(r => r.rID == record.rID && r.Date.Date == record.Date.Date)
            .SumAsync(r => r.EarnedPoints);
        
        int pointsToAdd = Math.Min(record.Duration, 100 - dailyPoints);
        
        // Calculate streak
        var yesterday = record.Date.Date.AddDays(-1);
        bool hasYesterdayRecord = await _context.StudyRecords
            .AnyAsync(r => r.rID == record.rID && r.Date.Date == yesterday);
        
        int streakCount = hasYesterdayRecord 
            ? await _context.StudyRecords
                .Where(r => r.rID == record.rID)
                .OrderByDescending(r => r.Date)
                .Select(r => r.StreakCount)
                .FirstOrDefaultAsync() + 1
            : 1;

        record.EarnedPoints = pointsToAdd;
        record.StreakCount = streakCount;
        record.Date = DateTime.Now;

        _context.StudyRecords.Add(record);
        await _context.SaveChangesAsync();

        // Check for badges
        await CheckAndAwardBadges(record.rID, pointsToAdd, streakCount);

        return CreatedAtAction("GetUserStudyRecords", new { userId = record.rID }, record);
    }

    private async Task CheckAndAwardBadges(int userId, int pointsEarned, int streakCount)
    {
        // Check for streak badges
        var streakBadges = await _context.Badges
            .Where(b => b.BadgePoints > 0 && streakCount >= b.BadgePoints)
            .ToListAsync();

        foreach (var badge in streakBadges)
        {
            bool alreadyAwarded = await _context.UserBadges
                .AnyAsync(ub => ub.UserID == userId && ub.BadgeID == badge.BadgeID);

            if (!alreadyAwarded)
            {
                _context.UserBadges.Add(new UserBadge { UserID = userId, BadgeID = badge.BadgeID });
            }
        }

        await _context.SaveChangesAsync();
    }
}