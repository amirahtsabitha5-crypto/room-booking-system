export enum BookingStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Completed = 4,
  Cancelled = 5
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  location?: string;
  description?: string;
  type?: number;
  isAvailable?: boolean;
}

export interface StatusHistory {
  id: number;
  bookingId: number;
  oldStatus: BookingStatus;
  newStatus: BookingStatus;
  changedBy: string;
  changedAt: string;
  notes?: string;
}

export interface Booking {
  id: number;
  roomId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
  status?: BookingStatus;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  statusHistory?: StatusHistory[];
}

export interface CreateBookingRequest {
  roomId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
}

export interface UpdateBookingRequest {
  id: number;
  roomId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
}
