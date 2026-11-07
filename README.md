# 🌱 Trashly – Platform Edukasi Pengelolaan Sampah

Aplikasi website interaktif untuk mengedukasi masyarakat mengenai pemilahan dan pengelolaan sampah berbasis **React 18**, **Node.js (Express)**, dan **MySQL**, dilengkapi dengan **Scan AI Visual** dan **Chatbot Asisten AI**. Dikembangkan untuk **HIMTEC HACKATHON**.

---

## 🚀 Fitur Unggulan

### 1. Scan & Deteksi Sampah AI (`/scan`)
- **Kamera Langsung & Unggah Foto**: Pindai sampah dari webcam, kamera smartphone, atau unggah foto (maksimal 5 MB).
- **Google Gemini Multimodal AI**: Menganalisis matriks visual objek, mendeteksi material, menentukan warna tempat sampah resmi **KLHK** (Organik, Anorganik, B3, Residu, E-Waste), estimasi waktu urai, dan nilai jual di Bank Sampah.
- **Transparansi Sumber Analisis**: Menampilkan badge `Dianalisis AI` saat terhubung ke Google Gemini, atau `Mode offline (berdasarkan kata kunci)` saat offline.
- **6 Sampel Cepat (1-Klik)**: Disediakan sampel uji coba instan (Botol PET, Kulit Buah, Kaleng Soda, Kardus, Baterai B3, Styrofoam) untuk pengujian cepat.
- **Reward Gamifikasi**: Pengguna yang masuk (*login*) otomatis mendapatkan **+15 Eco-Points** tiap kali melakukan pemindaian.

### 2. Chatbot Asisten Pemilahan AI (Widget Melayang)
- **Tombol Melayang di Seluruh Halaman**: Tombol `Tanya AI` di pojok kanan bawah dapat diakses dari halaman mana saja.
- **Didukung Google Gemini & RAG (Retrieval-Augmented Generation)**: Jawaban berbasis data riil ensiklopedia sampah Trashly sehingga konsisten dan akurat.
- **Fokus & Sopan**: Khusus menjawab seputar pemilahan, pengelolaan, 3R, dan komposting, serta menolak topik di luar sampah secara santun.
- **Saran Pertanyaan Cepat**: Dilengkapi chip pertanyaan praktis (mis. *"Baterai bekas dibuang ke mana?"*, *"Cara membuat kompos dari sisa makanan?"*).

### 3. Ensiklopedia Sampah (`/ensiklopedia`)
- **5 Kategori Standar Nasional (KLHK)**:
  - 🍃 **Organik**: Sisa makanan, sayur, kulit buah (metode komposting & eco-enzyme).
  - ♻️ **Anorganik**: Botol plastik PET, kardus/karton, kaleng aluminium.
  - ⚠️ **Limbah B3**: Baterai bekas, aki, minyak jelantah, lampu neon.
  - 🗑️ **Residu**: Masker medis sekali pakai, styrofoam makanan.
  - 💻 **E-Waste**: Smartphone bekas, charger, komponen elektronik.
- **Filter & Pencarian**: Live search nama sampah, filter kategori, dan status daur ulang (*Recyclable vs Residu*).
- **Detail Sampah** (`/ensiklopedia/:slug`): Panduan pemilahan langkah-demi-langkah, dampak jika dibakar/dibuang sembarangan, dan potensi produk daur ulang.

### 4. Direktori Bank Sampah & Peta Interaktif (`/bank-sampah`)
- **Peta Interaktif Leaflet**: Menampilkan 7 titik Bank Sampah nyata terverifikasi (Bandung, Jakarta, Surabaya) dengan ikon pin khusus.
- **Deteksi Lokasi GPS**: Mengukur jarak jalan riil (*Haversine*) dari posisi pengguna ke lokasi Bank Sampah terdekat.
- **Navigasi Rute**: Tombol langsung menuju Google Maps untuk rute perjalanan.

### 5. Kuis Pilah Sampah Interaktif (`/kuis`)
- Kuis pilihan ganda edukatif dengan skor dan perolehan Eco-Points langsung.
- Ulasan jawaban benar/salah secara instan.

### 6. Papan Peringkat / Leaderboard (`/leaderboard`)
- Menampilkan ranking pengguna teratas berdasarkan total Eco-Points yang dikumpulkan dari aksi kuis dan pemindaian sampah.

### 7. Kalkulator Jejak Sampah (`/kalkulator`)
- Menghitung estimasi timbulan sampah mingguan dan rekomendasi aksi pengurangan sampah rumah tangga.

### 8. Autentikasi Pengguna & Dashboard Profil (`/profil`)
- Registrasi dan login aman berbasis **JSON Web Token (JWT)** dan hash password `bcryptjs`.
- Bonus selamat datang **+50 Eco-Points** saat mendaftar.
- Riwayat kuis, pemindaian AI, dan lencana (*badges*).

