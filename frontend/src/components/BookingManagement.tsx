import { useEffect, useState } from "react";
import { getBookings, getRooms, updateBooking, deleteBooking, updateBookingStatus } from "../services/api";
import type { Booking, Room, UpdateBookingRequest } from "../types";
import { BookingStatus as BookingStatusEnum } from "../types";
import "../styles/BookingManagement.css";

interface BookingManagementProps {
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

function BookingManagement({ refreshTrigger }: BookingManagementProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Map<number, Room>>(new Map());
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [changingStatusId, setChangingStatusId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<number | null>(null);
  const [statusNotes, setStatusNotes] = useState("");

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
    const roomMap = new Map(roomList.map(r => [r.id, r]));
    setRooms(roomMap);

    setLoading(false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
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

  const getStatusLabel = (status?: number) => {
    switch (status) {
      case BookingStatusEnum.Pending:
        return "Menunggu";
      case BookingStatusEnum.Approved:
        return "Disetujui";
      case BookingStatusEnum.Rejected:
        return "Ditolak";
      case BookingStatusEnum.Completed:
        return "Selesai";
      case BookingStatusEnum.Cancelled:
        return "Dibatalkan";
      default:
        return "Belum Ditentukan";
    }
  };

  const getStatusColor = (status?: number) => {
    switch (status) {
      case BookingStatusEnum.Pending:
        return "#f39c12"; // orange
      case BookingStatusEnum.Approved:
        return "#27ae60"; // green
      case BookingStatusEnum.Rejected:
        return "#e74c3c"; // red
      case BookingStatusEnum.Completed:
        return "#3498db"; // blue
      case BookingStatusEnum.Cancelled:
        return "#95a5a6"; // gray
      default:
        return "#34495e"; // dark gray
    }
  };

  const handleStatusChangeClick = (booking: Booking) => {
    setChangingStatusId(booking.id);
    setNewStatus(null);
    setStatusNotes("");
  };

  const handleStatusChange = async () => {
    if (changingStatusId === null || newStatus === null) {
      alert("Pilih status baru");
      return;
    }

    setSaving(true);
    const success = await updateBookingStatus(changingStatusId, newStatus, "Admin", statusNotes);
    setSaving(false);

    if (success) {
      await loadData();
      setChangingStatusId(null);
      setNewStatus(null);
      setStatusNotes("");
      alert("Status peminjaman berhasil diperbarui");
    } else {
      alert("Gagal memperbarui status peminjaman");
    }
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
    return <div className="booking-management-container loading">Memuat data...</div>;
  }

  return (
    <div className="booking-management-container">
      <h2>📋 Kelola Peminjaman Ruangan</h2>
      <p className="subtitle">Edit atau hapus data peminjaman ruangan</p>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada peminjaman ruangan.</p>
        </div>
      ) : (
        <div className="management-content">
          <div className="table-wrapper">
            <table className="management-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Judul</th>
                  <th>Ruangan</th>
                  <th>Peminjam</th>
                  <th>Waktu Mulai</th>
                  <th>Waktu Selesai</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id} className="row-item">
                    <td className="id-cell">{booking.id}</td>
                    <td className="title-cell">{booking.title}</td>
                    <td className="room-cell">{getRoomName(booking.roomId)}</td>
                    <td className="bookedby-cell">{booking.bookedBy}</td>
                    <td className="time-cell">{formatDateTime(booking.startTime)}</td>
                    <td className="time-cell">{formatDateTime(booking.endTime)}</td>
                    <td className="status-cell">
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button 
                        className="btn-action btn-status-small"
                        onClick={() => handleStatusChangeClick(booking)}
                        disabled={editingId !== null || deleting !== null}
                        title="Ubah status peminjaman"
                      >
                        ⚙ Status
                      </button>
                      <button 
                        className="btn-action btn-edit-small"
                        onClick={() => handleEditClick(booking)}
                        disabled={editingId !== null || deleting !== null}
                        title="Edit peminjaman"
                      >
                        ✎ Edit
                      </button>
                      <button 
                        className="btn-action btn-delete-small"
                        onClick={() => handleDeleteClick(booking.id)}
                        disabled={editingId !== null || deleting === booking.id}
                        title="Hapus peminjaman"
                      >
                        {deleting === booking.id ? "..." : "🗑"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="stats">
            <p>Total Peminjaman: <strong>{bookings.length}</strong></p>
          </div>
        </div>
      )}

      {editingId !== null && editForm && (
        <div className="modal-overlay" onClick={() => setEditingId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>✎ Ubah Peminjaman Ruangan #{editForm.id}</h3>
            
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

            <div className="form-row">
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
            </div>

            <div className="form-row">
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
                className="btn-modal btn-save"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? "⏳ Menyimpan..." : "✓ Simpan Perubahan"}
              </button>
              <button 
                className="btn-modal btn-cancel"
                onClick={() => setEditingId(null)}
                disabled={saving}
              >
                ✕ Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {changingStatusId !== null && (
        <div className="modal-overlay" onClick={() => setChangingStatusId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>⚙ Ubah Status Peminjaman</h3>
            
            <div className="form-group">
              <label>Status Baru</label>
              <select
                value={newStatus || ""}
                onChange={(e) => setNewStatus(parseInt(e.target.value))}
              >
                <option value="">Pilih Status Baru</option>
                <option value={BookingStatusEnum.Pending}>Menunggu</option>
                <option value={BookingStatusEnum.Approved}>Disetujui</option>
                <option value={BookingStatusEnum.Rejected}>Ditolak</option>
                <option value={BookingStatusEnum.Completed}>Selesai</option>
                <option value={BookingStatusEnum.Cancelled}>Dibatalkan</option>
              </select>
            </div>

            <div className="form-group">
              <label>Catatan (Opsional)</label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Masukkan catatan untuk perubahan status (misal: alasan penolakan)"
                rows={4}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-modal btn-save"
                onClick={handleStatusChange}
                disabled={saving || newStatus === null}
              >
                {saving ? "⏳ Menyimpan..." : "✓ Simpan Status"}
              </button>
              <button 
                className="btn-modal btn-cancel"
                onClick={() => setChangingStatusId(null)}
                disabled={saving}
              >
                ✕ Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingManagement;
