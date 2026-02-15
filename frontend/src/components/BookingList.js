import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getBookings, getRooms, updateBooking, deleteBooking } from "../services/api";
import "../styles/BookingList.css";
function BookingList({ refreshTrigger }) {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
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
    const formatDateTime = (dateString) => {
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
    const formatDateTimeForInput = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    const getRoomName = (roomId) => {
        return rooms.get(roomId)?.name || `Ruangan #${roomId}`;
    };
    const handleEditClick = (booking) => {
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
    const handleEditChange = (field, value) => {
        if (editForm) {
            setEditForm({
                ...editForm,
                [field]: value
            });
        }
    };
    const handleSaveEdit = async () => {
        if (!editForm)
            return;
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
        const updateRequest = {
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
        }
        else {
            alert("Gagal memperbarui peminjaman");
        }
    };
    const handleDeleteClick = async (id) => {
        if (!confirm("Yakin ingin menghapus peminjaman ini?")) {
            return;
        }
        setDeleting(id);
        const success = await deleteBooking(id);
        setDeleting(null);
        if (success) {
            await loadData();
            alert("Peminjaman berhasil dihapus");
        }
        else {
            alert("Gagal menghapus peminjaman");
        }
    };
    if (loading) {
        return _jsx("div", { className: "booking-list-container loading", children: "Memuat data..." });
    }
    return (_jsxs("div", { className: "booking-list-container", children: [_jsx("h2", { children: "Daftar Peminjaman Ruangan" }), bookings.length === 0 ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "Belum ada peminjaman ruangan." }) })) : (_jsx("div", { className: "bookings-grid", children: bookings.map(booking => (_jsxs("div", { className: `booking-card room-${booking.roomId}`, children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { children: booking.title }), _jsxs("span", { className: "booking-id", children: ["#", booking.id] })] }), _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "info-item", children: [_jsx("span", { className: "label", children: "Ruangan:" }), _jsx("span", { className: "value", children: getRoomName(booking.roomId) })] }), _jsxs("div", { className: "info-item", children: [_jsx("span", { className: "label", children: "Peminjam:" }), _jsx("span", { className: "value", children: booking.bookedBy })] }), _jsxs("div", { className: "info-item", children: [_jsx("span", { className: "label", children: "Waktu Mulai:" }), _jsx("span", { className: "value", children: formatDateTime(booking.startTime) })] }), _jsxs("div", { className: "info-item", children: [_jsx("span", { className: "label", children: "Waktu Selesai:" }), _jsx("span", { className: "value", children: formatDateTime(booking.endTime) })] }), booking.description && (_jsxs("div", { className: "info-item", children: [_jsx("span", { className: "label", children: "Deskripsi:" }), _jsx("span", { className: "value description", children: booking.description })] })), _jsxs("div", { className: "info-item", children: [_jsx("span", { className: "label", children: "Dibuat:" }), _jsx("span", { className: "value small", children: formatDateTime(booking.createdAt) })] })] }), _jsxs("div", { className: "card-actions", children: [_jsx("button", { className: "btn btn-edit", onClick: () => handleEditClick(booking), disabled: editingId !== null || deleting !== null, children: "\u270E Edit" }), _jsx("button", { className: "btn btn-delete", onClick: () => handleDeleteClick(booking.id), disabled: editingId !== null || deleting === booking.id, children: deleting === booking.id ? "Menghapus..." : "🗑 Hapus" })] })] }, booking.id))) })), editingId !== null && editForm && (_jsx("div", { className: "modal-overlay", onClick: () => setEditingId(null), children: _jsxs("div", { className: "modal-content", onClick: e => e.stopPropagation(), children: [_jsxs("h3", { children: ["Ubah Peminjaman Ruangan #", editForm.id] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Judul Peminjaman" }), _jsx("input", { type: "text", value: editForm.title, onChange: (e) => handleEditChange("title", e.target.value), placeholder: "Masukkan judul peminjaman" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Nama Peminjam" }), _jsx("input", { type: "text", value: editForm.bookedBy, onChange: (e) => handleEditChange("bookedBy", e.target.value), placeholder: "Masukkan nama peminjam" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Ruangan" }), _jsxs("select", { value: editForm.roomId, onChange: (e) => handleEditChange("roomId", parseInt(e.target.value)), children: [_jsx("option", { value: "", children: "Pilih Ruangan" }), Array.from(rooms.values()).map(room => (_jsx("option", { value: room.id, children: room.name }, room.id)))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Waktu Mulai" }), _jsx("input", { type: "datetime-local", value: editForm.startTime, onChange: (e) => handleEditChange("startTime", e.target.value) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Waktu Selesai" }), _jsx("input", { type: "datetime-local", value: editForm.endTime, onChange: (e) => handleEditChange("endTime", e.target.value) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Deskripsi (Opsional)" }), _jsx("textarea", { value: editForm.description, onChange: (e) => handleEditChange("description", e.target.value), placeholder: "Masukkan deskripsi", rows: 3 })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { className: "btn btn-primary", onClick: handleSaveEdit, disabled: saving, children: saving ? "Menyimpan..." : "Simpan" }), _jsx("button", { className: "btn btn-secondary", onClick: () => setEditingId(null), disabled: saving, children: "Batal" })] })] }) }))] }));
}
export default BookingList;
