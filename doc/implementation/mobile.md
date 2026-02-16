# Mobile Implementation - Flutter

## Overview

Mobile application menggunakan Flutter dengan Dart untuk cross-platform development mendukung iOS dan Android.

## Project Structure

```
mobile/
├── lib/
│   ├── main.dart                # App entry point
│   ├── models/                  # Data models
│   ├── services/                # API service
│   ├── screens/                 # UI screens
│   ├── widgets/                 # Reusable widgets
│   └── utils/                   # Helper utilities
├── test/                        # Tests
├── pubspec.yaml                 # Dependencies
└── analysis_options.yaml        # Linting rules
```

## Core Implementation Examples

### 1. Models

```dart
// lib/models/room.dart
class Room {
  final int id;
  final String name;
  final String location;
  final int capacity;
  final List<String> amenities;
  final String status;
  final String? photoUrl;

  Room({
    required this.id,
    required this.name,
    required this.location,
    required this.capacity,
    required this.amenities,
    required this.status,
    this.photoUrl,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'] as int,
      name: json['name'] as String,
      location: json['location'] as String,
      capacity: json['capacity'] as int,
      amenities: List<String>.from(json['amenities'] ?? []),
      status: json['status'] as String,
      photoUrl: json['photoUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'location': location,
    'capacity': capacity,
    'amenities': amenities,
    'status': status,
    'photoUrl': photoUrl,
  };
}

// lib/models/booking.dart
class Booking {
  final int id;
  final int roomId;
  final String userId;
  final DateTime startTime;
  final DateTime endTime;
  final String title;
  final String status;
  final DateTime createdAt;

  Booking({
    required this.id,
    required this.roomId,
    required this.userId,
    required this.startTime,
    required this.endTime,
    required this.title,
    required this.status,
    required this.createdAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as int,
      roomId: json['roomId'] as int,
      userId: json['userId'] as String,
      startTime: DateTime.parse(json['startTime'] as String),
      endTime: DateTime.parse(json['endTime'] as String),
      title: json['title'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'roomId': roomId,
    'userId': userId,
    'startTime': startTime.toIso8601String(),
    'endTime': endTime.toIso8601String(),
    'title': title,
    'status': status,
    'createdAt': createdAt.toIso8601String(),
  };
}
```

### 2. API Service

```dart
// lib/services/api_service.dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:room_booking_mobile/models/room.dart';
import 'package:room_booking_mobile/models/booking.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api/v1';
  static const Duration timeout = Duration(seconds: 30);
  
  final http.Client _client = http.Client();
  String? _authToken;

  void setAuthToken(String token) {
    _authToken = token;
  }

  Map<String, String> _getHeaders() {
    final headers = {
      'Content-Type': 'application/json',
    };
    
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    
    return headers;
  }

  // Rooms
  Future<List<Room>> getRooms({int page = 1, int pageSize = 10}) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/rooms')
            .replace(queryParameters: {
              'page': page.toString(),
              'pageSize': pageSize.toString(),
            }),
        headers: _getHeaders(),
      ).timeout(timeout);

      if (response.statusCode == 200) {
        final List<dynamic> decoded = json.decode(response.body)['data'];
        return decoded.map((room) => Room.fromJson(room)).toList();
      } else {
        throw Exception('Failed to load rooms');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  Future<Room> getRoom(int id) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/rooms/$id'),
        headers: _getHeaders(),
      ).timeout(timeout);

      if (response.statusCode == 200) {
        return Room.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to load room');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // Bookings
  Future<List<Booking>> getBookings() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/bookings'),
        headers: _getHeaders(),
      ).timeout(timeout);

      if (response.statusCode == 200) {
        final List<dynamic> decoded = json.decode(response.body)['data'];
        return decoded.map((booking) => Booking.fromJson(booking)).toList();
      } else {
        throw Exception('Failed to load bookings');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  Future<Booking> createBooking({
    required int roomId,
    required DateTime startTime,
    required DateTime endTime,
    required String title,
    required String description,
    required int attendeeCount,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/bookings'),
        headers: _getHeaders(),
        body: json.encode({
          'roomId': roomId,
          'startTime': startTime.toIso8601String(),
          'endTime': endTime.toIso8601String(),
          'title': title,
          'description': description,
          'attendeeCount': attendeeCount,
        }),
      ).timeout(timeout);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return Booking.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to create booking');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  Future<void> cancelBooking(int id) async {
    try {
      final response = await _client.delete(
        Uri.parse('$baseUrl/bookings/$id'),
        headers: _getHeaders(),
      ).timeout(timeout);

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Failed to cancel booking');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }
}
```

