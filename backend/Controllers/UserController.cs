using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Dtos;
using BCrypt.Net;
using System.Security.Claims;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PasswordResetService _passwordResetService;

    public UsersController(AppDbContext context, PasswordResetService passwordResetService)
    {
        _context = context;
        _passwordResetService = passwordResetService;
    }
    
    // get all users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserOutputDto>>> GetUsers()
    {
        var users = await _context.Users.ToListAsync();
        var result = users.Select(u => new UserOutputDto
        {
            Id = u.Id,
            Username = u.Username,
            Nickname = u.Nickname,
            Email = u.Email,
            Role = u.Role,
            TotalScore = u.TotalScore,
            Level = u.Level,
            StreakDays = u.StreakDays,
            LastStudyDate = u.LastStudyDate,
            CreatedAt = u.CreatedAt
        });
        return Ok(result);
    }

    // get a single user by id
    [HttpGet("{id}")]
    public async Task<ActionResult<UserOutputDto>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        return new UserOutputDto
        {
            Id = user.Id,
            Username = user.Username,
            Nickname = user.Nickname,
            Email = user.Email,
            Role = user.Role,
            TotalScore = user.TotalScore,
            Level = user.Level,
            StreakDays = user.StreakDays,
            LastStudyDate = user.LastStudyDate,
            CreatedAt = user.CreatedAt
        };
    }

    // Admin endpoint for creating users. Not for frontend registration.
    [HttpPost]
    public async Task<ActionResult<UserOutputDto>> PostUser(User user)
    {
        // Admin callers must pass a hashed password.
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var output = new UserOutputDto
        {
            Id = user.Id,
            Username = user.Username,
            Nickname = user.Nickname,
            Email = user.Email,
            Role = user.Role,
            TotalScore = user.TotalScore,
            Level = user.Level,
            StreakDays = user.StreakDays,
            LastStudyDate = user.LastStudyDate,
            CreatedAt = user.CreatedAt
        };
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, output);
    }

    // update user info
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUser(int id, User user)
    {
        if (id != user.Id) return BadRequest();
        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UserExists(id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    // delete user
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ============ Added frontend login/register endpoints ============
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        bool nameUsed = await _context.Users.AnyAsync(u => u.Username == dto.Username);
        bool emailUsed = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (nameUsed) return BadRequest("Username already exists");
        if (emailUsed) return BadRequest("Email already exists");

        var newUser = new User
        {
            Username = dto.Username,
            Nickname = dto.Nickname,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "user",
            TotalScore = 0,
            Level = 1,
            StreakDays = 0
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        var output = new UserOutputDto
        {
            Id = newUser.Id,
            Username = newUser.Username,
            Nickname = newUser.Nickname,
            Email = newUser.Email,
            Role = newUser.Role,
            TotalScore = newUser.TotalScore,
            Level = newUser.Level,
            StreakDays = newUser.StreakDays,
            LastStudyDate = newUser.LastStudyDate,
            CreatedAt = newUser.CreatedAt
        };

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, newUser.Id.ToString()),
            new(ClaimTypes.Name, newUser.Username)
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity),
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
            });

        return CreatedAtAction(nameof(GetUser), new { id = newUser.Id }, output);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null) return Unauthorized("Username does not exist");

        bool passValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!passValid) return Unauthorized("Incorrect password");

        var output = new UserOutputDto
        {
            Id = user.Id,
            Username = user.Username,
            Nickname = user.Nickname,
            Email = user.Email,
            Role = user.Role,
            TotalScore = user.TotalScore,
            Level = user.Level,
            StreakDays = user.StreakDays,
            LastStudyDate = user.LastStudyDate,
            CreatedAt = user.CreatedAt
        };

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username)
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity),
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7)
            });

        return Ok(output);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok(new { Message = "Logged out successfully." });
    }

    [HttpPost("password-reset-request")]
    public async Task<IActionResult> RequestPasswordReset(PasswordResetRequestDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user != null)
        {
            var code = _passwordResetService.CreateResetCode(dto.Email);
            try
            {
                await _passwordResetService.SendResetMailAsync(dto.Email, code);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send password reset email to {dto.Email}: {ex.Message}");
            }
        }

        return Ok(new { Message = "If the email exists, a reset code has been sent." });
    }

    [HttpPost("password-reset-confirm")]
    public async Task<IActionResult> ConfirmPasswordReset(PasswordResetConfirmDto dto)
    {
        if (!_passwordResetService.ValidateResetCode(dto.Email, dto.Code))
        {
            return BadRequest("Invalid or expired reset code.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null) return BadRequest("Invalid reset request.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Password has been reset successfully." });
    }

    private bool UserExists(int id)
    {
        return _context.Users.Any(e => e.Id == id);
    }
}