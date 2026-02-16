# Implementation Notes

## Architecture
- **Backend**: ASP.NET Core 10.0 with Entity Framework Core
- **Database**: PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **API Communication**: REST API with JSON

## Key Features
1. Room Management
   - CRUD operations for rooms
   - Room capacity and location tracking
   - Room type classification

2. Booking Management
   - Create, read, update, delete bookings
   - Booking status tracking (Pending, Approved, Rejected, Completed, Cancelled)
   - Booking history with status changes
   - Date/time validation

3. Database
   - Normalized schema with Room, Booking, and StatusHistory tables
   - Foreign key relationships
   - Audit trail for booking changes

## API Endpoints
- GET/POST /api/rooms
- GET /api/rooms/{id}
- GET/POST /api/bookings
- GET /api/bookings/{id}
- PUT /api/bookings/{id}
- DELETE /api/bookings/{id}
- PUT /api/bookings/{id}/status

## Setup Instructions
1. Install .NET 10.0 SDK
2. Setup PostgreSQL database
3. Update connection string in appsettings.json
4. Run migrations: `dotnet ef database update`
5. Start backend: `dotnet run`
6. Install frontend dependencies: `npm install`
7. Start frontend: `npm run dev`

## Environment Variables
- ASPNETCORE_URLS: Server URL (default: http://localhost:8000)
- ConnectionString: PostgreSQL connection string