### 3. Main App

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/api_service.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Room Booking System',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          elevation: 1,
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
        ),
      ),
      home: Provider<ApiService>(
        create: (_) => ApiService(),
        child: const HomeScreen(),
      ),
    );
  }
}
```

### 4. Home Screen

```dart
// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../models/room.dart';
import 'room_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late ApiService _apiService;
  List<Room> _rooms = [];
  bool _isLoading = false;
  String? _error;
  int _currentPage = 0; // 0: Rooms, 1: Bookings

  @override
  void initState() {
    super.initState();
    _apiService = context.read<ApiService>();
    _loadRooms();
  }

  Future<void> _loadRooms() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final rooms = await _apiService.getRooms();
      setState(() {
        _rooms = rooms;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Room Booking System'),
        elevation: 2,
      ),
      body: _currentPage == 0 ? _buildRoomsTab() : _buildBookingsTab(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentPage,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.meeting_room),
            label: 'Rooms',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'My Bookings',
          ),
        ],
        onTap: (index) {
          setState(() {
            _currentPage = index;
          });
        },
      ),
    );
  }

  Widget _buildRoomsTab() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $_error'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadRooms,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_rooms.isEmpty) {
      return const Center(
        child: Text('No rooms available'),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadRooms,
      child: ListView.builder(
        itemCount: _rooms.length,
        itemBuilder: (context, index) {
          final room = _rooms[index];
          return RoomCard(
            room: room,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => RoomDetailScreen(room: room),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildBookingsTab() {
    return const Center(
      child: Text('My Bookings'),
    );
  }
}

class RoomCard extends StatelessWidget {
  final Room room;
  final VoidCallback onTap;

  const RoomCard({
    Key? key,
    required this.room,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(8),
      child: ListTile(
        title: Text(room.name),
        subtitle: Text('${room.capacity} people • ${room.location}'),
        trailing: Chip(
          label: Text(room.status),
          backgroundColor: room.status == 'active' ? Colors.green : Colors.grey,
          labelStyle: const TextStyle(color: Colors.white),
        ),
        onTap: onTap,
      ),
    );
  }
}
```

### 5. Room Detail Screen

```dart
// lib/screens/room_detail_screen.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/room.dart';
import '../services/api_service.dart';

class RoomDetailScreen extends StatefulWidget {
  final Room room;

  const RoomDetailScreen({
    Key? key,
    required this.room,
  }) : super(key: key);

  @override
  State<RoomDetailScreen> createState() => _RoomDetailScreenState();
}

class _RoomDetailScreenState extends State<RoomDetailScreen> {
  late DateTime _selectedStartDate;
  late DateTime _selectedEndDate;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  int _attendeeCount = 1;
  bool _isBooking = false;

  @override
  void initState() {
    super.initState();
    _selectedStartDate = DateTime.now();
    _selectedEndDate = DateTime.now().add(const Duration(hours: 1));
  }

  Future<void> _selectDateTime(
    BuildContext context,
    bool isStartTime,
  ) async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: isStartTime ? _selectedStartDate : _selectedEndDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );

    if (pickedDate != null) {
      final pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(
          isStartTime ? _selectedStartDate : _selectedEndDate,
        ),
      );

      if (pickedTime != null) {
        final newDateTime = DateTime(
          pickedDate.year,
          pickedDate.month,
          pickedDate.day,
          pickedTime.hour,
          pickedTime.minute,
        );

        setState(() {
          if (isStartTime) {
            _selectedStartDate = newDateTime;
          } else {
            _selectedEndDate = newDateTime;
          }
        });
      }
    }
  }

  Future<void> _createBooking() async {
    if (_titleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter meeting title')),
      );
      return;
    }

    setState(() {
      _isBooking = true;
    });

    try {
      final apiService = context.read<ApiService>();
      await apiService.createBooking(
        roomId: widget.room.id,
        startTime: _selectedStartDate,
        endTime: _selectedEndDate,
        title: _titleController.text,
        description: _descriptionController.text,
        attendeeCount: _attendeeCount,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Booking created successfully')),
      );

      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    } finally {
      setState(() {
        _isBooking = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.room.name),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Room Info
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Room Details',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text('Location: ${widget.room.location}'),
                    Text('Capacity: ${widget.room.capacity} people'),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: widget.room.amenities
                          .map((amenity) => Chip(label: Text(amenity)))
                          .toList(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Booking Form
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Book Meeting',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _titleController,
                      decoration: const InputDecoration(
                        labelText: 'Meeting Title',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ListTile(
                      title: const Text('Start Time'),
                      subtitle: Text(
                        DateFormat('MMM dd, yyyy HH:mm')
                            .format(_selectedStartDate),
                      ),
                      trailing: const Icon(Icons.calendar_today),
                      onTap: () => _selectDateTime(context, true),
                    ),
                    ListTile(
                      title: const Text('End Time'),
                      subtitle: Text(
                        DateFormat('MMM dd, yyyy HH:mm')
                            .format(_selectedEndDate),
                      ),
                      trailing: const Icon(Icons.calendar_today),
                      onTap: () => _selectDateTime(context, false),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _descriptionController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Description',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Text('Attendees: '),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.remove),
                          onPressed: () {
                            setState(() {
                              if (_attendeeCount > 1) _attendeeCount--;
                            });
                          },
                        ),
                        Text(_attendeeCount.toString()),
                        IconButton(
                          icon: const Icon(Icons.add),
                          onPressed: () {
                            setState(() {
                              if (_attendeeCount < widget.room.capacity) {
                                _attendeeCount++;
                              }
                            });
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isBooking ? null : _createBooking,
                        child: _isBooking
                            ? const CircularProgressIndicator()
                            : const Text('Confirm Booking'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }
}
```

## Key Features Implemented

✅ **Cross-platform** - iOS & Android support  
✅ **State Management** - Provider for state  
✅ **Material Design** - Modern UI  
✅ **HTTP Client** - API integration  
✅ **Date/Time Picker** - Flexible scheduling  
✅ **Error Handling** - User-friendly errors  
✅ **Async Operations** - Non-blocking calls  
✅ **Navigation** - Route management  

## Running Mobile App

```bash
# Install dependencies
flutter pub get

# Run on device/emulator
flutter run

# Build APK (Android)
flutter build apk --release

# Build IPA (iOS)
flutter build ios --release
```

## Environment Configuration

Create `.env` file or configure API URL:
```dart
static const String baseUrl = 'http://YOUR_API_URL/api/v1';
```

See [API Reference](../api-specs/api-reference.md) for integration details.
