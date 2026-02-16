namespace BackendApi.Models;

public enum RoomType
{
    ClassRoom = 0,
    MeetingRoom = 1,
    ConferenceRoom = 2,
    Laboratory = 3
}

public class Room
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public RoomType Type { get; set; } = RoomType.MeetingRoom;
    public bool IsAvailable { get; set; } = true;
    public string? Description { get; set; }

    // Navigation
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
