import axios from "axios";
import type { Room, Booking, CreateBookingRequest, UpdateBookingRequest } from "../types";

const API_BASE_URL = "http://localhost:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export async function getRooms(): Promise<Room[]> {
  try {
    const response = await apiClient.get<Room[]>("/rooms");
    return response.data;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
}

export async function getBookings(): Promise<Booking[]> {
  try {
    const response = await apiClient.get<Booking[]>("/bookings");
    return response.data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function createBooking(booking: CreateBookingRequest): Promise<Booking | null> {
  try {
    // Ensure datetimes are sent as ISO UTC strings to match server expectations
    const payload = {
      ...booking,
      startTime: new Date(booking.startTime).toISOString(),
      endTime: new Date(booking.endTime).toISOString(),
    };
    const response = await apiClient.post<Booking>("/bookings", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    return null;
  }
}

export async function updateBooking(id: number, booking: UpdateBookingRequest): Promise<boolean> {
  try {
    const payload = {
      ...booking,
      startTime: new Date(booking.startTime).toISOString(),
      endTime: new Date(booking.endTime).toISOString(),
    };
    await apiClient.put(`/bookings/${id}`, payload);
    return true;
  } catch (error) {
    console.error(`Error updating booking ${id}:`, error);
    return false;
  }
}

export async function deleteBooking(id: number): Promise<boolean> {
  try {
    await apiClient.delete(`/bookings/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting booking ${id}:`, error);
    return false;
  }
}

export async function getRoomById(id: number): Promise<Room | null> {
  try {
    const response = await apiClient.get<Room>(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching room ${id}:`, error);
    return null;
  }
}

export async function getBookingById(id: number): Promise<any | null> {
  try {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking ${id}:`, error);
    return null;
  }
}

export async function updateBookingStatus(id: number, status: number, changedBy: string, notes?: string): Promise<boolean> {
  try {
    const payload = {
      newStatus: status,
      changedBy,
      notes
    };
    await apiClient.post(`/bookings/${id}/status`, payload);
    return true;
  } catch (error) {
    console.error(`Error updating booking status ${id}:`, error);
    return false;
  }
}
