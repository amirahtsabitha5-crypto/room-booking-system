using Microsoft.EntityFrameworkCore;
using BackendApi.Data;
using BackendApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Set the URLs to bind to port 8000
builder.WebHost.UseUrls("http://localhost:8000");

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=room_booking_db;Username=postgres;Password=Sabitaesoo59";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options => options.AddPolicy("AllowAll", 
    p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

builder.Services.AddScoped<IBookingRepository, EfCoreBookingRepository>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        dbContext.Database.EnsureCreated();
        app.Logger.LogInformation("Database initialized successfully");
        
        // Always seed or reseed the database
        var rooms = dbContext.Rooms.ToList();
        if (rooms.Count == 0)
        {
            var newRooms = new[]
            {
                new BackendApi.Models.Room
                {
                    Name = "Ruang Seminar A",
                    Capacity = 30,
                    Location = "Lantai 2 Gedung A",
                    IsAvailable = true
                },
                new BackendApi.Models.Room
                {
                    Name = "Ruang Meeting B",
                    Capacity = 50,
                    Location = "Lantai 3 Gedung B",
                    IsAvailable = true
                },
                new BackendApi.Models.Room
                {
                    Name = "Ruang Kelas C",
                    Capacity = 40,
                    Location = "Lantai 1 Gedung C",
                    IsAvailable = true
                },
                new BackendApi.Models.Room
                {
                    Name = "Ruang Auditorium",
                    Capacity = 200,
                    Location = "Lantai 4 Gedung D",
                    IsAvailable = true
                }
            };
            dbContext.Rooms.AddRange(newRooms);
            dbContext.SaveChanges();
            app.Logger.LogInformation("Rooms seeded successfully");
        }

        var bookings = dbContext.Bookings.ToList();
        if (bookings.Count == 0)
        {
            var newBookings = new[]
            {
                new BackendApi.Models.Booking
                {
                    RoomId = 1,
                    Title = "Workshop Python",
                    Description = "Pelatihan Python untuk semua level",
                    StartTime = new DateTime(2026, 2, 15, 10, 0, 0, DateTimeKind.Utc),
                    EndTime = new DateTime(2026, 2, 15, 12, 0, 0, DateTimeKind.Utc),
                    BookedBy = "John Doe",
                    CreatedAt = DateTime.UtcNow
                },
                new BackendApi.Models.Booking
                {
                    RoomId = 2,
                    Title = "Meeting Rapat Direksi",
                    Description = "Pertemuan rutin bulanan untuk evaluasi kinerja",
                    StartTime = new DateTime(2026, 2, 11, 14, 0, 0, DateTimeKind.Utc),
                    EndTime = new DateTime(2026, 2, 11, 15, 30, 0, DateTimeKind.Utc),
                    BookedBy = "Jane Smith",
                    CreatedAt = DateTime.UtcNow
                }
            };
            dbContext.Bookings.AddRange(newBookings);
            dbContext.SaveChanges();
            app.Logger.LogInformation("Bookings seeded successfully");
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "An error occurred during database initialization");
        throw;
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.MapControllers();

app.Run();