### 9. Panel Kontrol Administrator (`/admin`)
- **Dashboard Analitik**: Ringkasan KPI pengguna, item sampah, bank sampah, pemindaian AI, dan status sistem secara seketika (*real-time*).
- **CRUD Ensiklopedia Sampah**: Kelola item sampah, kategori, waktu urai, dan penyusun langkah pemilahan bertahap dinamis.
- **CRUD Bank Sampah & Leaflet Map Picker**: Tambah dan ubah titik setor sampah dengan mengklik langsung peta interaktif untuk menentukan koordinat lintang/bujur akurat serta konversi otomatis ke format DMS.
- **CRUD Kuis & Bank Soal**: Buat paket kuis edukasi, tentukan tingkat kesulitan dan reward poin, serta kelola pertanyaan pilihan ganda dengan kunci jawaban dan teks penjelasan edukatif.
- **Monitoring Scan AI**: Log pemindaian gambar sampah pengguna, preview foto, akurasi, dan badge sumber (`Dianalisis AI` vs `Mode offline`).
- **Manajemen Pengguna**: Atur role pengguna (`user` ↔ `admin`) dan lakukan penyesuaian saldo Eco-Points manual disertai catatan audit.
- **Parameter Kalkulator & Emisi**: Kelola koefisien emisi CO2e sampah (standar IPCC) dan voucher reward mingguan.
- **Sandbox Chatbot AI**: Uji coba respons asisten Gemini AI serta inspeksi data referensi RAG ensiklopedia secara langsung.
- **Proteksi RBAC**: Dilindungi oleh middleware `requireAdmin` dan komponen `<AdminGuard>` (403 Forbidden untuk selain admin). Akun admin secara otomatis tidak diikutsertakan dalam kompetisi leaderboard publik.

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6, Leaflet Map |
| **Backend** | Node.js (ES Modules), Express.js, CORS, Express-Rate-Limit, JWT, Bcrypt.js |
| **AI Engine** | Google AI Studio (Gemini REST API: `gemini-2.5-flash`) |
| **Database** | MySQL (dengan mode otomatis *In-Memory Fallback* jika MySQL belum berjalan) |

---

## ⚙️ Konfigurasi Environment (`.env`)

Backend memerlukan konfigurasi variabel lingkungan. Salin file template:

```bash
cd server
cp .env.example .env
```

Isi file `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database Configuration (MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=trashly_db

# Security
JWT_SECRET=trashly_super_secret_jwt_key_2026_himtec_hackathon

# Google AI Studio (Gemini)
# Dapatkan API Key gratis di https://aistudio.google.com/apikey
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
```

> **Catatan Penggunaan Tanpa Kunci API (Offline Mode):**
> Jika `GEMINI_API_KEY` belum diisi:
> - Fitur **Scan AI** tetap dapat diuji menggunakan 6 sampel preset 1-klik dengan label `Mode offline (berdasarkan kata kunci)`.
> - Pengunggahan foto tanpa sampel akan menampilkan pesan bahwa layanan AI sedang tidak tersedia (HTTP 503).
> - **Chatbot AI** akan menginfokan bahwa kunci API belum dikonfigurasi.

---

## 💻 Cara Menjalankan Aplikasi

### Langkah 1: Nyalakan MySQL (Opsional namun Disarankan)
1. Buka **Laragon** atau **XAMPP**.
2. Klik **Start All** (pastikan modul MySQL port 3306 aktif).
   *(Jika MySQL tidak aktif, server Trashly otomatis beralih ke in-memory store agar demo tetap berjalan mulus).*

### Langkah 2: Jalankan Aplikasi
Anda dapat langsung menjalankan skrip launcher:
- Klik dua kali file **`start-dev.bat`** di folder utama Trashly.

**Atau jalankan secara manual:**

Terminal 1 (Backend API):
```bash
cd server
npm run dev
# Berjalan di http://localhost:5000
```

Terminal 2 (Frontend Client):
```bash
cd client
npm run dev
# Berjalan di http://localhost:3000
```

Buka peramban di: **`http://localhost:3000`**

---

## 📂 Struktur Folder Terbaru

```plaintext
Trashly/
├── client/                     # Frontend React (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ChatWidget.jsx
│   │   │   └── admin/          # AdminGuard, AdminLayout, AdminSidebar, AdminTopbar
│   │   ├── context/            # AuthContext.jsx (JWT State)
│   │   ├── pages/              # Home, Encyclopedia, WasteDetail, ScanAI,
│   │   │   │                   # BankSampah, QuizList, QuizPlay, Leaderboard,
│   │   │   │                   # Calculator, Profile, Login, Register
│   │   │   └── admin/          # AdminDashboard, AdminWaste, AdminBankSampah,
│   │   │                       # AdminQuizzes, AdminScans, AdminUsers,
│   │   │                       # AdminCalculator, AdminChat
│   │   ├── services/           # api.js (Axios client: auth, waste, scan, chat, quiz, admin)
│   │   ├── App.jsx             # Router & Nested Layouts (Public & Admin Guard)
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # db.js (MySQL pool & in-memory fallback)
│   │   ├── controllers/        # auth, waste, scan, chat, quiz, user, dropPoint, adminController
│   │   ├── middlewares/        # authMiddleware.js (requireAdmin), rateLimitMiddleware.js
│   │   ├── routes/             # authRoutes, wasteRoutes, scanRoutes, chatRoutes, adminRoutes, dll.
│   │   ├── seeds/              # initialData.js (Seed kategori, sampah, bank sampah, admin user)
│   │   └── server.js           # Express App Entry Point & CORS restriction
│   ├── .env.example            # Template konfigurasi environment
│   ├── .env                    # File env lokal (terabaikan git)
│   └── package.json
│
├── .gitignore                  # Mengabaikan node_modules, .env, dist
├── start-dev.bat               # One-click dev launcher
└── README.md
```

---

## 🔑 Kredensial Akun Demo

### 1. Akun Pengguna (Reguler User)
- **Email**: `demo@trashly.id`
- **Password**: `password123`
- **Role**: `user` *(Muncul di Papan Peringkat / Leaderboard)*

### 2. Akun Administrator (Full Access CMS)
- **Email**: `admin@trashly.id`
- **Password**: `password123`
- **Role**: `admin` *(Memiliki akses tombol "Admin Panel" & `/admin`)*

*(Atau buat akun baru di halaman `/register` untuk mendapatkan bonus selamat datang +50 Eco-Points!)*
