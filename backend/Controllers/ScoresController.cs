using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ScoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public ScoresController(AppDbContext context)
    {
        _context = context;
    }

    // get all score entries
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ScoreEntry>>> GetScoreEntries()
    {
        return await _context.Scores.Include(se => se.User).ToListAsync();
    }

    // get leaderboard - users sorted by total score
    [HttpGet("leaderboard")]
    public async Task<ActionResult<IEnumerable<object>>> GetLeaderboard()
    {
        var leaderboard = await _context.Users
            .OrderByDescending(u => u.TotalScore)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Nickname,
                u.TotalScore,
                u.Level,
                u.StreakDays
            })
            .ToListAsync();

        // Create score entries for leaderboard display
        var result = leaderboard.Select(user => new
        {
            UserId = user.Id,
            Amount = user.TotalScore,
            Reason = "Total Score",
            Username = user.Username,
            Nickname = user.Nickname,
            Level = user.Level,
            StreakDays = user.StreakDays
        });

        return Ok(result);
    }

    // get a single score entry
    [HttpGet("{id}")]
    public async Task<ActionResult<ScoreEntry>> GetScoreEntry(int id)
    {
        var scoreEntry = await _context.Scores
            .Include(se => se.User)
            .FirstOrDefaultAsync(se => se.Id == id);
        if (scoreEntry == null) return NotFound();
        return scoreEntry;
    }

    // create a new score entry
    [HttpPost]
    public async Task<ActionResult<ScoreEntry>> PostScoreEntry(ScoreEntry scoreEntry)
    {
        _context.Scores.Add(scoreEntry);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetScoreEntry), new { id = scoreEntry.Id }, scoreEntry);
    }

    // update a score entry
    [HttpPut("{id}")]
    public async Task<IActionResult> PutScoreEntry(int id, ScoreEntry scoreEntry)
    {
        if (id != scoreEntry.Id) return BadRequest();
        _context.Entry(scoreEntry).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ScoreEntryExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    // delete a score entry
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteScoreEntry(int id)
    {
        var scoreEntry = await _context.Scores.FindAsync(id);
        if (scoreEntry == null) return NotFound();

        _context.Scores.Remove(scoreEntry);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private bool ScoreEntryExists(int id)
    {
        return _context.Scores.Any(e => e.Id == id);
    }
}