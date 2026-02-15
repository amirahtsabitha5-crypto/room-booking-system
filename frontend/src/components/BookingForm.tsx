import { useState, useEffect } from "react";
import { createBooking, getRooms } from "../services/api";
import type { Room, CreateBookingRequest } from "../types";
import "../styles/BookingForm.css";

interface BookingFormProps {
  onBookingCreated: () => void;
}

function BookingForm({ onBookingCreated }: BookingFormProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const todayIsoDate = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState<any>({
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
      setFormData((prev: any) => ({ ...prev, roomId: roomList[0].id }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === "roomId" ? parseInt(value) : value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.roomId) return "Pilih ruangan terlebih dahulu";
    if (!formData.title.trim()) return "Judul peminjaman tidak boleh kosong";
    if (!formData.bookedBy.trim()) return "Nama peminjam tidak boleh kosong";

    // Build Date objects from date + clock + am/pm
    const buildDate = (date: string, clock: string, ampm: string) => {
      let [hh, mm] = clock.split(":").map(s => parseInt(s, 10));
      if (ampm === "PM" && hh < 12) hh += 12;
      if (ampm === "AM" && hh === 12) hh = 0;
      return new Date(`${date}T${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:00`);
    };

    const start = buildDate(formData.startDate, formData.startClock, formData.startAmPm);
    const end = buildDate(formData.endDate, formData.endClock, formData.endAmPm);

    if (start >= end) return "Waktu selesai harus setelah waktu mulai";
    if (start < new Date()) return "Waktu mulai harus di masa depan";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setMessage(error);
      return;
    }

    setLoading(true);
    setMessage("");

    // assemble ISO UTC strings from split fields
    const toIsoUtc = (date: string, clock: string, ampm: string) => {
      let [hh, mm] = clock.split(":").map(s => parseInt(s, 10));
      if (ampm === "PM" && hh < 12) hh += 12;
      if (ampm === "AM" && hh === 12) hh = 0;
      // create local Date then convert to ISO UTC string
      const local = new Date(`${date}T${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:00`);
      return new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString();
    };

    const payload: CreateBookingRequest = {
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
    } else {
      setMessage("✗ Gagal membuat peminjaman. Silakan coba lagi.");
    }

    setLoading(false);
  };

  return (
    <div className="booking-form-container">
      <h2>Buat Peminjaman Ruangan</h2>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="roomId">Ruangan:</label>
          <select
            id="roomId"
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            required
          >
            <option value="">-- Pilih Ruangan --</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.name} (Kapasitas: {room.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Judul Peminjaman:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Misal: Rapat Tim Development"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Deskripsi (Opsional):</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Deskripsi kegiatan..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Waktu Mulai:</label>
            <div className="inline-fields">
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
              <input
                type="time"
                id="startClock"
                name="startClock"
                value={formData.startClock}
                onChange={handleChange}
                required
              />
              <select id="startAmPm" name="startAmPm" value={formData.startAmPm} onChange={handleChange}>
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Waktu Selesai:</label>
            <div className="inline-fields">
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
              <input
                type="time"
                id="endClock"
                name="endClock"
                value={formData.endClock}
                onChange={handleChange}
                required
              />
              <select id="endAmPm" name="endAmPm" value={formData.endAmPm} onChange={handleChange}>
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bookedBy">Nama Peminjam:</label>
          <input
            type="text"
            id="bookedBy"
            name="bookedBy"
            value={formData.bookedBy}
            onChange={handleChange}
            placeholder="Masukkan nama Anda"
            required
          />
        </div>

        {message && (
          <div className={`message ${message.includes("✓") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="submit-btn"
        >
          {loading ? "Memproses..." : "Buat Peminjaman"}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
