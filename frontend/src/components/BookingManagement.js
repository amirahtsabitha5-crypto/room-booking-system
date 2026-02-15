import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getBookings, getRooms, updateBooking, deleteBooking, updateBookingStatus } from "../services/api";
import { BookingStatus as BookingStatusEnum } from "../types";
import "../styles/BookingManagement.css";
function BookingManagement({ refreshTrigger }) {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [changingStatusId, setChangingStatusId] = useState(null);
    const [newStatus, setNewStatus] = useState(null);
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
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
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
    const getStatusLabel = (status) => {
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
    const getStatusColor = (status) => {
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
    const handleStatusChangeClick = (booking) => {
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
        }
        else {
            alert("Gagal memperbarui status peminjaman");
        }
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
        return _jsx("div", { className: "booking-management-container loading", children: "Memuat data..." });
    }
    return (_jsxs("div", { className: "booking-management-container", children: [_jsx("h2", { children: "\uD83D\uDCCB Kelola Peminjaman Ruangan" }), _jsx("p", { className: "subtitle", children: "Edit atau hapus data peminjaman ruangan" }), bookings.length === 0 ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "Belum ada peminjaman ruangan." }) })) : (_jsxs("div", { className: "management-content", children: [_jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "management-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "Judul" }), _jsx("th", { children: "Ruangan" }), _jsx("th", { children: "Peminjam" }), _jsx("th", { children: "Waktu Mulai" }), _jsx("th", { children: "Waktu Selesai" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Aksi" })] }) }), _jsx("tbody", { children: bookings.map(booking => (_jsxs("tr", { className: "row-item", children: [_jsx("td", { className: "id-cell", children: booking.id }), _jsx("td", { className: "title-cell", children: booking.title }), _jsx("td", { className: "room-cell", children: getRoomName(booking.roomId) }), _jsx("td", { className: "bookedby-cell", children: booking.bookedBy }), _jsx("td", { className: "time-cell", children: formatDateTime(booking.startTime) }), _jsx("td", { className: "time-cell", children: formatDateTime(booking.endTime) }), _jsx("td", { className: "status-cell", children: _jsx("span", { className: "status-badge", style: { backgroundColor: getStatusColor(booking.status) }, children: getStatusLabel(booking.status) }) }), _jsxs("td", { className: "action-cell", children: [_jsx("button", { className: "btn-action btn-status-small", onClick: () => handleStatusChangeClick(booking), disabled: editingId !== null || deleting !== null, title: "Ubah status peminjaman", children: "\u2699 Status" }), _jsx("button", { className: "btn-action btn-edit-small", onClick: () => handleEditClick(booking), disabled: editingId !== null || deleting !== null, title: "Edit peminjaman", children: "\u270E Edit" }), _jsx("button", { className: "btn-action btn-delete-small", onClick: () => handleDeleteClick(booking.id), disabled: editingId !== null || deleting === booking.id, title: "Hapus peminjaman", children: deleting === booking.id ? "..." : "🗑" })] })] }, booking.id))) })] }) }), _jsx("div", { className: "stats", children: _jsxs("p", { children: ["Total Peminjaman: ", _jsx("strong", { children: bookings.length })] }) })] })), editingId !== null && editForm && (_jsx("div", { className: "modal-overlay", onClick: () => setEditingId(null), children: _jsxs("div", { className: "modal-content", onClick: e => e.stopPropagation(), children: [_jsxs("h3", { children: ["\u270E Ubah Peminjaman Ruangan #", editForm.id] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Judul Peminjaman" }), _jsx("input", { type: "text", value: editForm.title, onChange: (e) => handleEditChange("title", e.target.value), placeholder: "Masukkan judul peminjaman" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Nama Peminjam" }), _jsx("input", { type: "text", value: editForm.bookedBy, onChange: (e) => handleEditChange("bookedBy", e.target.value), placeholder: "Masukkan nama peminjam" })] }), _jsx("div", { className: "form-row", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Ruangan" }), _jsxs("select", { value: editForm.roomId, onChange: (e) => handleEditChange("roomId", parseInt(e.target.value)), children: [_jsx("option", { value: "", children: "Pilih Ruangan" }), Array.from(rooms.values()).map(room => (_jsx("option", { value: room.id, children: room.name }, room.id)))] })] }) }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Waktu Mulai" }), _jsx("input", { type: "datetime-local", value: editForm.startTime, onChange: (e) => handleEditChange("startTime", e.target.value) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Waktu Selesai" }), _jsx("input", { type: "datetime-local", value: editForm.endTime, onChange: (e) => handleEditChange("endTime", e.target.value) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Deskripsi (Opsional)" }), _jsx("textarea", { value: editForm.description, onChange: (e) => handleEditChange("description", e.target.value), placeholder: "Masukkan deskripsi", rows: 3 })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { className: "btn-modal btn-save", onClick: handleSaveEdit, disabled: saving, children: saving ? "⏳ Menyimpan..." : "✓ Simpan Perubahan" }), _jsx("button", { className: "btn-modal btn-cancel", onClick: () => setEditingId(null), disabled: saving, children: "\u2715 Batal" })] })] }) })), changingStatusId !== null && (_jsx("div", { className: "modal-overlay", onClick: () => setChangingStatusId(null), children: _jsxs("div", { className: "modal-content", onClick: e => e.stopPropagation(), children: [_jsx("h3", { children: "\u2699 Ubah Status Peminjaman" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Status Baru" }), _jsxs("select", { value: newStatus || "", onChange: (e) => setNewStatus(parseInt(e.target.value)), children: [_jsx("option", { value: "", children: "Pilih Status Baru" }), _jsx("option", { value: BookingStatusEnum.Pending, children: "Menunggu" }), _jsx("option", { value: BookingStatusEnum.Approved, children: "Disetujui" }), _jsx("option", { value: BookingStatusEnum.Rejected, children: "Ditolak" }), _jsx("option", { value: BookingStatusEnum.Completed, children: "Selesai" }), _jsx("option", { value: BookingStatusEnum.Cancelled, children: "Dibatalkan" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Catatan (Opsional)" }), _jsx("textarea", { value: statusNotes, onChange: (e) => setStatusNotes(e.target.value), placeholder: "Masukkan catatan untuk perubahan status (misal: alasan penolakan)", rows: 4 })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { className: "btn-modal btn-save", onClick: handleStatusChange, disabled: saving || newStatus === null, children: saving ? "⏳ Menyimpan..." : "✓ Simpan Status" }), _jsx("button", { className: "btn-modal btn-cancel", onClick: () => setChangingStatusId(null), disabled: saving, children: "\u2715 Batal" })] })] }) }))] }));
}
export default BookingManagement;
