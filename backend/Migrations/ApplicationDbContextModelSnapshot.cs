using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using BackendApi.Data;
using System;

namespace BackendApi.Migrations;

[DbContext(typeof(ApplicationDbContext))]
partial class ApplicationDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder
            .HasAnnotation("ProductVersion", "9.0.1")
            .HasAnnotation("Relational:MaxIdentifierLength", 63);

        NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

        // Rooms
        modelBuilder.Entity("BackendApi.Models.Room", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("integer");

            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

            b.Property<int>("Capacity")
                .HasColumnType("integer");

            b.Property<string>("Description")
                .HasColumnType("text");

            b.Property<bool>("IsAvailable")
                .ValueGeneratedOnAdd()
                .HasColumnType("boolean")
                .HasDefaultValue(true);

            b.Property<string>("Location")
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnType("character varying(255)");

            b.Property<string>("Name")
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnType("character varying(255)");

            b.Property<int>("Type")
                .HasColumnType("integer");

            b.HasKey("Id");

            b.ToTable("Rooms");
        });

        // Bookings
        modelBuilder.Entity("BackendApi.Models.Booking", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("integer");

            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

            b.Property<string>("ApprovedBy")
                .HasColumnType("text");

            b.Property<string>("BookedBy")
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnType("character varying(255)");

            b.Property<DateTime>("CreatedAt")
                .HasColumnType("timestamp with time zone");

            b.Property<string>("Description")
                .HasColumnType("text");

            b.Property<DateTime>("EndTime")
                .HasColumnType("timestamp with time zone");

            b.Property<string>("RejectionReason")
                .HasColumnType("text");

            b.Property<int>("RoomId")
                .HasColumnType("integer");

            b.Property<DateTime>("StartTime")
                .HasColumnType("timestamp with time zone");

            b.Property<int>("Status")
                .HasColumnType("integer");

            b.Property<string>("Title")
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnType("character varying(255)");

            b.Property<DateTime?>("UpdatedAt")
                .HasColumnType("timestamp with time zone");

            b.HasKey("Id");

            b.HasIndex("RoomId");

            b.ToTable("Bookings");
        });

        // StatusHistories
        modelBuilder.Entity("BackendApi.Models.StatusHistory", b =>
        {
            b.Property<int>("Id")
                .ValueGeneratedOnAdd()
                .HasColumnType("integer");

            NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

            b.Property<int>("BookingId")
                .HasColumnType("integer");

            b.Property<string>("ChangedBy")
                .IsRequired()
                .HasMaxLength(255)
                .HasColumnType("character varying(255)");

            b.Property<DateTime>("ChangedAt")
                .HasColumnType("timestamp with time zone");

            b.Property<int>("NewStatus")
                .HasColumnType("integer");

            b.Property<string>("Notes")
                .HasColumnType("text");

            b.Property<int>("PreviousStatus")
                .HasColumnType("integer");

            b.HasKey("Id");

            b.HasIndex("BookingId");

            b.ToTable("StatusHistories");
        });

        // Relationships
        modelBuilder.Entity("BackendApi.Models.Booking", b =>
        {
            b.HasOne("BackendApi.Models.Room", "Room")
                .WithMany("Bookings")
                .HasForeignKey("RoomId")
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired();

            b.Navigation("Room");
        });

        modelBuilder.Entity("BackendApi.Models.StatusHistory", b =>
        {
            b.HasOne("BackendApi.Models.Booking", "Booking")
                .WithMany("StatusHistories")
                .HasForeignKey("BookingId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.Navigation("Booking");
        });

        modelBuilder.Entity("BackendApi.Models.Room", b =>
        {
            b.Navigation("Bookings");
        });

        modelBuilder.Entity("BackendApi.Models.Booking", b =>
        {
            b.Navigation("StatusHistories");
        });
#pragma warning restore 612, 618
    }
}
