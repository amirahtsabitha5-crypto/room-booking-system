import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { getRooms } from "../services/api";
import "../styles/RoomList.css";
function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadRooms();
    }, []);
    const loadRooms = async () => {
        setLoading(true);
        const roomList = await getRooms();
        setRooms(roomList);
        setLoading(false);
    };
    if (loading) {
        return _jsx("div", { className: "room-list-container loading", children: "Memuat data ruangan..." });
    }
    return (_jsxs("div", { className: "room-list-container", children: [_jsx("h2", { children: "Daftar Ruangan Tersedia" }), rooms.length === 0 ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "Tidak ada ruangan tersedia." }) })) : (_jsx("div", { className: "rooms-grid", children: rooms.map(room => (_jsxs("div", { className: "room-card", children: [_jsx("h3", { children: room.name }), _jsxs("div", { className: "room-info", children: [_jsx("div", { className: "info-row", children: _jsxs("span", { className: "capacity", children: ["Kapasitas: ", room.capacity, " orang"] }) }), _jsx("div", { className: "info-row", children: _jsxs("span", { className: "location", children: ["Lokasi: ", room.location] }) })] }), _jsxs("div", { className: "room-id", children: ["Ruang #", room.id] })] }, room.id))) }))] }));
}
export default RoomList;
