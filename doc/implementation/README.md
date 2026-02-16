# Implementation Examples

This directory contains comprehensive code examples and implementation guides for all components of the Room Booking System.

## Contents

### 1. [Backend Implementation](backend.md)
Complete .NET 10 backend implementation guide including:
- **Models** - Room, Booking, and StatusHistory entities
- **Repository Pattern** - IBookingRepository interface and EfCoreBookingRepository implementation
- **Controllers** - BookingsController with JWT authentication
- **Database** - ApplicationDbContext with Entity Framework Core
- **Dependency Injection** - Program.cs setup with all services

Key code samples:
- Room and Booking entity definitions
- EF Core repository with availability checking
- BookingsController with create/get/delete endpoints
- PostgreSQL database configuration

### 2. [Frontend Implementation](frontend.md)
React + TypeScript frontend implementation guide including:
- **API Service** - Axios client with authentication
- **Components** - RoomList, BookingForm, and App components
- **State Management** - React hooks for local state
- **Styling** - CSS with responsive design
- **Type Safety** - TypeScript interfaces for models

Key code samples:
- Axios API service with JWT token handling
- Room list component with error handling
- Booking form with datetime inputs
- Vite + TypeScript configuration

### 3. [Mobile Implementation](mobile.md)
Flutter cross-platform mobile implementation guide including:
- **Models** - Room and Booking models with JSON serialization
- **API Service** - HTTP client with timeout handling
- **Screens** - HomeScreen and RoomDetailScreen
- **Widgets** - RoomCard and booking form widgets
- **Navigation** - Flutter routing and navigation

Key code samples:
- Flutter models with fromJson/toJson methods
- HTTP API service with error handling
- Booking creation form with date/time pickers
- Bottom navigation for multi-tab interface

## Quick Start

### For Backend Developers
See [Backend Implementation](backend.md) for:
- How to set up models and database context
- How to implement the repository pattern
- How to create API controllers with authentication
- How to configure Program.cs

### For Frontend Developers
See [Frontend Implementation](frontend.md) for:
- How to set up Axios API service
- How to create reusable React components
- How to manage form state and validation
- How to integrate with backend API

### For Mobile Developers
See [Mobile Implementation](mobile.md) for:
- How to structure Flutter project
- How to create models and API service
- How to build responsive UI screens
- How to handle async operations

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  - Components: RoomList, BookingForm, BookingHistory    │
│  - Services: API service with JWT authentication        │
│  - State: React hooks for local state management        │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/REST
                 ↓
┌─────────────────────────────────────────────────────────┐
│              Backend API (.NET 10)                       │
│  - Controllers: BookingsController, RoomsController     │
│  - Services: Business logic layer                       │
│  - Repositories: Data access pattern                    │
│  - Database: PostgreSQL with EF Core                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│            Database (PostgreSQL)                         │
│  - Rooms table with constraints                         │
│  - Bookings table with foreign keys                     │
│  - StatusHistory table for audit trail                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               Mobile App (Flutter)                       │
│  - Screens: HomeScreen, RoomDetailScreen                │
│  - Models: Room, Booking with JSON serialization        │
│  - Services: API client for backend communication       │
│  - UI: Material Design with Dart/Flutter                │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/REST
                 ├─────────────────────────────────────────┘
```

## Technologies Used

### Backend
- **.NET 10** - Runtime framework
- **C#** - Programming language
- **Entity Framework Core** - ORM
- **PostgreSQL 15** - Database
- **JWT** - Authentication

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Axios** - HTTP client
- **CSS3** - Styling

### Mobile
- **Flutter** - Cross-platform framework
- **Dart** - Programming language
- **Provider** - State management
- **HTTP** - Network package
- **Intl** - Internationalization

## Common Patterns

### 1. Repository Pattern (Backend)
```csharp
// Interface definition
public interface IRepository<T>
{
    Task<T> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> CreateAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
}

// Implementation
public class EfCoreRepository<T> : IRepository<T>
{
    // EF Core specific implementation
}
```

### 2. Service Layer Pattern (Frontend)
```typescript
// Service class
class ApiService {
    async getRooms() { }
    async createBooking(booking) { }
    async cancelBooking(id) { }
}

// Usage in components
const bookings = await apiService.getBookings();
```

### 3. State Management (Mobile)
```dart
// Using Provider for state
class RoomProvider with ChangeNotifier {
    List<Room> _rooms = [];
    
    Future<void> loadRooms() async {
        _rooms = await apiService.getRooms();
        notifyListeners();
    }
}

// In widget
Consumer<RoomProvider>(
    builder: (context, provider, _) {
        return ListView(children: provider.rooms);
    }
)
```

## Testing Examples

### Backend Unit Test
```csharp
[Test]
public async Task CreateBooking_WhenRoomAvailable_ReturnsBooking()
{
    // Arrange
    var booking = new Booking { RoomId = 1, StartTime = DateTime.Now };
    
    // Act
    var result = await _repository.CreateAsync(booking);
    
    // Assert
    Assert.NotNull(result);
    Assert.Equal(booking.RoomId, result.RoomId);
}
```

### Frontend Component Test
```typescript
test('RoomList displays rooms from API', async () => {
    render(<RoomList />);
    
    await waitFor(() => {
        expect(screen.getByText('Meeting Room A')).toBeInTheDocument();
    });
});
```

### Mobile Widget Test
```dart
testWidgets('RoomCard displays room name', (WidgetTester tester) async {
    await tester.pumpWidget(
        MaterialApp(home: RoomCard(room: testRoom))
    );
    
    expect(find.text('Meeting Room A'), findsOneWidget);
});
```

## API Integration

All three applications integrate with the same REST API. See [API Reference](../api-specs/api-reference.md) for:
- Complete endpoint specifications
- Request/response examples
- Authentication requirements
- Error handling standards

## Deployment

Each implementation has specific deployment requirements:

### Backend
- Docker deployment with PostgreSQL
- Environment variables for configuration
- Health check endpoints

### Frontend
- Static hosting (Netlify, Vercel, S3)
- Build optimization with Vite
- Environment-specific API URLs

### Mobile
- App Store distribution (iOS)
- Play Store distribution (Android)
- Over-the-air updates capability

## Troubleshooting

### Common Issues

**Backend**
- CORS errors → Check CORS configuration in Program.cs
- Database connection → Verify connection string and PostgreSQL running
- JWT validation → Check token expiration and signing keys

**Frontend**
- API 404 errors → Verify API_URL environment variable
- CORS blocked → Check backend CORS policy
- State not updating → Verify useState dependency arrays

**Mobile**
- API timeouts → Increase timeout duration in API service
- Date picker not showing → Check platform-specific permissions
- HTTP errors → Enable Charles/Fiddler to debug network requests

## Contributing

When adding new features:
1. Update models with new fields
2. Add repository methods for data access
3. Create API endpoints in controller
4. Build UI components in frontend/mobile
5. Add tests for all layers

For questions or issues, refer to individual implementation guides or the [Architecture Documentation](../architecture/system-design.md).
