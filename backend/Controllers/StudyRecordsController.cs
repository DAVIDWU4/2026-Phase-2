using System.Security.Claims;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class StudyRecordsController(StudyGameService studyGameService) : ControllerBase
{
    private readonly StudyGameService _studyGameService = studyGameService;

    private int? CurrentUserId =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateStudyRecordDto dto)
    {
        if (CurrentUserId is null || dto.UserId != CurrentUserId.Value)
            return Forbid();

        try
        {
            var record = new StudyRecord
            {
                UserId = dto.UserId,
                StudyDate = dto.StudyDate,
                DurationMinutes = dto.DurationMinutes,
                Subject = dto.Subject,
                Notes = dto.Notes
            };

            var savedRecord = await _studyGameService.SubmitStudyRecordAsync(record);
            return CreatedAtAction(nameof(GetById), new { id = savedRecord.Id }, savedRecord);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var record = await _studyGameService.GetStudyRecordByIdAsync(id);
        if (record == null) return NotFound();
        if (CurrentUserId is null || record.UserId != CurrentUserId.Value)
            return Forbid();
        return Ok(record);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        if (CurrentUserId is null) return Forbid();
        var records = await _studyGameService.GetStudyRecordsByUserIdAsync(CurrentUserId.Value);
        return Ok(records);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        if (CurrentUserId is null || userId != CurrentUserId.Value)
            return Forbid();

        var records = await _studyGameService.GetStudyRecordsByUserIdAsync(userId);
        return Ok(records);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] StudyRecord record)
    {
        var existing = await _studyGameService.GetStudyRecordByIdAsync(id);
        if (existing == null) return NotFound();
        if (CurrentUserId is null || existing.UserId != CurrentUserId.Value)
            return Forbid();

        var success = await _studyGameService.UpdateStudyRecordAsync(id, record);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _studyGameService.GetStudyRecordByIdAsync(id);
        if (existing == null) return NotFound();
        if (CurrentUserId is null || existing.UserId != CurrentUserId.Value)
            return Forbid();

        var success = await _studyGameService.DeleteStudyRecordAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
