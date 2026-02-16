# Frontend Implementation - React

## Overview

Frontend application menggunakan React 18 + TypeScript dengan Vite build tool untuk performance optimization.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── services/        # API services
│   ├── styles/          # CSS files
│   ├── types/           # TypeScript types
│   ├── main.tsx         # App entry point
│   └── App.tsx          # Root component
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Core Implementation Examples

### 1. API Service

```typescript
// src/services/api.ts
import axios, { AxiosInstance } from 'axios';

interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  status: string;
}

interface Booking {
  id: number;
  roomId: number;
  startTime: string;
  endTime: string;
  title: string;
  status: string;
}

interface CreateBookingDTO {
  roomId: number;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  attendeeCount: number;
}

class ApiService {
  private api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  
  // Rooms
  async getRooms(page = 1, pageSize = 10): Promise<{ data: Room[] }> {
    const response = await this.api.get('/rooms', {
      params: { page, pageSize },
    });
    return response.data;
  }
  
  async getRoom(id: number): Promise<Room> {
    const response = await this.api.get(`/rooms/${id}`);
    return response.data;
  }
  
  // Bookings
  async getBookings(): Promise<Booking[]> {
    const response = await this.api.get('/bookings');
    return response.data;
  }
  
  async createBooking(booking: CreateBookingDTO): Promise<Booking> {
    const response = await this.api.post('/bookings', booking);
    return response.data;
  }
  
  async cancelBooking(id: number): Promise<void> {
    await this.api.delete(`/bookings/${id}`);
  }
  
  // Auth
  async login(email: string, password: string): Promise<any> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }
}

export const apiService = new ApiService();
```

### 2. Room List Component

```typescript
// src/components/RoomList.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface Room {
  id: number;
  name: string;
  capacity: number;
  amenities: string[];
  status: string;
}

export const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchRooms();
  }, []);
  
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRooms();
      setRooms(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading rooms...</div>;
  if (error) return <div className="error">{error}</div>;
  
  return (
    <div className="room-list">
      <h2>Available Meeting Rooms</h2>
      <div className="rooms-grid">
        {rooms.map((room) => (
          <div key={room.id} className="room-card">
            <h3>{room.name}</h3>
            <p>Capacity: {room.capacity} people</p>
            <div className="amenities">
              {room.amenities.map((amenity) => (
                <span key={amenity} className="amenity-tag">
                  {amenity}
                </span>
              ))}
            </div>
            <status className={`status ${room.status}`}>
              {room.status}
            </status>
            <button>Book Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. Booking Form Component

```typescript
// src/components/BookingForm.tsx
import React, { useState, FormEvent } from 'react';
import { apiService } from '../services/api';

interface BookingFormProps {
  roomId: number;
  onSuccess: (booking: any) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ roomId, onSuccess }) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    title: '',
    description: '',
    attendeeCount: 1,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'attendeeCount' ? parseInt(value) : value,
    }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const booking = await apiService.createBooking({
        roomId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        title: formData.title,
        description: formData.description,
        attendeeCount: formData.attendeeCount,
      });
      
      setFormData({
        startTime: '',
        endTime: '',
        title: '',
        description: '',
        attendeeCount: 1,
      });
      
      onSuccess(booking);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h3>Book Meeting Room</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="form-group">
        <label>Meeting Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Start Time</label>
        <input
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>End Time</label>
        <input
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Number of Attendees</label>
        <input
          type="number"
          name="attendeeCount"
          min="1"
          value={formData.attendeeCount}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  );
};
```

### 4. Main App Component

```typescript
// src/App.tsx
import React, { useState, useEffect } from 'react';
import { RoomList } from './components/RoomList';
import { BookingForm } from './components/BookingForm';
import { BookingList } from './components/BookingList';
import './styles/App.css';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState('rooms');
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Load user info from token or API
      loadUserInfo();
    }
  }, []);
  
  const loadUserInfo = async () => {
    // Fetch user info from API or decode JWT
    // setUser(userData);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };
  
  if (!user) {
    return <div>Please log in to continue</div>;
  }
  
  return (
    <div className="app">
      <header className="app-header">
        <h1>Room Booking System</h1>
        <div className="user-menu">
          <span>{user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <nav className="app-nav">
        <button
          className={currentPage === 'rooms' ? 'active' : ''}
          onClick={() => setCurrentPage('rooms')}
        >
          Available Rooms
        </button>
        <button
          className={currentPage === 'bookings' ? 'active' : ''}
          onClick={() => setCurrentPage('bookings')}
        >
          My Bookings
        </button>
      </nav>
      
      <main className="app-main">
        {currentPage === 'rooms' && (
          <div className="rooms-section">
            <RoomList />
          </div>
        )}
        
        {currentPage === 'bookings' && (
          <div className="bookings-section">
            <BookingList />
          </div>
        )}
        
        {selectedRoom && (
          <div className="booking-modal">
            <BookingForm
              roomId={selectedRoom}
              onSuccess={(booking) => {
                setSelectedRoom(null);
                setCurrentPage('bookings');
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
```

### 5. Styling

```css
/* src/styles/App.css */

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.app-header {
  background-color: #0066cc;
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.user-menu {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.app-nav {
  background-color: #f5f5f5;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #ddd;
}

.app-nav button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  border-bottom: 2px solid transparent;
}

.app-nav button.active {
  color: #0066cc;
  border-bottom-color: #0066cc;
  font-weight: bold;
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.room-list {
  width: 100%;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.room-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: box-shadow 0.3s ease;
}

.room-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.room-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.amenity-tag {
  display: inline-block;
  background-color: #e8f0ff;
  color: #0066cc;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.booking-form {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 2rem;
  background: white;
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

button {
  background-color: #0066cc;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #0052a3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
```

## Key Features Implemented

✅ **Component-based Architecture** - Reusable React components  
✅ **TypeScript** - Type safety  
✅ **Axios** - HTTP client with interceptors  
✅ **State Management** - useState hooks  
✅ **Form Handling** - Form validation and submission  
✅ **Error Handling** - User-friendly error messages  
✅ **Responsive Design** - Mobile-friendly UI  
✅ **Authentication** - JWT token management  

## Running Frontend

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api/v1
```

See [API Reference](../api-specs/api-reference.md) for integration details.
