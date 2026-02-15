import { useEffect, useState } from "react";
import { getRooms } from "../services/api";
import type { Room } from "../types";
import "../styles/RoomList.css";

function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
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
    return <div className="room-list-container loading">Memuat data ruangan...</div>;
  }

  return (
    <div className="room-list-container">
      <h2>Daftar Ruangan Tersedia</h2>

      {rooms.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada ruangan tersedia.</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map(room => (
            <div key={room.id} className="room-card">
              <h3>{room.name}</h3>
              <div className="room-info">
                <div className="info-row">
                  <span className="capacity">Kapasitas: {room.capacity} orang</span>
                </div>
                <div className="info-row">
                  <span className="location">Lokasi: {room.location}</span>
                </div>
              </div>
              <div className="room-id">Ruang #{room.id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoomList;
