import { useEffect, useState } from "react";
import { getBookings, getRooms, updateBooking, deleteBooking } from "../services/api";
import type { Booking, Room, UpdateBookingRequest } from "../types";
import "../styles/BookingList.css";

interface BookingListProps {
  refreshTrigger: number;
}

interface EditFormData {
  id: number;
  roomId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
}

function BookingList({ refreshTrigger }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Map<number, Room>>(new Map());
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    const [bookingList, roomList] = await Promise.all([
      getBookings(),
      getRooms()
    ]);

    setBookings(bookingList);

    // Buat map untuk quick lookup room by id
    const roomMap = new Map(roomList.map(r => [r.id, r]));
    setRooms(roomMap);

    setLoading(false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const formatDateTimeForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getRoomName = (roomId: number) => {
    return rooms.get(roomId)?.name || `Ruangan #${roomId}`;
  };

  const handleEditClick = (booking: Booking) => {
    setEditingId(booking.id);
    setEditForm({
      id: booking.id,
      roomId: booking.roomId,
      title: booking.title,
      description: booking.description,
      startTime: formatDateTimeForInput(booking.startTime),
      endTime: formatDateTimeForInput(booking.endTime),
      bookedBy: booking.bookedBy
    });
  };

  const handleEditChange = (field: keyof EditFormData, value: string | number) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    if (!editForm.title.trim()) {
      alert("Judul peminjaman harus diisi");
      return;
    }
    if (!editForm.bookedBy.trim()) {
      alert("Nama peminjam harus diisi");
      return;
    }
    if (editForm.startTime >= editForm.endTime) {
      alert("Waktu mulai harus lebih kecil dari waktu selesai");
      return;
    }

    setSaving(true);
    const updateRequest: UpdateBookingRequest = {
      id: editForm.id,
      roomId: editForm.roomId,
      title: editForm.title,
      description: editForm.description,
      startTime: editForm.startTime,
      endTime: editForm.endTime,
      bookedBy: editForm.bookedBy
    };

    const success = await updateBooking(editForm.id, updateRequest);
    setSaving(false);

    if (success) {
      await loadData();
      setEditingId(null);
      setEditForm(null);
      alert("Peminjaman berhasil diperbarui");
    } else {
      alert("Gagal memperbarui peminjaman");
    }
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Yakin ingin menghapus peminjaman ini?")) {
      return;
    }

    setDeleting(id);
    const success = await deleteBooking(id);
    setDeleting(null);

    if (success) {
      await loadData();
      alert("Peminjaman berhasil dihapus");
    } else {
      alert("Gagal menghapus peminjaman");
    }
  };

  if (loading) {
    return <div className="booking-list-container loading">Memuat data...</div>;
  }

  return (
    <div className="booking-list-container">
      <h2>Daftar Peminjaman Ruangan</h2>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada peminjaman ruangan.</p>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map(booking => (
            <div 
              key={booking.id} 
              className={`booking-card room-${booking.roomId}`}
            >
              <div className="card-header">
                <h3>{booking.title}</h3>
                <span className="booking-id">#{booking.id}</span>
              </div>

              <div className="card-body">
                <div className="info-item">
                  <span className="label">Ruangan:</span>
                  <span className="value">{getRoomName(booking.roomId)}</span>
                </div>

                <div className="info-item">
                  <span className="label">Peminjam:</span>
                  <span className="value">{booking.bookedBy}</span>
                </div>

                <div className="info-item">
                  <span className="label">Waktu Mulai:</span>
                  <span className="value">
                    {formatDateTime(booking.startTime)}
                  </span>
                </div>

                <div className="info-item">
                  <span className="label">Waktu Selesai:</span>
                  <span className="value">
                    {formatDateTime(booking.endTime)}
                  </span>
                </div>

                {booking.description && (
                  <div className="info-item">
                    <span className="label">Deskripsi:</span>
                    <span className="value description">
                      {booking.description}
                    </span>
                  </div>
                )}

                <div className="info-item">
                  <span className="label">Dibuat:</span>
                  <span className="value small">
                    {formatDateTime(booking.createdAt)}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn btn-edit"
                  onClick={() => handleEditClick(booking)}
                  disabled={editingId !== null || deleting !== null}
                >
                  ✎ Edit
                </button>
                <button 
                  className="btn btn-delete"
                  onClick={() => handleDeleteClick(booking.id)}
                  disabled={editingId !== null || deleting === booking.id}
                >
                  {deleting === booking.id ? "Menghapus..." : "🗑 Hapus"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId !== null && editForm && (
        <div className="modal-overlay" onClick={() => setEditingId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Ubah Peminjaman Ruangan #{editForm.id}</h3>
            
            <div className="form-group">
              <label>Judul Peminjaman</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => handleEditChange("title", e.target.value)}
                placeholder="Masukkan judul peminjaman"
              />
            </div>

            <div className="form-group">
              <label>Nama Peminjam</label>
              <input
                type="text"
                value={editForm.bookedBy}
                onChange={(e) => handleEditChange("bookedBy", e.target.value)}
                placeholder="Masukkan nama peminjam"
              />
            </div>

            <div className="form-group">
              <label>Ruangan</label>
              <select
                value={editForm.roomId}
                onChange={(e) => handleEditChange("roomId", parseInt(e.target.value))}
              >
                <option value="">Pilih Ruangan</option>
                {Array.from(rooms.values()).map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Waktu Mulai</label>
              <input
                type="datetime-local"
                value={editForm.startTime}
                onChange={(e) => handleEditChange("startTime", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Waktu Selesai</label>
              <input
                type="datetime-local"
                value={editForm.endTime}
                onChange={(e) => handleEditChange("endTime", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Deskripsi (Opsional)</label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleEditChange("description", e.target.value)}
                placeholder="Masukkan deskripsi"
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setEditingId(null)}
                disabled={saving}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingList;
