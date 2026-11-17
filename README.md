# Laundry Syah Jehan (SmartLaundry AI)

Aplikasi web manajemen layanan laundry terpadu berbasis **Express.js (MVC)**, **PostgreSQL (Sequelize)**, **Tailwind CSS**, dan diintegrasikan dengan **Google Gemini AI Assistant** serta **Nodemailer**.

> *"Pakaian bersih dan rapi, tanpa repot mencuci sendiri."*

---

## Fitur Utama Aplikasi

### 1. Pelanggan (Customer)
* **Katalog Layanan Real-Time:** Menampilkan daftar layanan, harga per kilogram/satuan, deskripsi, dan status ketersediaan langsung dari database.
* **Pemesanan Cucian Mudah (`/pesanan/baru`):** Form pemesanan dengan input berat cucian (mendukung format desimal koma maupun titik) serta catatan khusus pakaian.
* **Lacak Pesanan Saya (`/pesanan-saya`):** Memantau status pengerjaan cucian secara real-time (*Dicuci*, *Kering*, *Disetrika*, *Siap Ambil*, *Diambil*) dan daftar notifikasi.

### 2. Pengelola (Admin)
* **Dashboard Manajemen Antrean (`/admin/pesanan`):** Memantau semua transaksi masuk, total kiloan, instruksi khusus, dan estimasi waktu penyelesaian.
* **Update Status Cepat:** Memperbarui tahapan status cucian dalam satu klik yang otomatis mengirim notifikasi ke sistem dan email pelanggan.
* **Kelola Layanan / CRUD (`/kelola`):** Tambah, ubah, dan hapus paket layanan laundry melalui REST API.

### 3. Asisten AI Interaktif (`/chatbot` & `POST /api/chat`)
Didukung oleh **Google Gemini AI (`gemini-3.5-flash-lite`)** dengan arsitektur aman (API key tersimpan di backend):
* **Context-Aware Database:** AI otomatis membaca data produk dan antrean pesanan dari PostgreSQL sebagai sumber jawaban.
* **Estimasi Waktu Selesai (US-03):** Menganalisis estimasi penyelesaian cucian berdasarkan layanan dan antrean aktif.
* **Rekomendasi Takaran & Varian Pewangi (US-04):** Merekomendasikan takaran dosis (±5 ml/kg) dan aroma yang sesuai dengan jenis bahan kain (katun, denim/jeans, sutra, pakaian bayi).
* **AI Guardrail & Security:** Dilengkapi validasi input (maks. 500 karakter), pencegahan jailbreak / *prompt injection* (15+ pola regex), dan penolakan sopan untuk pertanyaan di luar konteks laundry.
* **Quick Prompt Suggestions:** Tombol topik cepat di UI percakapan untuk memudahkan konsultasi.

### 4. Notifikasi Email Transaksional (Nodemailer)
* Mengirim email ringkasan pesanan baru ke pengelola/admin.
* Mengirim email pembaruan status cucian ke pelanggan saat pakaian selesai diproses (*Siap Ambil*).

---

## 🛠️ Arsitektur & Teknologi

* **Backend:** Node.js, Express.js (Model-View-Controller)
* **Database & ORM:** PostgreSQL, Sequelize ORM
* **Frontend:** EJS (Embedded JavaScript Templates), Tailwind CSS via CDN
* **AI Engine:** Google Gemini API (`@google/generative-ai`)
* **Autentikasi & Sesi:** express-session, bcryptjs
* **Email Service:** Nodemailer (SMTP)

---

## Struktur Direktori

```
PAW-Week7-Laundry-Syah-Jehan/
├── config/
│   ├── database.js          # Koneksi Sequelize PostgreSQL
│   └── gemini.js            # Konfigurasi Google Gemini & System Instruction
├── controllers/
│   ├── apiController.js     # Controller REST API Produk Layanan
│   ├── auth.controller.js   # Controller Registrasi, Login, & Logout
│   ├── chat.controller.js   # Controller AI Assistant Chat
│   ├── homeController.js    # Controller View Halaman Publik
│   └── pesanan.controller.js# Controller Alur Transaksi Pesanan
├── middlewares/
│   ├── auth.js              # Guard role admin dan customer
│   ├── logger.js            # Logger request HTTP di terminal
│   └── validateChatInput.js # Validasi input pesan chat
├── models/
│   ├── notifikasiModel.js   # Model notifikasi pelanggan
│   ├── pesananModel.js      # Model transaksi pesanan
│   ├── produkModel.js       # Model layanan laundry & operasi CRUD
│   └── userModel.js         # Model akun pengguna (Admin & Customer)
├── routes/
│   ├── api.js               # Route REST API produk & status
│   ├── auth.routes.js       # Route login, register, logout
│   ├── chat.routes.js       # Route endpoint POST /api/chat
│   ├── index.js             # Router aggregator utama
│   └── web.js               # Route halaman web (EJS)
├── services/
│   ├── email.service.js     # Layanan pengiriman email (Nodemailer)
│   └── gemini.service.js    # Layanan komunikasi Gemini & database context
├── utils/
│   ├── seeder.js            # Inisialisasi data awal produk
│   └── validasi.js          # Validasi ID & payload produk
├── views/
│   ├── partials/            # Komponen head & footer
│   ├── admin-pesanan.ejs    # Dashboard admin kelola antrean
│   ├── chatbot.ejs          # Antarmuka interaktif Chatbot AI
│   ├── index.ejs            # Halaman utama (Landing page)
│   ├── kelola.ejs           # Halaman CRUD data layanan
│   ├── login.ejs            # Halaman masuk
│   ├── pesanan-baru.ejs     # Form pemesanan cucian
│   ├── pesanan-saya.ejs     # Halaman riwayat pesanan pelanggan
│   └── register.ejs         # Halaman pendaftaran akun
├── .env.example             # Contoh template environment variable
├── app.js                   # Entry point aplikasi
└── package.json
```

