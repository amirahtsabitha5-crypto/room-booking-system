using Microsoft.AspNetCore.Mvc;
using BackendApi.Data;
using BackendApi.DTOs;
using BackendApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BackendApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RoomsController> _logger;

    public RoomsController(ApplicationDbContext context, ILogger<RoomsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRooms()
    {
        try
        {
            var rooms = await _context.Rooms.ToListAsync();
            return Ok(rooms.Select(r => new RoomDto
            {
                Id = r.Id,
                Name = r.Name,
                Location = r.Location,
                Capacity = r.Capacity,
                Type = (int)r.Type,
                IsAvailable = r.IsAvailable,
                Description = r.Description
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching rooms");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoomDto>> GetRoom(int id)
    {
        try
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null)
                return NotFound();

            return Ok(new RoomDto
            {
                Id = room.Id,
                Name = room.Name,
                Location = room.Location,
                Capacity = room.Capacity,
                Type = (int)room.Type,
                IsAvailable = room.IsAvailable,
                Description = room.Description
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching room {RoomId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<RoomDto>> CreateRoom([FromBody] RoomDto roomDto)
    {
        try
        {
            var room = new Room
            {
                Name = roomDto.Name,
                Location = roomDto.Location,
                Capacity = roomDto.Capacity,
                Type = (RoomType)roomDto.Type,
                IsAvailable = roomDto.IsAvailable,
                Description = roomDto.Description
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            roomDto.Id = room.Id;
            return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, roomDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating room");
            return StatusCode(500, "Internal server error");
        }
    }
}
