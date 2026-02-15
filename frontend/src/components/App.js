import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import RoomList from "./RoomList";
import BookingList from "./BookingList";
import BookingManagement from "./BookingManagement";
import BookingHistory from "./BookingHistory";
import BookingForm from "./BookingForm";
import "../styles/App.css";
function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activeTab, setActiveTab] = useState("beranda");
    const handleBookingCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };
    return (_jsxs("div", { className: "app", children: [_jsxs("header", { className: "app-header", children: [_jsx("h1", { children: "Sistem Manajemen Peminjaman Ruangan Kampus" }), _jsx("p", { className: "subtitle", children: "Kelola peminjaman ruangan dengan mudah dan efisien." })] }), _jsxs("nav", { className: "tab-navigation", children: [_jsx("button", { className: `tab-btn ${activeTab === "beranda" ? "active" : ""}`, onClick: () => setActiveTab("beranda"), children: "\uD83C\uDFE0 Beranda" }), _jsx("button", { className: `tab-btn ${activeTab === "peminjaman" ? "active" : ""}`, onClick: () => setActiveTab("peminjaman"), children: "\uD83D\uDCCB Daftar Peminjaman" }), _jsx("button", { className: `tab-btn ${activeTab === "kelola" ? "active" : ""}`, onClick: () => setActiveTab("kelola"), children: "\u270E Kelola Peminjaman" }), _jsx("button", { className: `tab-btn ${activeTab === "history" ? "active" : ""}`, onClick: () => setActiveTab("history"), children: "\uD83D\uDCDC Riwayat & Penelusuran" })] }), _jsxs("main", { className: "app-main", children: [activeTab === "beranda" && (_jsxs(_Fragment, { children: [_jsx("section", { className: "section", children: _jsx(RoomList, {}) }), _jsx("section", { className: "section", children: _jsx(BookingForm, { onBookingCreated: handleBookingCreated }) })] })), activeTab === "peminjaman" && (_jsx("section", { className: "section", children: _jsx(BookingList, { refreshTrigger: refreshTrigger }) })), activeTab === "kelola" && (_jsx("section", { className: "section", children: _jsx(BookingManagement, { refreshTrigger: refreshTrigger }) })), activeTab === "history" && (_jsx("section", { className: "section", children: _jsx(BookingHistory, { refreshTrigger: refreshTrigger }) }))] }), _jsx("footer", { className: "app-footer", children: _jsx("p", { children: "\u00A9 2026 Sistem Peminjaman Ruangan Kampus. All rights reserved." }) })] }));
}
export default App;
