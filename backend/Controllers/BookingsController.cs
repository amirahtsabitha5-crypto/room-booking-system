using Microsoft.AspNetCore.Mvc;
using BackendApi.Data;
using BackendApi.DTOs;
using BackendApi.Models;
using BackendApi.Services;
using Microsoft.EntityFrameworkCore;

namespace BackendApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IBookingRepository _bookingRepository;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(
        ApplicationDbContext context, 
        IBookingRepository bookingRepository,
        ILogger<BookingsController> logger)
    {
        _context = context;
        _bookingRepository = bookingRepository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookings()
    {
        try
        {
            var bookings = await _context.Bookings.ToListAsync();
            return Ok(bookings.Select(b => new BookingDto
            {
                Id = b.Id,
                RoomId = b.RoomId,
                Title = b.Title,
                Description = b.Description,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                BookedBy = b.BookedBy,
                Status = (int)b.Status,
                ApprovedBy = b.ApprovedBy,
                RejectionReason = b.RejectionReason,
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching bookings");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingDto>> GetBooking(int id)
    {
        try
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound();

            return Ok(new BookingDto
            {
                Id = booking.Id,
                RoomId = booking.RoomId,
                Title = booking.Title,
                Description = booking.Description,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                BookedBy = booking.BookedBy,
                Status = (int)booking.Status,
                ApprovedBy = booking.ApprovedBy,
                RejectionReason = booking.RejectionReason,
                CreatedAt = booking.CreatedAt,
                UpdatedAt = booking.UpdatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching booking {BookingId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        try
        {
            // Check if room exists
            var room = await _context.Rooms.FindAsync(request.RoomId);
            if (room == null)
                return BadRequest("Room not found");

            var booking = new Booking
            {
                RoomId = request.RoomId,
                Title = request.Title,
                Description = request.Description,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                BookedBy = request.BookedBy,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, 
                new BookingDto
                {
                    Id = booking.Id,
                    RoomId = booking.RoomId,
                    Title = booking.Title,
                    Description = booking.Description,
                    StartTime = booking.StartTime,
                    EndTime = booking.EndTime,
                    BookedBy = booking.BookedBy,
                    Status = (int)booking.Status,
                    ApprovedBy = booking.ApprovedBy,
                    RejectionReason = booking.RejectionReason,
                    CreatedAt = booking.CreatedAt,
                    UpdatedAt = booking.UpdatedAt
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating booking");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBooking(int id, [FromBody] UpdateBookingRequest request)
    {
        try
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound();

            booking.Title = request.Title;
            booking.Description = request.Description;
            booking.StartTime = request.StartTime;
            booking.EndTime = request.EndTime;
            booking.UpdatedAt = DateTime.UtcNow;

            _context.Bookings.Update(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating booking {BookingId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBooking(int id)
    {
        try
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound();

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting booking {BookingId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        try
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return NotFound();

            var previousStatus = booking.Status;
            booking.Status = (BookingStatus)request.Status;
            booking.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(request.ApprovedBy))
                booking.ApprovedBy = request.ApprovedBy;

            if (!string.IsNullOrEmpty(request.RejectionReason))
                booking.RejectionReason = request.RejectionReason;

            // Record status change
            var statusHistory = new StatusHistory
            {
                BookingId = id,
                PreviousStatus = previousStatus,
                NewStatus = (BookingStatus)request.Status,
                Notes = request.Notes,
                ChangedBy = request.ChangedBy ?? "System",
                ChangedAt = DateTime.UtcNow
            };

            _context.Bookings.Update(booking);
            _context.StatusHistories.Add(statusHistory);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating booking status {BookingId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}

public class UpdateStatusRequest
{
    public int Status { get; set; }
    public string? ApprovedBy { get; set; }
    public string? RejectionReason { get; set; }
    public string? Notes { get; set; }
    public string? ChangedBy { get; set; }
}
