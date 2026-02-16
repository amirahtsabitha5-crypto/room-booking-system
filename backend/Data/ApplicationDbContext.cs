using Microsoft.EntityFrameworkCore;
using BackendApi.Models;

namespace BackendApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Room> Rooms { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<StatusHistory> StatusHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Room configuration
        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Location).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Capacity).IsRequired();
            entity.Property(e => e.Type).HasConversion<int>();
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
        });

        // Booking configuration
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.BookedBy).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Status).HasConversion<int>();
            entity.Property(e => e.CreatedAt).HasDefaultValue(DateTime.UtcNow);

            entity.HasOne(e => e.Room)
                .WithMany(r => r.Bookings)
                .HasForeignKey(e => e.RoomId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // StatusHistory configuration
        modelBuilder.Entity<StatusHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PreviousStatus).HasConversion<int>();
            entity.Property(e => e.NewStatus).HasConversion<int>();
            entity.Property(e => e.ChangedBy).IsRequired().HasMaxLength(255);
            entity.Property(e => e.ChangedAt).HasDefaultValue(DateTime.UtcNow);

            entity.HasOne(e => e.Booking)
                .WithMany(b => b.StatusHistories)
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
