using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Dtos;
using BCrypt.Net;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
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

    // 【管理员接口】直接创建用户实体（后台使用，前端注册不要调用这个）
    [HttpPost]
    public async Task<ActionResult<UserOutputDto>> PostUser(User user)
    {
        // 管理员调用时，外部必须传入加密好的 PasswordHash
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

    // ============ 新增：前端登录注册接口 ============
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        bool nameUsed = await _context.Users.AnyAsync(u => u.Username == dto.Username);
        bool emailUsed = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (nameUsed) return BadRequest("用户名已存在");
        if (emailUsed) return BadRequest("邮箱已存在");

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
        return CreatedAtAction(nameof(GetUser), new { id = newUser.Id }, output);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null) return Unauthorized("用户名不存在");

        bool passValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!passValid) return Unauthorized("密码错误");

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
        return Ok(output);
    }

    private bool UserExists(int id)
    {
        return _context.Users.Any(e => e.Id == id);
    }
}