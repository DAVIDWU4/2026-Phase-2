using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BadgesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly StudyGameService _studyGameService;

    public BadgesController(AppDbContext context, StudyGameService studyGameService)
    {
        _context = context;
        _studyGameService = studyGameService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Badge>>> GetBadges()
    {
        return await _context.Badges.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Badge>> GetBadge(int id)
    {
        var badge = await _context.Badges.FindAsync(id);
        if (badge == null) return NotFound();
        return badge;
    }

    /// <summary>
    /// Returns unlocked badges for a user. Any authenticated user may read
    /// another user's badges (leaderboard / profile modal). Reconcile runs
    /// only when viewing your own badges so others cannot trigger writes.
    /// </summary>
    [Authorize]
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<UserBadge>>> GetUserBadges(int userId)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId is null)
            return Unauthorized();

        if (!await _context.Users.AnyAsync(u => u.Id == userId))
            return NotFound();

        // Keep own badge state accurate; public profile views are read-only.
        if (currentUserId.Value == userId)
        {
            await _studyGameService.ReconcileUserBadgesAsync(userId);
            await _context.SaveChangesAsync();
        }

        var userBadges = await _context.UserBadges
            .Where(ub => ub.UserId == userId)
            .ToListAsync();
        return Ok(userBadges);
    }

    [HttpPost]
    public async Task<ActionResult<Badge>> PostBadge(Badge badge)
    {
        _context.Badges.Add(badge);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBadge), new { id = badge.Id }, badge);
    }

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

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBadge(int id)
    {
        var badge = await _context.Badges.FindAsync(id);
        if (badge == null) return NotFound();

        _context.Badges.Remove(badge);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private int? GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idClaim, out var id) ? id : null;
    }

    private bool BadgeExists(int id)
    {
        return _context.Badges.Any(e => e.Id == id);
    }
}
