import { useState } from "react";
import RoomList from "./RoomList";
import BookingList from "./BookingList";
import BookingManagement from "./BookingManagement";
import BookingHistory from "./BookingHistory";
import BookingForm from "./BookingForm";
import "../styles/App.css";

type TabType = "beranda" | "peminjaman" | "kelola" | "history";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("beranda");

  const handleBookingCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sistem Manajemen Peminjaman Ruangan Kampus</h1>
        <p className="subtitle">Kelola peminjaman ruangan dengan mudah dan efisien.</p>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === "beranda" ? "active" : ""}`}
          onClick={() => setActiveTab("beranda")}
        >
          🏠 Beranda
        </button>
        <button 
          className={`tab-btn ${activeTab === "peminjaman" ? "active" : ""}`}
          onClick={() => setActiveTab("peminjaman")}
        >
          📋 Daftar Peminjaman
        </button>
        <button 
          className={`tab-btn ${activeTab === "kelola" ? "active" : ""}`}
          onClick={() => setActiveTab("kelola")}
        >
          ✎ Kelola Peminjaman
        </button>
        <button 
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          📜 Riwayat & Penelusuran
        </button>
      </nav>

      <main className="app-main">
        {activeTab === "beranda" && (
          <>
            <section className="section">
              <RoomList />
            </section>

            <section className="section">
              <BookingForm onBookingCreated={handleBookingCreated} />
            </section>
          </>
        )}

        {activeTab === "peminjaman" && (
          <section className="section">
            <BookingList refreshTrigger={refreshTrigger} />
          </section>
        )}

        {activeTab === "kelola" && (
          <section className="section">
            <BookingManagement refreshTrigger={refreshTrigger} />
          </section>
        )}

        {activeTab === "history" && (
          <section className="section">
            <BookingHistory refreshTrigger={refreshTrigger} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 Sistem Peminjaman Ruangan Kampus. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
