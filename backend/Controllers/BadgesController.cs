using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class BadgesController : ControllerBase
{
    private readonly AppDbContext _context;

    public BadgesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Badges
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Badge>>> GetBadges()
    {
        return await _context.Badges.ToListAsync();
    }

    // GET: api/Badges/user/5
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Badge>>> GetUserBadges(int userId)
    {
        var userBadgeIds = await _context.UserBadges
            .Where(ub => ub.UserID == userId)
            .Select(ub => ub.BadgeID)
            .ToListAsync();

        return await _context.Badges
            .Where(b => userBadgeIds.Contains(b.BadgeID))
            .ToListAsync();
    }

    // POST: api/Badges
    [HttpPost]
    public async Task<ActionResult<Badge>> CreateBadge(Badge badge)
    {
        _context.Badges.Add(badge);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetBadges", new { id = badge.BadgeID }, badge);
    }
}