---

## ⚙️ Panduan Menjalankan Aplikasi

### 1. Prasyarat
* Node.js v18+ terpasang.
* PostgreSQL aktif dan database telah dibuat:
  ```sql
  CREATE DATABASE laundry_db;
  ```

### 2. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan nilai variabel di `.env`:
```env
PORT=3000
SESSION_SECRET=rahasia_sesi_laundry_2026

# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=laundry_db
DB_USER=postgres
DB_PASSWORD=isi_password_postgres_anda

# Google Gemini AI Key (Dapatkan di https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-3.5-flash-lite

# Pengaturan Admin & Notifikasi Email
ADMIN_EMAIL=admin@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=admin@gmail.com
SMTP_PASS=app_password_email_anda
MAIL_FROM="Laundry Syah Jehan <admin@gmail.com>"
```

### 3. Instalasi Dependency & Menjalankan Server
```bash
# Install paket dependensi
npm install

# Menjalankan mode development (auto-reload saat file berubah)
npm run dev

# Atau menjalankan mode standar
npm start
```

Buka browser dan akses: **`http://localhost:3000`**

---

## 🌐 Daftar Halaman Web

| URL | Deskripsi | Hak Akses |
|---|---|---|
| `/` | Landing page, daftar tarif layanan, banner AI, & alur kerja | Publik |
| `/chatbot` | Halaman chat interaktif dengan AI Assistant | Publik / User |
| `/kelola` | Manajemen CRUD data paket layanan | Terautentikasi |
| `/login` | Halaman autentikasi masuk pengguna | Publik |
| `/register` | Halaman pendaftaran akun baru | Publik |
| `/pesanan/baru` | Form pembuatan nota pesanan cucian baru | Pelanggan |
| `/pesanan-saya` | Riwayat status cucian aktif dan notifikasi | Pelanggan |
| `/admin/pesanan` | Dashboard kontrol status antrean cucian | Admin |

---

## 📡 Dokumentasi Endpoint REST API

### 1. AI Assistant Chatbot
* **Endpoint:** `POST /api/chat`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "message": "Apa saja layanan yang tersedia dan berapa harganya?"
  }
  ```
* **Response Sukses (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "reply": "Berikut daftar layanan yang tersedia di Laundry Syah Jehan: 1. Cuci Komplit Reguler (Rp 6.000/kg)..."
    }
  }
  ```
* **Response Validasi / Guardrail (400 / 200):**
  ```json
  {
    "success": false,
    "error": "Pesan tidak boleh kosong."
  }
  ```

### 2. Layanan Laundry (CRUD)

| Method | Endpoint | Keterangan | Status Sukses |
|---|---|---|---|
| `GET` | `/api/status` | Cek status kesehatan server | `200 OK` |
| `GET` | `/api/produk` | Mengambil seluruh daftar layanan | `200 OK` |
| `GET` | `/api/produk/:id` | Mengambil detail satu layanan | `200 OK` |
| `POST` | `/api/produk` | Menambahkan layanan baru | `201 Created` |
| `PUT` | `/api/produk/:id` | Memperbarui layanan | `200 OK` |
| `DELETE` | `/api/produk/:id` | Menghapus layanan | `200 OK` |

Contoh payload body `POST /api/produk`:
```json
{
  "nama": "Cuci Bedcover",
  "deskripsi": "Pencucian selimut tebal dan bedcover wangi higienis",
  "kategori": "Layanan Satuan",
  "harga": 25000,
  "stok": "Tersedia"
}
```

---

## 🔒 Keamanan & Kebijakan Data
* File `.env` yang memuat kredensial sensitif (*database password*, *Gemini API key*, *SMTP secret*) **wajib diabaikan** oleh Git melalui `.gitignore`.
* Seluruh komunikasi ke Gemini AI dilakukan murni melalui backend server; API Key tidak pernah dikirimkan ke frontend browser.
