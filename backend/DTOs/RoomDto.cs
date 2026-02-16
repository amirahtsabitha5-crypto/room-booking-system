namespace BackendApi.DTOs;

public class RoomDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public int Type { get; set; }
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
}

