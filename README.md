# 🖥️ Frontend — Website Pendaftaran Magang & Penelitian
### Kementerian Hukum dan HAM (Kemenkuham)

---

## 👤 Tentang Repository Ini

Repository ini adalah **frontend** dari sistem pendaftaran magang dan penelitian Kemenkuham.
Dikerjakan oleh **frontend developer** menggunakan **React 18 + Vite + JSX**.

> ⚠️ **PENTING UNTUK AI AGENT:**
> Repository ini adalah **khusus frontend saja**.
> Kamu **TIDAK BOLEH** menyentuh, mengedit, atau membuat perubahan apapun pada kode backend.
> Backend dikelola oleh tim terpisah di repository berbeda.

---

## 🚫 Batasan Pekerjaan (Baca Dulu!)

| Aksi | Status |
|---|---|
| Edit file di folder `src/` | ✅ Boleh |
| Edit `vite.config.js` | ✅ Boleh |
| Edit `package.json` frontend | ✅ Boleh |
| Tambah dependencies npm | ✅ Boleh |
| Edit file di folder `backend/` | ❌ **TIDAK BOLEH** |
| Edit database / migration | ❌ **TIDAK BOLEH** |
| Edit file Laravel (.php) | ❌ **TIDAK BOLEH** |
| Push ke repo backend | ❌ **TIDAK BOLEH** |
| Ubah struktur API backend | ❌ **TIDAK BOLEH** |

---

## 🏗️ Arsitektur Sistem

```
┌──────────────────────┐        ┌──────────────────────┐
│   FRONTEND (kamu)    │        │   BACKEND (tim lain) │
│   React 18 + Vite    │◄──────►│   Laravel + MySQL    │
│   localhost:5173     │  API   │   localhost:8000     │
│                      │  JSON  │                      │
│  repo: frontend-     │        │  repo: WebMagang-    │
│  kemenkum (amad-IO)  │        │  Kemenkuham (rahmrafi│
└──────────────────────┘        └──────────────────────┘
                                         │
                                         ▼
                                ┌──────────────────────┐
                                │   MySQL di Azure ☁️  │
                                │   (sudah deployed)   │
                                └──────────────────────┘
```

---

## 🛠️ Tech Stack

| Kebutuhan | Teknologi |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Language | JavaScript + JSX |
| Routing | React Router v6 |
| State Management | Zustand |
| Server State / Cache | TanStack Query (React Query) |
| HTTP Client | Axios |
| Form & Validasi | React Hook Form + Zod |
| UI Component | Ant Design (antd) |
| CSS | Vanilla CSS + CSS Variables |
| Icons | Lucide React |
| Animasi | Framer Motion |
| Notifikasi | React Toastify |
| Tabel Admin | Ant Design Table |
| Export CSV | Papa Parse |
| Chart Dashboard | Recharts |

---

## 📁 Struktur Folder

```
frontend/
├── public/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── global.css          ← CSS global & variabel warna tema
│   │
│   ├── components/                 ← Komponen reusable
│   │   ├── common/                 ← Komponen umum (Navbar, Footer, dll)
│   │   └── admin/                  ← Komponen khusus admin
│   │       └── AdminLayout.jsx     ← Layout sidebar + konten admin
│   │
│   ├── pages/                      ← Halaman utama
│   │   ├── public/                 ← Halaman yang bisa diakses publik
│   │   │   ├── LandingPage.jsx     ← Daftar loker magang & penelitian
│   │   │   ├── DetailProgram.jsx   ← Detail satu program
│   │   │   ├── FormMagang.jsx      ← Form pendaftaran magang
│   │   │   ├── FormPenelitian.jsx  ← Form pendaftaran penelitian
│   │   │   └── Konfirmasi.jsx      ← Bukti & nomor pendaftaran
│   │   │
│   │   └── admin/                  ← Halaman khusus admin (perlu login)
│   │       ├── Login.jsx           ← Login admin
│   │       ├── Dashboard.jsx       ← Statistik pendaftar
│   │       ├── KelolaProgram.jsx   ← CRUD loker magang & penelitian
│   │       ├── ListPendaftar.jsx   ← Tabel pendaftar + filter + export CSV
│   │       └── SettingForm.jsx     ← Konfigurasi field form dinamis
│   │
│   ├── router/
│   │   └── index.jsx               ← Konfigurasi React Router + route guard
│   │
│   ├── store/
│   │   └── authStore.js            ← Zustand: state login admin
│   │
│   ├── services/                   ← Semua pemanggilan API via Axios
│   │   ├── api.js                  ← Instance Axios + interceptor token
│   │   ├── programService.js       ← API loker magang & penelitian
│   │   ├── pendaftarService.js     ← API data pendaftar
│   │   └── authService.js          ← API login/logout admin
│   │
│   ├── hooks/                      ← Custom React hooks
│   └── main.jsx                    ← Entry point app
│
├── .env                            ← Konfigurasi URL API (jangan di-commit)
├── .env.example                    ← Template .env
├── index.html
├── vite.config.js
└── package.json
```

---

## 🗺️ Halaman & Akses

### 🌐 Publik (Tanpa Login)
| Route | Halaman | Fungsi |
|---|---|---|
| `/` | Landing Page | Tampilkan info loker magang & penelitian |
| `/program/:id` | Detail Program | Info lengkap satu posisi |
| `/daftar/magang/:id` | Form Magang | Form pendaftaran magang |
| `/daftar/penelitian/:id` | Form Penelitian | Form pendaftaran penelitian |
| `/konfirmasi` | Konfirmasi | Nomor pendaftaran + bukti |

### 🛡️ Admin (Perlu Login)
| Route | Halaman | Fungsi |
|---|---|---|
| `/admin/login` | Login | Masuk ke dashboard admin |
| `/admin/dashboard` | Dashboard | Statistik & ringkasan pendaftar |
| `/admin/program` | Kelola Program | Tambah/edit/hapus loker |
| `/admin/pendaftar` | List Pendaftar | Tabel + filter + export CSV |
| `/admin/setting-form` | Setting Form | Konfigurasi field form dinamis |

---

## ⚙️ Setup & Menjalankan

### 1. Clone repo
```bash
git clone https://github.com/amad-IO/frontend-kemenkum.git
cd frontend-kemenkum
```

### 2. Install dependencies
```bash
npm install
```

### 3. Buat file `.env`
```bash
cp .env.example .env
```
Isi `VITE_API_URL` dengan URL backend Laravel:
```
VITE_API_URL=http://localhost:8000/api
```

### 4. Jalankan dev server
```bash
npm run dev
```
App akan berjalan di → **http://localhost:5173**

---

## 🔗 Repository Terkait

| Repo | Link | Keterangan |
|---|---|---|
| **Frontend** (ini) | [amad-IO/frontend-kemenkum](https://github.com/amad-IO/frontend-kemenkum) | React + Vite |
| **Backend** | [rahmrafi/WebMagang-Kemenkuham](https://github.com/rahmrafi/WebMagang-Kemenkuham) | Laravel + MySQL Azure |

---

## 📋 Aturan Kontribusi

1. **Jangan pernah edit file backend** — semua `.php`, `composer.json`, migration, dll
2. Selalu buat **branch baru** untuk setiap fitur: `git checkout -b feat/nama-fitur`
3. Semua pemanggilan API harus melalui folder `src/services/`
4. Jangan hardcode URL API — selalu gunakan `import.meta.env.VITE_API_URL`
5. Jangan commit file `.env` — hanya `.env.example` yang boleh di-commit

---

*Frontend Developer: **amad-IO***
*Backend Developer: **rahmrafi***
