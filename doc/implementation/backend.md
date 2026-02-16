# Backend Implementation - .NET API

## Overview

Backend application menggunakan .NET 10 dengan architecture pattern Repository, Service, dan Controller layer.

## Project Structure

```
backend/
├── Controllers/          # API endpoints
├── Services/           # Business logic
├── Data/              # Database context
├── Models/            # Domain models
├── DTOs/              # Data transfer objects
├── Migrations/        # Database migrations
└── Program.cs         # Application entry point
```

## Core Implementation Examples

### 1. Room Model

```csharp
// Models/Room.cs
using System;
using System.Collections.Generic;

namespace BackendApi.Models
{
    public class Room
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public int Capacity { get; set; }
        public string[] Amenities { get; set; }
        public string Status { get; set; } // active, maintenance, archived
        public string PhotoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Navigation property
        public ICollection<Booking> Bookings { get; set; }
    }
}
```

### 2. Booking Model

```csharp
// Models/Booking.cs
using System;

namespace BackendApi.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string UserId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int AttendeeCount { get; set; }
        public string Status { get; set; } // pending, confirmed, cancelled, completed
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Navigation properties
        public Room Room { get; set; }
        public ICollection<StatusHistory> StatusHistory { get; set; }
    }
}
```

### 3. Repository Pattern Implementation

```csharp
// Services/IBookingRepository.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendApi.Models;

namespace BackendApi.Services
{
    public interface IBookingRepository
    {
        Task<Booking> GetByIdAsync(int id);
        Task<List<Booking>> GetByUserIdAsync(string userId);
        Task<List<Booking>> GetByRoomIdAsync(int roomId);
        Task<List<Booking>> GetAllAsync();
        Task<Booking> CreateAsync(Booking booking);
        Task<Booking> UpdateAsync(Booking booking);
        Task DeleteAsync(int id);
        Task<bool> IsRoomAvailableAsync(int roomId, DateTime startTime, DateTime endTime);
    }
}
```

### 4. EF Core Repository Implementation

```csharp
// Services/EfCoreBookingRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BackendApi.Data;
using BackendApi.Models;

namespace BackendApi.Services
{
    public class EfCoreBookingRepository : IBookingRepository
    {
        private readonly ApplicationDbContext _context;
        
        public EfCoreBookingRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<Booking> GetByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.StatusHistory)
                .FirstOrDefaultAsync(b => b.Id == id);
        }
        
        public async Task<List<Booking>> GetByUserIdAsync(string userId)
        {
            return await _context.Bookings
                .Where(b => b.UserId == userId)
                .Include(b => b.Room)
                .OrderByDescending(b => b.StartTime)
                .ToListAsync();
        }
        
        public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime startTime, DateTime endTime)
        {
            return !await _context.Bookings
                .AnyAsync(b => b.RoomId == roomId &&
                              b.Status != "cancelled" &&
                              b.StartTime < endTime &&
                              b.EndTime > startTime);
        }
        
        public async Task<Booking> CreateAsync(Booking booking)
        {
            booking.CreatedAt = DateTime.UtcNow;
            booking.UpdatedAt = DateTime.UtcNow;
            
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            
            return booking;
        }
        
        public async Task DeleteAsync(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking != null)
            {
                booking.Status = "cancelled";
                booking.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
        
        // ... other methods
    }
}
```

### 5. Controller Layer

```csharp
// Controllers/BookingsController.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackendApi.DTOs;
using BackendApi.Models;
using BackendApi.Services;

namespace BackendApi.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IBookingService _bookingService;
        
        public BookingsController(IBookingRepository bookingRepository, IBookingService bookingService)
        {
            _bookingRepository = bookingRepository;
            _bookingService = bookingService;
        }
        
        [HttpPost]
        public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] CreateBookingDto dto)
        {
            // Validate room availability
            bool isAvailable = await _bookingRepository
                .IsRoomAvailableAsync(dto.RoomId, dto.StartTime, dto.EndTime);
                
            if (!isAvailable)
                return Conflict(new { error = "Room is not available for selected time" });
            
            var booking = new Booking
            {
                RoomId = dto.RoomId,
                UserId = User.FindFirst("sub")?.Value,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Title = dto.Title,
                Description = dto.Description,
                AttendeeCount = dto.AttendeeCount,
                Status = "confirmed"
            };
            
            var createdBooking = await _bookingRepository.CreateAsync(booking);
            
            return CreatedAtAction(nameof(GetBooking), new { id = createdBooking.Id }, 
                _bookingService.MapToDto(createdBooking));
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBooking(int id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            
            if (booking == null)
                return NotFound();
            
            return Ok(_bookingService.MapToDto(booking));
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var booking = await _bookingRepository.GetByIdAsync(id);
            
            if (booking == null)
                return NotFound();
            
            // Check if can cancel (must be > 1 hour before start)
            if (DateTime.UtcNow.AddHours(1) > booking.StartTime)
                return BadRequest(new { error = "Cannot cancel - less than 1 hour before meeting" });
            
            await _bookingRepository.DeleteAsync(id);
            
            return NoContent();
        }
        
        // ... other endpoints
    }
}
```

### 6. Database Context

```csharp
// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using BackendApi.Models;

namespace BackendApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<StatusHistory> StatusHistories { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Room configuration
            modelBuilder.Entity<Room>()
                .HasKey(r => r.Id);
                
            modelBuilder.Entity<Room>()
                .Property(r => r.Name)
                .IsRequired()
                .HasMaxLength(255);
            
            // Booking configuration
            modelBuilder.Entity<Booking>()
                .HasKey(b => b.Id);
                
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Room)
                .WithMany(r => r.Bookings)
                .HasForeignKey(b => b.RoomId);
            
            // Unique constraints - Prevent double booking
            modelBuilder.Entity<Booking>()
                .HasIndex(b => new { b.RoomId, b.StartTime, b.EndTime })
                .IsUnique()
                .HasFilter("[Status] != 'cancelled'");
        }
    }
}
```

### 7. Program.cs Setup

```csharp
// Program.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using BackendApi.Data;
using BackendApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository pattern
builder.Services.AddScoped<IBookingRepository, EfCoreBookingRepository>();
builder.Services.AddScoped<IBookingService, BookingService>();

// Authentication
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Auth:Authority"];
        options.Audience = builder.Configuration["Auth:Audience"];
    });

// Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration["Cors:AllowedOrigins"].Split(","))
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Middleware
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

## Key Features Implemented

✅ **Repository Pattern** - Data access abstraction  
✅ **Dependency Injection** - Loose coupling  
✅ **Entity Framework Core** - ORM with PostgreSQL  
✅ **JWT Authentication** - Secure API access  
✅ **Database Constraints** - Prevent double booking  
✅ **Error Handling** - Proper HTTP status codes  
✅ **CORS Support** - Frontend integration  
✅ **Async/Await** - Non-blocking operations  

## Running Backend

```bash
# Build
dotnet build

# Run
dotnet run

# Migrations
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## API Endpoints

```
POST   /api/v1/bookings           - Create booking
GET    /api/v1/bookings/{id}      - Get booking
GET    /api/v1/bookings           - List user bookings
DELETE /api/v1/bookings/{id}      - Cancel booking

GET    /api/v1/rooms              - List rooms
GET    /api/v1/rooms/{id}         - Get room details
```

See [API Reference](../api-specs/api-reference.md) for complete documentation.
