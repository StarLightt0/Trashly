# 🌱 Trashly – Platform Edukasi Pengelolaan Sampah

Aplikasi website interaktif untuk mengedukasi masyarakat mengenai pemilahan dan pengelolaan sampah berbasis **React**, **Node.js + Express**, dan **MySQL**. Dibuat untuk **HIMTEC HACKATHON**.

---

## 🚀 Fitur yang Tersedia (Fase 1)

### 1. Autentikasi Pengguna (Register & Login)
- **Registrasi Akun Baru**: Form pendaftaran nama, email, dan password dengan bonus **+50 Eco-Points**.
- **Login Berbasis JWT**: Token autentikasi aman dengan hash password menggunakan `bcryptjs`.
- **Akun Demo Cepat**: Tombol *quick-fill* akun demo (`demo@trashly.id` / `password123`) di halaman login untuk kemudahan penilaian juri.
- **Header Profil & Eco-Points**: Menampilkan nama pengguna, badge poin aktif, dan tombol logout.

### 2. Ensiklopedia Sampah (Waste Directory)
- **5 Kategori Standar Nasional**:
  - 🍃 **Organik**: Sisa makanan, sayur, kulit buah (metode komposting & eco-enzyme).
  - ♻️ **Anorganik**: Botol plastik PET, kardus/karton, kaleng aluminium.
  - ⚠️ **Limbah B3**: Baterai bekas, minyak jelantah, lampu neon.
  - 🗑️ **Residu**: Masker medis sekali pakai, styrofoam makanan.
  - 💻 **E-Waste**: Smartphone bekas, charger, kabel elektronik.
- **Pencarian Real-Time**: Cari sampah berdasarkan nama atau material.
- **Filter Fleksibel**: Filter berdasarkan kategori warna atau potensi daur ulang (*Recyclable vs Residu*).
- **Halaman Detail Sampah Interaktif** (`/ensiklopedia/:slug`):
  - Estimasi waktu urai alami di bumi.
  - Tingkat bahaya & dampak lingkungan.
  - Langkah-langkah pemilahan bertahap (1, 2, 3...) sebelum disetor/dibuang.
  - Potensi nilai ekonomi dan daur ulang material.
  - Bahaya jika dibakar atau dibuang sembarangan ke lingkungan.

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, CORS, JSON Web Token (JWT), Bcrypt.js |
| **Database** | MySQL (Auto-create database `trashly_db` & auto-seed data awal) |

---

## 💻 Cara Menjalankan Aplikasi

### Langkah 1: Pastikan MySQL Aktif (Laragon / XAMPP)
1. Buka aplikasi **Laragon** atau **XAMPP**.
2. Klik tombol **Start All** (pastikan modul **MySQL** pada Port 3306 menyala).
   > *Catatan: Backend memiliki fitur cerdas otomatis. Jika MySQL belum menyala, backend akan tetap berjalan dengan mode In-Memory Fallback sehingga website tetap bisa dibuka dan diuji.*

### Langkah 2: Menjalankan Frontend & Backend
Anda dapat menjalankan file shortcut:
- Cukup klik dua kali file **`start-dev.bat`** di folder utama Trashly.

**Atau jalankan secara manual di 2 terminal terpisah:**

**Terminal 1 (Backend Express):**
```bash
cd server
npm run dev
# Berjalan di http://localhost:5000
```

**Terminal 2 (Frontend React):**
```bash
cd client
npm run dev
# Berjalan di http://localhost:3000
```

Buka browser Anda dan akses: **`http://localhost:3000`**

---

## 📂 Struktur Folder

```plaintext
Trashly/
├── client/                     # Frontend React (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, Footer
│   │   ├── context/            # AuthContext (JWT State)
│   │   ├── pages/              # Home, Encyclopedia, WasteDetail, Login, Register
│   │   ├── services/           # api.js (Axios Client)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # db.js (Koneksi & Auto-Migrate MySQL)
│   │   ├── controllers/        # authController.js, wasteController.js
│   │   ├── middlewares/        # authMiddleware.js
│   │   ├── routes/             # authRoutes.js, wasteRoutes.js
│   │   ├── seeds/              # initialData.js (Data awal kategori & katalog sampah)
│   │   └── server.js           # Express App Entry Point
│   ├── .env
│   └── package.json
│
├── start-dev.bat               # One-click launcher script untuk Windows
└── README.md
```

---

## 🔑 Kredensial Akun Demo
- **Email**: `demo@trashly.id`
- **Password**: `password123`
- *Atau daftar akun baru di halaman `/register` untuk mendapatkan bonus +50 Eco-Points!*
