using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StudyRecordsController : ControllerBase
{
    private readonly AppDbContext _context;

    public StudyRecordsController(AppDbContext context)
    {
        _context = context;
    }

    // get all study records
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudyRecord>>> GetStudyRecords()
    {
        return await _context.StudyRecords.Include(sr => sr.User).ToListAsync();
    }

    // get a single study record by id
    [HttpGet("{id}")]
    public async Task<ActionResult<StudyRecord>> GetStudyRecord(int id)
    {
        var studyRecord = await _context.StudyRecords
            .Include(sr => sr.User)
            .FirstOrDefaultAsync(sr => sr.Id == id);
        if (studyRecord == null) return NotFound();
        return studyRecord;
    }

    // create a new study record
    // (automatically adds score, updates streak, and unlocks badges)
    [HttpPost]
    public async Task<ActionResult<StudyRecord>> PostStudyRecord(StudyRecord studyRecord)
    {
        var user = await _context.Users.FindAsync(studyRecord.UserId);
        if (user == null) return NotFound("User not found");

        //save the study record
        _context.StudyRecords.Add(studyRecord);

        //  update the user's total score and streak
        user.TotalScore += studyRecord.EarnedScore;
        if (user.LastStudyDate.HasValue 
            && user.LastStudyDate.Value.Date == DateTime.UtcNow.AddDays(-1).Date)
        {
            user.StreakDays++;
        }
        else if (!user.LastStudyDate.HasValue 
                 || user.LastStudyDate.Value.Date != DateTime.UtcNow.Date)
        {
            user.StreakDays = 1;
        }
        user.LastStudyDate = DateTime.UtcNow;
        studyRecord.StreakCount = user.StreakDays;

        // record the score entry for the study record
        var scoreEntry = new ScoreEntry
        {
            UserId = studyRecord.UserId,
            Amount = studyRecord.EarnedScore,
            Reason = $"complete the study:{studyRecord.Subject}"
        };
        _context.Scores.Add(scoreEntry);

        // automatically check and unlock badges that meet the score requirement
        var availableBadges = await _context.Badges
            .Where(b => b.RequiredScore <= user.TotalScore)
            .ToListAsync();

        foreach (var badge in availableBadges)
        {
            var alreadyUnlocked = await _context.UserBadges
                .AnyAsync(ub => ub.UserId == user.Id && ub.BadgeId == badge.Id);
            if (!alreadyUnlocked)
            {
                _context.UserBadges.Add(new UserBadge
                {
                    UserId = user.Id,
                    BadgeId = badge.Id
                });
            }
        }

        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetStudyRecord), new { id = studyRecord.Id }, studyRecord);
    }

    // update a study record by id
    [HttpPut("{id}")]
    public async Task<IActionResult> PutStudyRecord(int id, StudyRecord studyRecord)
    {
        if (id != studyRecord.Id) return BadRequest();
        _context.Entry(studyRecord).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!StudyRecordExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    // delete a study record by id
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStudyRecord(int id)
    {
        var studyRecord = await _context.StudyRecords.FindAsync(id);
        if (studyRecord == null) return NotFound();

        _context.StudyRecords.Remove(studyRecord);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private bool StudyRecordExists(int id)
    {
        return _context.StudyRecords.Any(e => e.Id == id);
    }
}