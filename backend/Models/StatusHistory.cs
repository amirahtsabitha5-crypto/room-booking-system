namespace BackendApi.Models;

public class StatusHistory
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public BookingStatus PreviousStatus { get; set; }
    public BookingStatus NewStatus { get; set; }
    public string? Notes { get; set; }
    public string ChangedBy { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Booking? Booking { get; set; }
}
