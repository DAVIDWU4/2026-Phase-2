using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BadgesController : ControllerBase
{
    private readonly AppDbContext _context;

    public BadgesController(AppDbContext context)
    {
        _context = context;
    }

    // get all badges
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Badge>>> GetBadges()
    {
        return await _context.Badges.ToListAsync();
    }

    // get a single badge
    [HttpGet("{id}")]
    public async Task<ActionResult<Badge>> GetBadge(int id)
    {
        var badge = await _context.Badges.FindAsync(id);
        if (badge == null) return NotFound();
        return badge;
    }


    // get badges unlocked by user
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<UserBadge>>> GetUserBadges(int userId)
    {
       var userBadges = await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .ToListAsync();
        return Ok(userBadges);
    }

    // create a new badge
    [HttpPost]
    public async Task<ActionResult<Badge>> PostBadge(Badge badge)
    {
        _context.Badges.Add(badge);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBadge), new { id = badge.Id }, badge);
    }

    // update a badge
    [HttpPut("{id}")]
    public async Task<IActionResult> PutBadge(int id, Badge badge)
    {
        if (id != badge.Id) return BadRequest();
        _context.Entry(badge).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!BadgeExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    // delete a badge
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBadge(int id)
    {
        var badge = await _context.Badges.FindAsync(id);
        if (badge == null) return NotFound();

        _context.Badges.Remove(badge);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private bool BadgeExists(int id)
    {
        return _context.Badges.Any(e => e.Id == id);
    }
}