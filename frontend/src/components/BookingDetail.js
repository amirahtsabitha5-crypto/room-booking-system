import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getBookingById, updateBooking, deleteBooking } from "../services/api";
import "../styles/BookingDetail.css";
function BookingDetail({ bookingId, onClose, onUpdate }) {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("info");
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
        }
        else {
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
            }
            else {
                setMessage("Gagal menghapus data");
                setMessageType("error");
            }
        }
    };
    if (loading) {
        return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsx("div", { className: "modal-content", onClick: e => e.stopPropagation(), children: _jsx("p", { children: "Memuat data..." }) }) }));
    }
    if (!booking) {
        return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal-content", onClick: e => e.stopPropagation(), children: [_jsx("p", { children: "Data tidak ditemukan" }), _jsx("button", { onClick: onClose, children: "Tutup" })] }) }));
    }
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal-content", onClick: e => e.stopPropagation(), children: [_jsxs("h2", { children: ["Detail Peminjaman #", booking.id] }), message && (_jsx("div", { className: `message message-${messageType}`, children: message })), !isEditing ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "detail-group", children: [_jsx("label", { children: "Judul" }), _jsx("p", { children: booking.title })] }), _jsxs("div", { className: "detail-group", children: [_jsx("label", { children: "Peminjam" }), _jsx("p", { children: booking.bookedBy })] }), _jsxs("div", { className: "detail-group", children: [_jsx("label", { children: "Waktu Mulai" }), _jsx("p", { children: formatDateTime(booking.startTime) })] }), _jsxs("div", { className: "detail-group", children: [_jsx("label", { children: "Waktu Selesai" }), _jsx("p", { children: formatDateTime(booking.endTime) })] }), booking.description && (_jsxs("div", { className: "detail-group", children: [_jsx("label", { children: "Deskripsi" }), _jsx("p", { children: booking.description })] })), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { className: "btn btn-primary", onClick: () => setIsEditing(true), children: "Edit" }), _jsx("button", { className: "btn btn-danger", onClick: handleDelete, children: "Hapus" }), _jsx("button", { className: "btn btn-secondary", onClick: onClose, children: "Tutup" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Judul" }), _jsx("input", { type: "text", value: editForm.title, onChange: (e) => setEditForm({ ...editForm, title: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Peminjam" }), _jsx("input", { type: "text", value: editForm.bookedBy, onChange: (e) => setEditForm({ ...editForm, bookedBy: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Deskripsi" }), _jsx("textarea", { value: editForm.description, onChange: (e) => setEditForm({ ...editForm, description: e.target.value }), rows: 3 })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { className: "btn btn-primary", onClick: handleSave, children: "Simpan" }), _jsx("button", { className: "btn btn-secondary", onClick: () => setIsEditing(false), children: "Batal" })] })] }))] }) }));
}
export default BookingDetail;
