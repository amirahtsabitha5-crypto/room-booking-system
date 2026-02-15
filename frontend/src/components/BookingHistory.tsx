import { useEffect, useState } from "react";
import { getBookings, getRooms } from "../services/api";
import type { Booking, Room } from "../types";
import "../styles/BookingHistory.css";

interface BookingHistoryProps {
  refreshTrigger: number;
}

type SortField = "id" | "title" | "bookedBy" | "startTime" | "room";
type SortOrder = "asc" | "desc";

function BookingHistory({ refreshTrigger }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Map<number, Room>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<SortField>("startTime");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [bookings, searchQuery, selectedRoom, dateFrom, dateTo, sortField, sortOrder]);

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

  const applyFiltersAndSort = () => {
    let filtered = [...bookings];

    // Filter by search query (title, bookedBy)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.title.toLowerCase().includes(query) ||
          b.bookedBy.toLowerCase().includes(query)
      );
    }

    // Filter by room
    if (selectedRoom !== "all") {
      filtered = filtered.filter(b => b.roomId === parseInt(selectedRoom));
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom).getTime();
      filtered = filtered.filter(
        b => new Date(b.startTime).getTime() >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        b => new Date(b.startTime).getTime() <= toDate.getTime()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "id":
          aValue = a.id;
          bValue = b.id;
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "bookedBy":
          aValue = a.bookedBy.toLowerCase();
          bValue = b.bookedBy.toLowerCase();
          break;
        case "startTime":
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
          break;
        case "room":
          aValue = rooms.get(a.roomId)?.name.toLowerCase() || "";
          bValue = rooms.get(b.roomId)?.name.toLowerCase() || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredBookings(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

  const getRoomName = (roomId: number) => {
    return rooms.get(roomId)?.name || `Ruangan #${roomId}`;
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedRoom("all");
    setDateFrom("");
    setDateTo("");
    setSortField("startTime");
    setSortOrder("desc");
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return <div className="booking-history-container loading">Memuat data...</div>;
  }

  return (
    <div className="booking-history-container">
      <h2>📖 Riwayat & Penelusuran Peminjaman</h2>
      <p className="subtitle">Lihat riwayat peminjaman dan filter data dengan berbagai kriteria</p>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-grid">
          <div className="filter-item">
            <label>Pencarian (Judul/Peminjam)</label>
            <input
              type="text"
              placeholder="Cari judul atau nama peminjam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-item">
            <label>Ruangan</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="filter-select"
            >
              <option value="all">Semua Ruangan</option>
              {Array.from(rooms.values()).map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Tanggal Dari</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-item">
            <label>Tanggal Sampai</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-item">
            <label>Urutkan Berdasarkan</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="filter-select"
            >
              <option value="startTime">Waktu Mulai</option>
              <option value="title">Judul</option>
              <option value="bookedBy">Nama Peminjam</option>
              <option value="room">Ruangan</option>
              <option value="id">ID</option>
            </select>
          </div>

          <div className="filter-item">
            <label>&nbsp;</label>
            <button
              className="btn-reset"
              onClick={handleReset}
            >
              🔄 Reset Filter
            </button>
          </div>
        </div>

        <div className="sort-indicator">
          <span>Urutan: {sortOrder === "asc" ? "↑ Naik" : "↓ Turun"}</span>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>Ditemukan <strong>{filteredBookings.length}</strong> dari <strong>{bookings.length}</strong> peminjaman</p>
      </div>

      {/* History Table */}
      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada data peminjaman yang cocok dengan filter.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("id")} className="sortable">
                  ID {sortField === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("title")} className="sortable">
                  Judul {sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("room")} className="sortable">
                  Ruangan {sortField === "room" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("bookedBy")} className="sortable">
                  Peminjam {sortField === "bookedBy" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("startTime")} className="sortable">
                  Tanggal Mulai {sortField === "startTime" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th>Durasi</th>
                <th>Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => {
                const startDate = new Date(booking.startTime);
                const endDate = new Date(booking.endTime);
                const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
                const durationHours = Math.floor(durationMinutes / 60);
                const remainingMinutes = durationMinutes % 60;

                return (
                  <tr key={booking.id} className="history-row">
                    <td className="id-cell">{booking.id}</td>
                    <td className="title-cell">{booking.title}</td>
                    <td className="room-cell">{getRoomName(booking.roomId)}</td>
                    <td className="bookedby-cell">{booking.bookedBy}</td>
                    <td className="date-cell">
                      <div className="date-info">
                        <span className="date">{formatDate(booking.startTime)}</span>
                        <span className="time">{startDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </td>
                    <td className="duration-cell">
                      {durationHours}j {remainingMinutes}m
                    </td>
                    <td className="description-cell">
                      {booking.description ? (
                        <span title={booking.description}>
                          {booking.description.length > 30
                            ? booking.description.substring(0, 30) + "..."
                            : booking.description}
                        </span>
                      ) : (
                        <span className="no-description">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {filteredBookings.length > 0 && (
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Peminjaman:</span>
            <span className="stat-value">{filteredBookings.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Peminjam Unik:</span>
            <span className="stat-value">
              {new Set(filteredBookings.map(b => b.bookedBy)).size}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Ruangan Digunakan:</span>
            <span className="stat-value">
              {new Set(filteredBookings.map(b => b.roomId)).size}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingHistory;
