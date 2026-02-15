# Room Booking System - Frontend

Frontend React + TypeScript untuk Sistem Peminjaman Ruangan Kampus.

## Setup & Installation

### Prerequisites
- Node.js 18+ dan npm

### Install Dependencies
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Aplikasi akan terbuka di `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## Struktur Folder

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── App.tsx       # Main app component
│   │   ├── RoomList.tsx  # Room management component
│   │   └── BookingList.tsx # Booking management component
│   ├── services/         # API services
│   │   └── api.ts        # API client
│   ├── styles/           # CSS files
│   │   ├── index.css     # Global styles
│   │   ├── RoomList.css  # Room component styles
│   │   └── BookingList.css # Booking component styles
│   ├── types/            # TypeScript types
│   │   └── index.ts      # Type definitions
│   ├── main.tsx          # React entry point
│   └── vite-env.d.ts     # Vite environment types
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── index.html            # HTML template
```

## Fitur

### Room Management
- Lihat daftar semua ruangan
- Tambah ruangan baru
- Hapus ruangan
- Informasi: nama, kapasitas, lokasi, status ketersediaan

### Booking Management
- Lihat daftar semua booking
- Buat booking baru dengan validasi ketersediaan
- Hapus booking
- Informasi: judul, ruangan, waktu, pemesan

## Teknologi

- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Axios** - HTTP client
- **React Router** - Navigation (siap untuk pengembangan)

## API Integration

Frontend berkomunikasi dengan backend API di `https://localhost:7232/api` dengan endpoints:

### Rooms
- `GET /api/rooms` - Dapatkan semua ruangan
- `GET /api/rooms/{id}` - Dapatkan ruangan berdasarkan ID
- `POST /api/rooms` - Buat ruangan baru
- `PUT /api/rooms/{id}` - Update ruangan
- `DELETE /api/rooms/{id}` - Hapus ruangan

### Bookings
- `GET /api/bookings` - Dapatkan semua booking
- `GET /api/bookings/{id}` - Dapatkan booking berdasarkan ID
- `GET /api/bookings/room/{roomId}` - Dapatkan booking untuk ruangan
- `GET /api/bookings/date-range` - Dapatkan booking dalam range tanggal
- `GET /api/bookings/check-availability` - Cek ketersediaan ruangan
- `POST /api/bookings` - Buat booking baru
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Hapus booking

## Notes

- Backend harus berjalan di `https://localhost:7232` sebelum menjalankan frontend
- HTTPS diperlukan karena backend menggunakan HTTPS
- Konfigurasi CORS sudah diatur di backend untuk allow frontend
