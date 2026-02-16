using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace BackendApi.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Rooms",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                Location = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                Capacity = table.Column<int>(type: "integer", nullable: false),
                Type = table.Column<int>(type: "integer", nullable: false),
                IsAvailable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                Description = table.Column<string>(type: "text", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Rooms", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Bookings",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                RoomId = table.Column<int>(type: "integer", nullable: false),
                Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                Description = table.Column<string>(type: "text", nullable: true),
                StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                BookedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                Status = table.Column<int>(type: "integer", nullable: false),
                ApprovedBy = table.Column<string>(type: "text", nullable: true),
                RejectionReason = table.Column<string>(type: "text", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Bookings", x => x.Id);
                table.ForeignKey(
                    name: "FK_Bookings_Rooms_RoomId",
                    column: x => x.RoomId,
                    principalTable: "Rooms",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "StatusHistories",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                BookingId = table.Column<int>(type: "integer", nullable: false),
                PreviousStatus = table.Column<int>(type: "integer", nullable: false),
                NewStatus = table.Column<int>(type: "integer", nullable: false),
                Notes = table.Column<string>(type: "text", nullable: true),
                ChangedBy = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_StatusHistories", x => x.Id);
                table.ForeignKey(
                    name: "FK_StatusHistories_Bookings_BookingId",
                    column: x => x.BookingId,
                    principalTable: "Bookings",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Bookings_RoomId",
            table: "Bookings",
            column: "RoomId");

        migrationBuilder.CreateIndex(
            name: "IX_StatusHistories_BookingId",
            table: "StatusHistories",
            column: "BookingId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "StatusHistories");

        migrationBuilder.DropTable(
            name: "Bookings");

        migrationBuilder.DropTable(
            name: "Rooms");
    }
}
