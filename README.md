# 🖥️ Frontend — Website Pendaftaran Magang & Penelitian
### Kementerian Hukum dan HAM (Kemenkuham)

---

## 👤 Tentang Repository Ini

Repository ini adalah **frontend** dari sistem pendaftaran magang dan penelitian Kemenkuham.
Dikerjakan oleh **frontend developer** menggunakan **React 18 + Vite + TypeScript**.

> ⚠️ **PENTING UNTUK AI AGENT:**
> Repository ini adalah **khusus frontend saja**.
> Kamu **TIDAK BOLEH** menyentuh, mengedit, atau membuat perubahan apapun pada kode backend.
> Backend dikelola oleh tim terpisah di repository berbeda.

---

## 🚫 Batasan Pekerjaan (Baca Dulu!)

| Aksi | Status |
|---|---|
| Edit file di folder `src/` | ✅ Boleh |
| Edit `vite.config.ts` | ✅ Boleh |
| Edit `tailwind.config.js` | ✅ Boleh |
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
│  React 18 + Vite +  │◄──────►│   Laravel + MySQL    │
│     TypeScript       │  API   │   localhost:8000     │
│   localhost:5173     │  JSON  │                      │
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
| Language | **TypeScript + TSX** |
| Styling | **Tailwind CSS v3** |
| Font | **Plus Jakarta Sans** |
| Routing | React Router v6 |
| State Management | Zustand |
| Server State / Cache | TanStack Query (React Query) |
| HTTP Client | Axios |
| Form & Validasi | React Hook Form + Zod |
| UI Component | Ant Design (antd) |
| Icons | Lucide React |
| Animasi | Framer Motion |
| Notifikasi | React Toastify |
| Export CSV | Papa Parse |
| Chart Dashboard | Recharts |

---

## 🎨 Tema Warna (Tailwind)

Semua warna tersimpan di `tailwind.config.js` dan bisa langsung dipakai sebagai class:

| Token | Class Tailwind | Warna |
|---|---|---|
| Primary | `bg-primary`, `text-primary` | `#6E473B` (coklat tua) |
| Primary Light | `bg-primary-light` | `#8A6A5E` |
| Primary Dark | `bg-primary-dark` | `#4F332B` |
| Secondary | `bg-secondary`, `text-secondary` | `#E1D4C2` (krem) |
| Secondary Light | `bg-secondary-light` | `#EFE6D9` |
| Background | `bg-neutral-bg` | `#F3EEE7` |
| Card | `bg-neutral-card` | `#FAF8F4` |
| Border | `border-neutral-border` | `#D4C5B3` |
| Text Utama | `text-neutral-text` | `#211D1B` |

---

## 📁 Struktur Folder

```
frontend/
├── public/
├── src/
│   ├── assets/                     ← Gambar & file statis (gunakan .webp)
│   │
│   ├── components/
│   │   ├── common/                 ← Komponen lintas halaman (Navbar, Footer, Logo)
│   │   │   ├── PublicNavbar.tsx
│   │   │   ├── PublicFooter.tsx
│   │   │   └── PublicLogo.tsx
│   │   │
│   │   ├── public/                 ← Komponen per halaman publik
│   │   │   ├── home/               ← Komponen khusus halaman Home
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── Intro.tsx
│   │   │   │   ├── InfoCards.tsx
│   │   │   │   └── PhotoCard.tsx
│   │   │   ├── daftar/             ← Komponen khusus halaman Daftar
│   │   │   └── guideline/          ← Komponen khusus halaman Guideline
│   │   │
│   │   └── admin/                  ← Komponen khusus halaman Admin
│   │       └── AdminLayout.tsx
│   │
│   ├── pages/
│   │   ├── public/                 ← Halaman publik (tanpa login)
│   │   │   ├── LandingPage.tsx     ← Halaman utama (Home)
│   │   │   ├── Daftar.tsx          ← Halaman pendaftaran
│   │   │   └── Guideline.tsx       ← Halaman panduan
│   │   │
│   │   └── admin/                  ← Halaman admin (perlu login)
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx
│   │       ├── KelolaProgram.tsx
│   │       ├── ListPendaftar.tsx
│   │       └── SettingForm.tsx
│   │
│   ├── router/
│   │   └── index.tsx               ← React Router + route guard
│   │
│   ├── store/
│   │   └── authStore.ts            ← Zustand: state login admin
│   │
│   ├── services/                   ← Semua pemanggilan API via Axios
│   │   ├── api.ts                  ← Instance Axios + interceptor token
│   │   ├── programService.ts
│   │   ├── pendaftarService.ts
│   │   └── authService.ts
│   │
│   ├── hooks/                      ← Custom React hooks
│   ├── index.css                   ← Tailwind directives + global styles
│   └── main.tsx                    ← Entry point app
│
├── .env                            ← URL API (jangan di-commit!)
├── .env.example                    ← Template .env
├── index.html
├── tailwind.config.js              ← Tema warna & font
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 🗺️ Halaman & Akses

### 🌐 Publik (Tanpa Login)
| Route | Halaman | File |
|---|---|---|
| `/` | **Home** | `LandingPage.tsx` |
| `/daftar` | **Daftar** | `Daftar.tsx` |
| `/guideline` | **Guideline** | `Guideline.tsx` |

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
| **Frontend** (ini) | [amad-IO/frontend-kemenkum](https://github.com/amad-IO/frontend-kemenkum) | React + Vite + TypeScript |
| **Backend** | [rahmrafi/WebMagang-Kemenkuham](https://github.com/rahmrafi/WebMagang-Kemenkuham) | Laravel + MySQL Azure |

---

## 📋 Aturan Kontribusi

1. **Jangan pernah edit file backend** — semua `.php`, `composer.json`, migration, dll
2. Semua styling menggunakan **Tailwind CSS** — tidak pakai file `.css` terpisah per komponen
3. Komponen dikelompokkan per halaman di `components/public/home/`, `components/public/daftar/`, dll
4. Semua pemanggilan API harus melalui folder `src/services/`
5. Jangan hardcode URL API — selalu gunakan `import.meta.env.VITE_API_URL`
6. Jangan commit file `.env` — hanya `.env.example` yang boleh di-commit
7. Gunakan TypeScript dengan benar — hindari penggunaan `any`
8. Gambar wajib format **WebP** untuk performa optimal

---

*Frontend Developer: **amad-IO***
*Backend Developer: **rahmrafi***
