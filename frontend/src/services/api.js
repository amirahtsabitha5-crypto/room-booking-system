import axios from "axios";
const API_BASE_URL = "http://localhost:8000/api";
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});
export async function getRooms() {
    try {
        const response = await apiClient.get("/rooms");
        return response.data;
    }
    catch (error) {
        console.error("Error fetching rooms:", error);
        return [];
    }
}
export async function getBookings() {
    try {
        const response = await apiClient.get("/bookings");
        return response.data;
    }
    catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
}
export async function createBooking(booking) {
    try {
        // Ensure datetimes are sent as ISO UTC strings to match server expectations
        const payload = {
            ...booking,
            startTime: new Date(booking.startTime).toISOString(),
            endTime: new Date(booking.endTime).toISOString(),
        };
        const response = await apiClient.post("/bookings", payload);
        return response.data;
    }
    catch (error) {
        console.error("Error creating booking:", error);
        return null;
    }
}
export async function updateBooking(id, booking) {
    try {
        const payload = {
            ...booking,
            startTime: new Date(booking.startTime).toISOString(),
            endTime: new Date(booking.endTime).toISOString(),
        };
        await apiClient.put(`/bookings/${id}`, payload);
        return true;
    }
    catch (error) {
        console.error(`Error updating booking ${id}:`, error);
        return false;
    }
}
export async function deleteBooking(id) {
    try {
        await apiClient.delete(`/bookings/${id}`);
        return true;
    }
    catch (error) {
        console.error(`Error deleting booking ${id}:`, error);
        return false;
    }
}
export async function getRoomById(id) {
    try {
        const response = await apiClient.get(`/rooms/${id}`);
        return response.data;
    }
    catch (error) {
        console.error(`Error fetching room ${id}:`, error);
        return null;
    }
}
export async function getBookingById(id) {
    try {
        const response = await apiClient.get(`/bookings/${id}`);
        return response.data;
    }
    catch (error) {
        console.error(`Error fetching booking ${id}:`, error);
        return null;
    }
}
export async function updateBookingStatus(id, status, changedBy, notes) {
    try {
        const payload = {
            newStatus: status,
            changedBy,
            notes
        };
        await apiClient.post(`/bookings/${id}/status`, payload);
        return true;
    }
    catch (error) {
        console.error(`Error updating booking status ${id}:`, error);
        return false;
    }
}
