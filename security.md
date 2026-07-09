# Panduan Keamanan & Konfigurasi Environment (Frontend)

Dokumen ini menjelaskan konfigurasi environment variables (`.env`) yang krusial untuk menjaga keamanan aplikasi, terutama setelah kita mengaktifkan fitur **Sanctum SPA Authentication (HttpOnly Cookie)** untuk melindungi kredensial Admin.

## Konfigurasi Frontend (`frontend/.env`)

Aplikasi React Anda menggunakan Vite, sehingga semua variabel environment harus diawali dengan `VITE_`.

### 1. Tahap Development (Lokal)
Saat Anda melakukan coding di komputer lokal (`npm run dev`), pastikan file `.env` di folder `frontend/` berisi:

```env
VITE_API_URL=http://localhost:8000
```
> **Catatan Penting:** 
> Perhatikan bahwa `VITE_API_URL` sekarang menunjuk ke `http://localhost:8000` (TANPA akhiran `/api`). 
> Hal ini karena saat menggunakan Sanctum SPA, request pertama untuk menginisialisasi keamanan (CSRF Cookie) akan di-hit ke rute `/sanctum/csrf-cookie` (bukan `/api/sanctum/...`). Konfigurasi rute `/api` nantinya akan ditangani langsung di file konfigurasi axios (`api.ts`).

### 2. Tahap Production (Live Server)
Saat aplikasi Anda sudah siap diluncurkan (di-*deploy* ke hosting atau VPS Kemenkumham), Anda **wajib** mengubah nilai di file `.env` server frontend menjadi URL aslinya:

```env
VITE_API_URL=https://api.magang.kemenkumham.go.id
```
*(Ganti URL di atas sesuai dengan nama domain backend yang Anda gunakan).*

---

## Konfigurasi Pasangan di Backend (`backend/.env`)

Keamanan Sanctum SPA bergantung pada pencocokan domain antara Frontend dan Backend. Agar frontend bisa sukses login, backend juga harus tahu domain mana yang sah.

### 1. Tahap Development (Lokal)
Di file `.env` dalam folder `backend/`:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Daftar domain yang diizinkan menggunakan sistem Cookie (pisahkan dengan koma)
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173

# Domain utama aplikasi lokal
SESSION_DOMAIN=localhost
```

### 2. Tahap Production (Live Server)
Di server live (misalnya backend di `api.magang.kemenkumham.go.id` dan frontend di `magang.kemenkumham.go.id`):

```env
APP_URL=https://api.magang.kemenkumham.go.id
FRONTEND_URL=https://magang.kemenkumham.go.id

# Hanya domain frontend yang diizinkan mendapat akses Cookie
SANCTUM_STATEFUL_DOMAINS=magang.kemenkumham.go.id

# Mengizinkan cookie dibagikan di dalam subdomain kemenkumham.go.id
# (Tanda titik di awal sangat penting agar cookie berlaku di seluruh subdomain)
SESSION_DOMAIN=.kemenkumham.go.id
```

## Checklist Sebelum Production
1. [ ] Pastikan tidak ada script `localStorage.setItem('admin_token', ...)` di frontend (semua wajib diganti ke sistem Cookie).
2. [ ] Pastikan `SESSION_SECURE_COOKIE=true` ditambahkan ke `.env` backend jika sudah menggunakan HTTPS.
3. [ ] Pastikan ekstensi Turnstile Captcha sudah aktif di halaman form Login.
