# Room Booking System

Sistem Peminjaman Ruangan Kampus - Full Stack Application dengan ASP.NET Core Backend dan React Frontend.

## 🎯 Overview

Aplikasi web untuk mengelola peminjaman ruangan kampus dengan fitur:
- Manajemen daftar ruangan
- Pembuatan dan pengelolaan booking
- Validasi ketersediaan ruangan
- Responsif dan user-friendly interface

## 📋 Struktur Project

```
room-booking-system/
├── backend/                 # ASP.NET Core Backend
│   └── BackendApi/
│       ├── Controllers/     # API endpoints
│       ├── Models/          # Data models
│       ├── Services/        # Business logic
│       ├── Program.cs
│       ├── appsettings.json
│       └── BackendApi.csproj
├── frontend/                # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript types
│   │   ├── styles/          # CSS files
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
└── README.md (this file)
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend/BackendApi
dotnet build
dotnet run
```

Backend akan berjalan di `https://localhost:7232`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 📚 Documentation

- Backend API: [backend/README.md](./backend/README.md)
- Frontend: [frontend/README.md](./frontend/README.md)

## 🔧 Technology Stack

### Backend
- **Framework**: ASP.NET Core 10.0
- **Language**: C#
- **API**: RESTful API
- **Database**: In-memory (dapat diganti dengan SQL Server/PostgreSQL)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS3

## 📖 API Endpoints

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/{id}` - Get room by ID
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/{id}` - Update room
- `DELETE /api/rooms/{id}` - Delete room

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/{id}` - Get booking by ID
- `GET /api/bookings/room/{roomId}` - Get bookings for room
- `GET /api/bookings/date-range` - Get bookings in date range
- `GET /api/bookings/check-availability` - Check room availability
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Delete booking

## 🎨 Features

### Room Management
- ✅ Lihat semua ruangan yang tersedia
- ✅ Tambah ruangan baru dengan nama, kapasitas, lokasi
- ✅ Update informasi ruangan
- ✅ Hapus ruangan
- ✅ Status ketersediaan real-time

### Booking Management
- ✅ Lihat semua booking
- ✅ Buat booking dengan validasi ketersediaan
- ✅ Cek ketersediaan ruangan untuk waktu tertentu
- ✅ Filter booking berdasarkan ruangan
- ✅ Filter booking berdasarkan range tanggal
- ✅ Update dan hapus booking
- ✅ Informasi detail: judul, deskripsi, waktu, pemesan

## 🛠️ Development

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend/BackendApi
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000` in your browser.

## 📝 Sample Data

Backend seeding dengan data sample otomatis:

**Rooms:**
- Ruang Seminar A (Kapasitas: 30)
- Ruang Meeting B (Kapasitas: 50)
- Lab Komputer C (Kapasitas: 40)

## 🔐 Security Notes

- Backend menggunakan HTTPS (localhost)
- CORS dikonfigurasi untuk allow frontend
- Input validation di semua endpoints
- Error handling yang comprehensive

## 📦 Dependencies

### Backend
- Microsoft.AspNetCore.OpenApi
- Swashbuckle.AspNetCore (untuk development)

### Frontend
- react
- react-dom
- react-router-dom
- axios

## 🚢 Deployment

### Backend
- Publish dengan `dotnet publish -c Release`
- Deploy ke cloud provider (Azure, AWS, Heroku, etc.)
- Setup proper HTTPS certificates
- Implementasikan database persistence

### Frontend
- Build dengan `npm run build`
- Deploy folder `dist/` ke web server (Netlify, Vercel, Azure Static Web Apps)

## 📞 Support

Untuk informasi lebih lanjut, lihat dokumentasi di:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## 📄 License

Proyek ini dibuat untuk keperluan akademik/kampus.

---

**Dibuat:** February 8, 2026  
**Version:** 1.0.0  
**Status:** ✅ Functional
