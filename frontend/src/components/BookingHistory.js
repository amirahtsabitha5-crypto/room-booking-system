import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getBookings, getRooms } from "../services/api";
import "../styles/BookingHistory.css";
function BookingHistory({ refreshTrigger }) {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [filteredBookings, setFilteredBookings] = useState([]);
    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortField, setSortField] = useState("startTime");
    const [sortOrder, setSortOrder] = useState("desc");
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
            filtered = filtered.filter(b => b.title.toLowerCase().includes(query) ||
                b.bookedBy.toLowerCase().includes(query));
        }
        // Filter by room
        if (selectedRoom !== "all") {
            filtered = filtered.filter(b => b.roomId === parseInt(selectedRoom));
        }
        // Filter by date range
        if (dateFrom) {
            const fromDate = new Date(dateFrom).getTime();
            filtered = filtered.filter(b => new Date(b.startTime).getTime() >= fromDate);
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(b => new Date(b.startTime).getTime() <= toDate.getTime());
        }
        // Apply sorting
        filtered.sort((a, b) => {
            let aValue;
            let bValue;
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
            if (aValue < bValue)
                return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue)
                return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
        setFilteredBookings(filtered);
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });
    };
    const getRoomName = (roomId) => {
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
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        }
        else {
            setSortField(field);
            setSortOrder("asc");
        }
    };
    if (loading) {
        return _jsx("div", { className: "booking-history-container loading", children: "Memuat data..." });
    }
    return (_jsxs("div", { className: "booking-history-container", children: [_jsx("h2", { children: "\uD83D\uDCD6 Riwayat & Penelusuran Peminjaman" }), _jsx("p", { className: "subtitle", children: "Lihat riwayat peminjaman dan filter data dengan berbagai kriteria" }), _jsxs("div", { className: "filter-section", children: [_jsxs("div", { className: "filter-grid", children: [_jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Pencarian (Judul/Peminjam)" }), _jsx("input", { type: "text", placeholder: "Cari judul atau nama peminjam...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "search-input" })] }), _jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Ruangan" }), _jsxs("select", { value: selectedRoom, onChange: (e) => setSelectedRoom(e.target.value), className: "filter-select", children: [_jsx("option", { value: "all", children: "Semua Ruangan" }), Array.from(rooms.values()).map(room => (_jsx("option", { value: room.id, children: room.name }, room.id)))] })] }), _jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Tanggal Dari" }), _jsx("input", { type: "date", value: dateFrom, onChange: (e) => setDateFrom(e.target.value), className: "filter-input" })] }), _jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Tanggal Sampai" }), _jsx("input", { type: "date", value: dateTo, onChange: (e) => setDateTo(e.target.value), className: "filter-input" })] }), _jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "Urutkan Berdasarkan" }), _jsxs("select", { value: sortField, onChange: (e) => setSortField(e.target.value), className: "filter-select", children: [_jsx("option", { value: "startTime", children: "Waktu Mulai" }), _jsx("option", { value: "title", children: "Judul" }), _jsx("option", { value: "bookedBy", children: "Nama Peminjam" }), _jsx("option", { value: "room", children: "Ruangan" }), _jsx("option", { value: "id", children: "ID" })] })] }), _jsxs("div", { className: "filter-item", children: [_jsx("label", { children: "\u00A0" }), _jsx("button", { className: "btn-reset", onClick: handleReset, children: "\uD83D\uDD04 Reset Filter" })] })] }), _jsx("div", { className: "sort-indicator", children: _jsxs("span", { children: ["Urutan: ", sortOrder === "asc" ? "↑ Naik" : "↓ Turun"] }) })] }), _jsx("div", { className: "results-info", children: _jsxs("p", { children: ["Ditemukan ", _jsx("strong", { children: filteredBookings.length }), " dari ", _jsx("strong", { children: bookings.length }), " peminjaman"] }) }), filteredBookings.length === 0 ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "Tidak ada data peminjaman yang cocok dengan filter." }) })) : (_jsx("div", { className: "table-wrapper", children: _jsxs("table", { className: "history-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsxs("th", { onClick: () => handleSort("id"), className: "sortable", children: ["ID ", sortField === "id" && (sortOrder === "asc" ? "↑" : "↓")] }), _jsxs("th", { onClick: () => handleSort("title"), className: "sortable", children: ["Judul ", sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")] }), _jsxs("th", { onClick: () => handleSort("room"), className: "sortable", children: ["Ruangan ", sortField === "room" && (sortOrder === "asc" ? "↑" : "↓")] }), _jsxs("th", { onClick: () => handleSort("bookedBy"), className: "sortable", children: ["Peminjam ", sortField === "bookedBy" && (sortOrder === "asc" ? "↑" : "↓")] }), _jsxs("th", { onClick: () => handleSort("startTime"), className: "sortable", children: ["Tanggal Mulai ", sortField === "startTime" && (sortOrder === "asc" ? "↑" : "↓")] }), _jsx("th", { children: "Durasi" }), _jsx("th", { children: "Deskripsi" })] }) }), _jsx("tbody", { children: filteredBookings.map(booking => {
                                const startDate = new Date(booking.startTime);
                                const endDate = new Date(booking.endTime);
                                const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
                                const durationHours = Math.floor(durationMinutes / 60);
                                const remainingMinutes = durationMinutes % 60;
                                return (_jsxs("tr", { className: "history-row", children: [_jsx("td", { className: "id-cell", children: booking.id }), _jsx("td", { className: "title-cell", children: booking.title }), _jsx("td", { className: "room-cell", children: getRoomName(booking.roomId) }), _jsx("td", { className: "bookedby-cell", children: booking.bookedBy }), _jsx("td", { className: "date-cell", children: _jsxs("div", { className: "date-info", children: [_jsx("span", { className: "date", children: formatDate(booking.startTime) }), _jsx("span", { className: "time", children: startDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) })] }) }), _jsxs("td", { className: "duration-cell", children: [durationHours, "j ", remainingMinutes, "m"] }), _jsx("td", { className: "description-cell", children: booking.description ? (_jsx("span", { title: booking.description, children: booking.description.length > 30
                                                    ? booking.description.substring(0, 30) + "..."
                                                    : booking.description })) : (_jsx("span", { className: "no-description", children: "-" })) })] }, booking.id));
                            }) })] }) })), filteredBookings.length > 0 && (_jsxs("div", { className: "summary-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Total Peminjaman:" }), _jsx("span", { className: "stat-value", children: filteredBookings.length })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Peminjam Unik:" }), _jsx("span", { className: "stat-value", children: new Set(filteredBookings.map(b => b.bookedBy)).size })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Ruangan Digunakan:" }), _jsx("span", { className: "stat-value", children: new Set(filteredBookings.map(b => b.roomId)).size })] })] }))] }));
}
export default BookingHistory;
