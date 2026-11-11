# Laundry Syah Jehan

Aplikasi web layanan laundry berbasis Express.js dengan pola MVC, view engine EJS, styling Tailwind CSS (CDN), dan database PostgreSQL (Sequelize). Mendukung operasi CRUD layanan lewat REST API dan halaman web.

## Teknologi

- Node.js + Express.js
- EJS (view engine)
- Tailwind CSS via CDN
- PostgreSQL + Sequelize
- dotenv (konfigurasi lingkungan)

## Menjalankan Aplikasi

1. Pastikan PostgreSQL sudah terpasang dan berjalan.
2. Buat database:
   ```sql
   CREATE DATABASE laundry_db;
   ```
3. Salin `.env.example` menjadi `.env`, lalu isi `DB_PASSWORD` sesuai password PostgreSQL:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=laundry_db
   DB_USER=postgres
   DB_PASSWORD=isi_password_postgres_kamu
   ```
4. Install dependency dan jalankan server:
   ```bash
   npm install
   npm start        # atau: npm run dev (auto-reload)
   ```
5. Buka http://localhost:3000

Tabel `produk` dibuat otomatis saat server pertama kali berjalan, lalu diisi 3 data awal jika masih kosong.

## Halaman

| URL | Keterangan |
|---|---|
| `/` | Landing page, daftar layanan dari database |
| `/kelola` | Tambah, ubah, dan hapus layanan (memanggil REST API) |

## Endpoint API

| Method | URL | Keterangan | Status sukses |
|---|---|---|---|
| GET | `/api/status` | Status server | 200 |
| GET | `/api/produk` | Ambil semua layanan | 200 |
| GET | `/api/produk/:id` | Detail satu layanan | 200 |
| POST | `/api/produk` | Tambah layanan | 201 |
| PUT | `/api/produk/:id` | Ubah layanan | 200 |
| DELETE | `/api/produk/:id` | Hapus layanan | 200 |

Status error: `400` input atau ID tidak valid, `404` data tidak ditemukan, `500` error server.

Contoh body untuk POST dan PUT:

```json
{
  "nama": "Cuci Sepatu",
  "deskripsi": "Cuci sepatu bersih",
  "kategori": "Layanan Satuan",
  "harga": 25000,
  "stok": "Tersedia"
}
```

Contoh response sukses:

```json
{
  "status": "success",
  "message": "Produk berhasil ditambahkan.",
  "data": { "id": 4, "nama": "Cuci Sepatu", "harga": 25000 }
}
```

## Middleware Logger

Setiap request yang masuk dicatat di terminal backend: timestamp, metode HTTP, path, dan status response.

```
[2026-11-11T10:50:20.123Z] GET /api/produk/1 - Status: 200
[2026-11-11T10:51:02.456Z] POST /api/produk - Status: 201
```

## Pengujian

**Backend** (Postman):

| Uji | Request | Hasil |
|---|---|---|
| Read semua | GET `/api/produk` | 200 |
| Read satu | GET `/api/produk/1` | 200 |
| Create | POST `/api/produk` | 201 |
| Update | PUT `/api/produk/:id` | 200 |
| Delete | DELETE `/api/produk/:id` | 200 |
| Data tidak ada | GET `/api/produk/999` | 404 |
| Input tidak valid | POST dengan `nama` kosong | 400 |

Setelah tiap operasi, perubahan dicek langsung pada tabel `produk` di pgAdmin.

**Frontend** (halaman `/kelola`): data tampil dari database, lalu uji tambah lewat form, ubah lewat tombol Ubah, dan hapus lewat tombol Hapus. Perubahan tercermin di database dan di halaman `/`.

## Struktur Folder

```
config/        koneksi database (membaca .env)
models/        model Produk dan fungsi CRUD ke database
middlewares/   logger request
controllers/   alur request dan response
routes/        pemetaan URL ke controller
views/         template EJS dan partials
utils/         validasi input dan seeder data awal
app.js         titik masuk aplikasi
```

## Keamanan

File `.env` berisi password database dan tidak ikut di-push ke repository (sudah masuk `.gitignore`). Gunakan `.env.example` sebagai acuan konfigurasi.