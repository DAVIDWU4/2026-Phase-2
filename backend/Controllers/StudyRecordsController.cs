using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StudyRecordsController(StudyGameService studyGameService) : ControllerBase
{
    private readonly StudyGameService _studyGameService = studyGameService;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] StudyRecord record)
    {
        try
        {
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
        return Ok(record);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var records = await _studyGameService.GetAllStudyRecordsAsync();
        return Ok(records);
    }


    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var records = await _studyGameService.GetStudyRecordsByUserIdAsync(userId);
        return Ok(records);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] StudyRecord record)
    {
        var success = await _studyGameService.UpdateStudyRecordAsync(id, record);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _studyGameService.DeleteStudyRecordAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}