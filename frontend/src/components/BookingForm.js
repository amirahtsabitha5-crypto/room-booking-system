import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { createBooking, getRooms } from "../services/api";
import "../styles/BookingForm.css";
function BookingForm({ onBookingCreated }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const todayIsoDate = new Date().toISOString().slice(0, 10);
    const [formData, setFormData] = useState({
        roomId: 0,
        title: "",
        description: "",
        // split date/time into date + clock + ampm for AM/PM UI
        startDate: todayIsoDate,
        startClock: "09:00",
        startAmPm: "AM",
        endDate: todayIsoDate,
        endClock: "10:00",
        endAmPm: "AM",
        bookedBy: ""
    });
    useEffect(() => {
        loadRooms();
    }, []);
    const loadRooms = async () => {
        const roomList = await getRooms();
        setRooms(roomList);
        if (roomList.length > 0) {
            setFormData((prev) => ({ ...prev, roomId: roomList[0].id }));
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "roomId" ? parseInt(value) : value
        }));
    };
    const validateForm = () => {
        if (!formData.roomId)
            return "Pilih ruangan terlebih dahulu";
        if (!formData.title.trim())
            return "Judul peminjaman tidak boleh kosong";
        if (!formData.bookedBy.trim())
            return "Nama peminjam tidak boleh kosong";
        // Build Date objects from date + clock + am/pm
        const buildDate = (date, clock, ampm) => {
            let [hh, mm] = clock.split(":").map(s => parseInt(s, 10));
            if (ampm === "PM" && hh < 12)
                hh += 12;
            if (ampm === "AM" && hh === 12)
                hh = 0;
            return new Date(`${date}T${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:00`);
        };
        const start = buildDate(formData.startDate, formData.startClock, formData.startAmPm);
        const end = buildDate(formData.endDate, formData.endClock, formData.endAmPm);
        if (start >= end)
            return "Waktu selesai harus setelah waktu mulai";
        if (start < new Date())
            return "Waktu mulai harus di masa depan";
        return null;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const error = validateForm();
        if (error) {
            setMessage(error);
            return;
        }
        setLoading(true);
        setMessage("");
        // assemble ISO UTC strings from split fields
        const toIsoUtc = (date, clock, ampm) => {
            let [hh, mm] = clock.split(":").map(s => parseInt(s, 10));
            if (ampm === "PM" && hh < 12)
                hh += 12;
            if (ampm === "AM" && hh === 12)
                hh = 0;
            // create local Date then convert to ISO UTC string
            const local = new Date(`${date}T${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:00`);
            return new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString();
        };
        const payload = {
            roomId: formData.roomId,
            title: formData.title,
            description: formData.description,
            startTime: toIsoUtc(formData.startDate, formData.startClock, formData.startAmPm),
            endTime: toIsoUtc(formData.endDate, formData.endClock, formData.endAmPm),
            bookedBy: formData.bookedBy
        };
        const booking = await createBooking(payload);
        if (booking) {
            setMessage("✓ Peminjaman berhasil dibuat!");
            setFormData({
                roomId: rooms[0]?.id || 0,
                title: "",
                description: "",
                startTime: "",
                endTime: "",
                bookedBy: ""
            });
            onBookingCreated();
            setTimeout(() => setMessage(""), 3000);
        }
        else {
            setMessage("✗ Gagal membuat peminjaman. Silakan coba lagi.");
        }
        setLoading(false);
    };
    return (_jsxs("div", { className: "booking-form-container", children: [_jsx("h2", { children: "Buat Peminjaman Ruangan" }), _jsxs("form", { className: "booking-form", onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "roomId", children: "Ruangan:" }), _jsxs("select", { id: "roomId", name: "roomId", value: formData.roomId, onChange: handleChange, required: true, children: [_jsx("option", { value: "", children: "-- Pilih Ruangan --" }), rooms.map(room => (_jsxs("option", { value: room.id, children: [room.name, " (Kapasitas: ", room.capacity, ")"] }, room.id)))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "title", children: "Judul Peminjaman:" }), _jsx("input", { type: "text", id: "title", name: "title", value: formData.title, onChange: handleChange, placeholder: "Misal: Rapat Tim Development", required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "description", children: "Deskripsi (Opsional):" }), _jsx("textarea", { id: "description", name: "description", value: formData.description, onChange: handleChange, placeholder: "Deskripsi kegiatan...", rows: 3 })] }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Waktu Mulai:" }), _jsxs("div", { className: "inline-fields", children: [_jsx("input", { type: "date", id: "startDate", name: "startDate", value: formData.startDate, onChange: handleChange, required: true }), _jsx("input", { type: "time", id: "startClock", name: "startClock", value: formData.startClock, onChange: handleChange, required: true }), _jsxs("select", { id: "startAmPm", name: "startAmPm", value: formData.startAmPm, onChange: handleChange, children: [_jsx("option", { children: "AM" }), _jsx("option", { children: "PM" })] })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Waktu Selesai:" }), _jsxs("div", { className: "inline-fields", children: [_jsx("input", { type: "date", id: "endDate", name: "endDate", value: formData.endDate, onChange: handleChange, required: true }), _jsx("input", { type: "time", id: "endClock", name: "endClock", value: formData.endClock, onChange: handleChange, required: true }), _jsxs("select", { id: "endAmPm", name: "endAmPm", value: formData.endAmPm, onChange: handleChange, children: [_jsx("option", { children: "AM" }), _jsx("option", { children: "PM" })] })] })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "bookedBy", children: "Nama Peminjam:" }), _jsx("input", { type: "text", id: "bookedBy", name: "bookedBy", value: formData.bookedBy, onChange: handleChange, placeholder: "Masukkan nama Anda", required: true })] }), message && (_jsx("div", { className: `message ${message.includes("✓") ? "success" : "error"}`, children: message })), _jsx("button", { type: "submit", disabled: loading, className: "submit-btn", children: loading ? "Memproses..." : "Buat Peminjaman" })] })] }));
}
export default BookingForm;
