import { useEffect, useState } from "react";
import { getBookingById, updateBooking, deleteBooking } from "../services/api";
import type { Booking } from "../types";
import "../styles/BookingDetail.css";

interface BookingDetailProps {
  bookingId: number;
  onClose: () => void;
  onUpdate: () => void;
}

function BookingDetail({ bookingId, onClose, onUpdate }: BookingDetailProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    setLoading(true);
    const data = await getBookingById(bookingId);
    if (data) {
      setBooking(data);
      setEditForm({
        id: data.id,
        roomId: data.roomId,
        title: data.title,
        description: data.description,
        bookedBy: data.bookedBy,
        startTime: new Date(data.startTime).toISOString().slice(0, 16),
        endTime: new Date(data.endTime).toISOString().slice(0, 16)
      });
    }
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

  const handleSave = async () => {
    if (!editForm.title.trim() || !editForm.bookedBy.trim()) {
      setMessage("Judul dan nama peminjam harus diisi");
      setMessageType("error");
      return;
    }

    const success = await updateBooking(bookingId, editForm);
    if (success) {
      setMessage("Data berhasil diperbarui");
      setMessageType("success");
      setIsEditing(false);
      onUpdate();
      setTimeout(() => onClose(), 1500);
    } else {
      setMessage("Gagal memperbarui data");
      setMessageType("error");
    }
  };

  const handleDelete = async () => {
    if (confirm("Yakin ingin menghapus peminjaman ini?")) {
      const success = await deleteBooking(bookingId);
      if (success) {
        setMessage("Data berhasil dihapus");
        setMessageType("success");
        onUpdate();
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage("Gagal menghapus data");
        setMessageType("error");
      }
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <p>Data tidak ditemukan</p>
          <button onClick={onClose}>Tutup</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Detail Peminjaman #{booking.id}</h2>

        {message && (
          <div className={`message message-${messageType}`}>
            {message}
          </div>
        )}

        {!isEditing ? (
          <>
            <div className="detail-group">
              <label>Judul</label>
              <p>{booking.title}</p>
            </div>

            <div className="detail-group">
              <label>Peminjam</label>
              <p>{booking.bookedBy}</p>
            </div>

            <div className="detail-group">
              <label>Waktu Mulai</label>
              <p>{formatDateTime(booking.startTime)}</p>
            </div>

            <div className="detail-group">
              <label>Waktu Selesai</label>
              <p>{formatDateTime(booking.endTime)}</p>
            </div>

            {booking.description && (
              <div className="detail-group">
                <label>Deskripsi</label>
                <p>{booking.description}</p>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Hapus
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Tutup
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Judul</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Peminjam</label>
              <input
                type="text"
                value={editForm.bookedBy}
                onChange={(e) => setEditForm({ ...editForm, bookedBy: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Deskripsi</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                Simpan
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Batal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BookingDetail;