# Analisis Teknis Sistem Chat — Kemenkuham

> Ditulis berdasarkan pembacaan langsung source code, log server, dan hasil pengukuran.
> Tanggal: 12 Juli 2026

---

## 1. Mekanisme Pengambilan Data

### Metode: **HTTP Polling** (bukan WebSocket / SSE)

Frontend menggunakan `setInterval` + `useRef` untuk polling berkala. **Tidak ada WebSocket atau Server-Sent Events.**

### Chat Pendaftar (`CheckStatusPage.tsx`)

```typescript
// Interval: 2 detik
// Endpoint: GET /api/submissions/{id}/messages?since={lastId}&email=&nim=

const pollRef = useRef(pollNewMessages)
useEffect(() => { pollRef.current = pollNewMessages })  // selalu update closure terbaru

useEffect(() => {
  if (!chatOpen || !submissionId) return

  const immediateTimer = window.setTimeout(() => pollRef.current(), 500)
  const interval = window.setInterval(() => pollRef.current(), 2000)

  const handleVisibility = () => {
    if (!document.hidden) pollRef.current()  // fetch ulang saat tab aktif kembali
  }
  document.addEventListener('visibilitychange', handleVisibility)

  return () => {
    window.clearTimeout(immediateTimer)
    window.clearInterval(interval)
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}, [chatOpen, submissionId])  // hanya restart jika chat dibuka/tutup atau ID berubah
```

**Delta polling** — hanya ambil pesan baru via `?since=lastMessageId`:
```typescript
const pollNewMessages = async () => {
  const params = { email: emailValue, nim: nimValue }
  if (lastMessageIdRef.current > 0) params.since = lastMessageIdRef.current
  const res = await api.get(`/submissions/${submissionId}/messages`, { params })
  // ...dedup by ID, tidak tambah pesan yang sudah ada
}
```

### Chat Admin (`DetailPendaftarModal.tsx`)

```typescript
// Interval: 2 detik saat aktif, 8 detik saat minimize
// Endpoint: GET /api/admin/submissions/{id}/messages?since={lastId}&mark_read=1

// Saat aktif
useEffect(() => {
  if (!chatOpen || !submission || (chatOnly && chatMinimized)) return

  loadMessages()   // initial load sekali
  const immediate = window.setTimeout(() => pollRef.current(true), 600)
  const interval = window.setInterval(() => pollRef.current(true), 2000)
  // + visibilitychange listener
  return () => { clearTimeout(immediate); clearInterval(interval); }
}, [chatOpen, submission?.id, chatOnly, chatMinimized])

// Saat minimize (badge update tanpa mark_read)
useEffect(() => {
  if (!chatOpen || !submission || !chatOnly || !chatMinimized) return

  const interval = window.setInterval(() => pollRef.current(false), 8000)
  return () => window.clearInterval(interval)
}, [chatOpen, submission?.id, chatOnly, chatMinimized])
```

### Ringkasan Endpoint

| Sisi | Endpoint GET | Interval |
|------|-------------|---------|
| Pendaftar | `GET /api/submissions/{id}/messages?since=N&email=&nim=` | **2 detik** |
| Admin (aktif) | `GET /api/admin/submissions/{id}/messages?since=N&mark_read=1` | **2 detik** |
| Admin (minimize) | `GET /api/admin/submissions/{id}/messages?since=N&mark_read=0` | **8 detik** |

> **Catatan penting:** Polling hanya berjalan saat tab **terlihat** (Page Visibility API). Saat user berpindah tab, `visibilitychange` menghentikan interval dan langsung fetch saat kembali.

---

## 2. Struktur Database

### Tabel: `submission_messages`

**Migration file:** `2026_07_11_000002_create_submission_messages_table.php`

```php
Schema::create('submission_messages', function (Blueprint $table) {
    $table->id();                                          // BIGINT UNSIGNED AUTO_INCREMENT (PK)
    $table->foreignId('submission_id')                     // BIGINT UNSIGNED NOT NULL
          ->constrained('submissions')
          ->cascadeOnDelete();
    $table->enum('sender_type', ['admin', 'applicant']);   // ENUM NOT NULL
    $table->string('sender_name', 120);                    // VARCHAR(120) NOT NULL
    $table->text('message');                               // TEXT NOT NULL
    $table->timestamps();                                  // created_at, updated_at TIMESTAMP

    $table->index(['submission_id', 'created_at']);        // Composite index
});
```

**Migration tambahan:** `2026_07_11_000003_add_admin_read_at_to_submission_messages_table.php`

```php
Schema::table('submission_messages', function (Blueprint $table) {
    $table->timestamp('admin_read_at')->nullable()->after('message'); // untuk tracking unread admin
    $table->index(['submission_id', 'sender_type', 'admin_read_at']); // Composite index unread
});
```

### Skema Lengkap

| Kolom | Tipe | Nullable | Keterangan |
|-------|------|----------|-----------|
| `id` | BIGINT UNSIGNED | NO | Primary Key, auto increment |
| `submission_id` | BIGINT UNSIGNED | NO | FK ke `submissions.id`, CASCADE DELETE |
| `sender_type` | ENUM('admin','applicant') | NO | Pengirim pesan |
| `sender_name` | VARCHAR(120) | NO | Nama tampilan pengirim |
| `message` | TEXT | NO | Isi pesan (max 2000 char di validasi) |
| `admin_read_at` | TIMESTAMP | YES | NULL = belum dibaca admin; diisi saat admin buka chat |
| `created_at` | TIMESTAMP | YES | Waktu dibuat (Laravel default) |
| `updated_at` | TIMESTAMP | YES | Waktu diupdate (Laravel default) |

### Index yang Ada

| Index | Kolom | Tipe | Fungsi |
|-------|-------|------|--------|
| `PRIMARY` | `id` | BTREE | Lookup by ID |
| `submission_messages_submission_id_created_at_index` | `(submission_id, created_at)` | BTREE | Ambil pesan per submission diurutkan waktu |
| `submission_messages_submission_id_sender_type_admin_read_at_index` | `(submission_id, sender_type, admin_read_at)` | BTREE | Hitung unread pesan dari applicant |
| FK index (implicit) | `submission_id` | BTREE | Foreign key constraint |

### Jumlah Baris Saat Ini

```
submission_messages: 35 baris
submissions: 22 baris
```

Data masih sangat kecil — ini adalah environment pengembangan, bukan produksi.

---

## 3. Query yang Dipakai

### Ambil Pesan (Controller)

**Public (`SubmissionController.php`):**
```php
public function messages(Request $request, Submission $submission): JsonResponse
{
    $this->assertApplicantCanAccess($request, $submission);
    $this->assertDiscussionIsOpen($submission);

    return response()->json([
        'success' => true,
        'data' => $submission->messages()      // HasMany relation
            ->oldest()                          // ORDER BY created_at ASC
            ->when(
                $request->filled('since') && is_numeric($request->query('since')),
                fn($q) => $q->where('id', '>', (int) $request->query('since'))
            )
            ->get(['id', 'sender_type', 'sender_name', 'message', 'created_at']),
            // SELECT 5 kolom saja (bukan SELECT *)
    ]);
}
```

**SQL yang dihasilkan (initial load):**
```sql
SELECT id, sender_type, sender_name, message, created_at
FROM submission_messages
WHERE submission_id = ?
ORDER BY created_at ASC
```

**SQL saat delta polling (`?since=28`):**
```sql
SELECT id, sender_type, sender_name, message, created_at
FROM submission_messages
WHERE submission_id = ? AND id > 28
ORDER BY created_at ASC
```

**Admin (`Admin/SubmissionController.php`):**
```php
public function messages(Request $request, Submission $submission): JsonResponse
{
    // Mark read atomically sebelum ambil data
    if ($request->boolean('mark_read', true) && $this->canTrackUnreadMessages()) {
        $submission->messages()
            ->where('sender_type', 'applicant')
            ->whereNull('admin_read_at')
            ->update(['admin_read_at' => now()]);  // UPDATE batch
    }

    return response()->json([
        'data' => $submission->messages()
            ->oldest()
            ->when(/* since filter */)
            ->get(['id', 'sender_type', 'sender_name', 'message', 'created_at']),
    ]);
}
```

### Pagination

**Tidak menggunakan `paginate()`, `cursorPaginate()`, atau `limit()`.**

Semua pesan diambil sekaligus dengan `.get()`. Ini acceptable untuk sekarang karena:
- Data masih sedikit (35 baris total)
- Dengan `?since=N`, polling hanya return pesan baru (biasanya 0–3 baris)

> ⚠️ **Risiko:** Jika satu submission memiliki ribuan pesan (percakapan sangat panjang), initial load akan lambat. Perlu `limit(100)->latest()` + scroll-to-top sebagai mitigasi di masa depan.

### N+1 Query

**Tidak ada N+1 query.** Relasi diakses lewat `$submission->messages()` (HasMany) yang sudah di-scope ke `submission_id`. Tidak ada eager loading tambahan yang perlu karena `SubmissionMessage` tidak punya relasi lain yang di-load.

Hanya ada **2 query per request** untuk admin (mark_read UPDATE + SELECT), dan **1 query** untuk pendaftar.

---

## 4. Broadcasting / Real-time

### Status: **TIDAK DISETUP**

- File `config/broadcasting.php` **tidak ada** di project ini
- Tidak ada folder `app/Events/`
- `.env` menunjukkan: `BROADCAST_CONNECTION=log` (driver `log` = tidak ada broadcast nyata, hanya dicatat ke log file)

```env
BROADCAST_CONNECTION=log   # ← hanya write ke log, tidak ada WebSocket
QUEUE_CONNECTION=database  # ← queue ada tapi tidak dipakai untuk chat
```

### Package yang Terpasang

Tidak ada `pusher/pusher-php-server`, `laravel/reverb`, `ably/ably-php`, atau paket broadcasting lain di `composer.json`.

### Kesimpulan

> Sistem ini **murni polling**. Tidak ada WebSocket, Pusher, Reverb, Ably, atau SSE. Broadcasting belum pernah diimplementasikan.

---

## 5. Infrastruktur

### Konfigurasi Saat Ini (Development)

| Komponen | Detail |
|---------|--------|
| **Web server** | `php artisan serve` (PHP built-in server, **bukan Nginx/Apache**) |
| **Database server** | MariaDB di **VPS remote `20.6.10.194`** (bukan localhost) |
| **PHP runtime** | PHP CLI single-threaded |
| **Queue worker** | `QUEUE_CONNECTION=database` (terkonfigurasi) tapi **tidak ada worker berjalan** |
| **Supervisor** | Tidak ada |
| **Environment** | `APP_ENV=local` (development) |

### Temuan Kritis: Database di Remote VPS

```
DB_HOST=20.6.10.194   ← IP VPS remote (bukan localhost/127.0.0.1)
DB_PORT=3306
DB_DATABASE=magang_kemenkumham_db
```

Hasil ping ke `20.6.10.194`:
```
Pinging 20.6.10.194: Request timed out (3 packets, 100% loss)
```

Ping ICMP diblok firewall VPS, tapi koneksi MySQL tetap berhasil karena port 3306 dibuka khusus. Namun **setiap query database melewati jaringan internet**, bukan loopback.

### Dampak pada Response Time

Dari log Laravel yang terekam selama sesi pengujian:
```
18:02:59 GET /api/admin/submissions/21/messages  ~ 1s
18:03:00 GET /api/admin/submissions/20/messages  ~ 1s  
18:03:01 GET /api/admin/submissions/18/messages  ~ 2s
18:03:18 GET /api/admin/submissions/20/messages  ~ 5s   ← spike
18:03:18 GET /api/admin/submissions/19/messages  ~ 5s   ← spike
```

**Response time rata-rata: 500ms – 2 detik per request polling.**
**Spike hingga 5 detik** terjadi saat koneksi VPS tidak stabil.

> **Ini adalah root cause utama** kenapa pesan terasa lambat 15–30 detik: `interval 2 detik + latency 1–5 detik/request` = pesan baru bisa terasa muncul setelah 5–10 detik dalam kondisi normal, lebih lama saat jaringan tidak stabil.

### Spek VPS

Tidak dapat diakses langsung (ICMP blocked). Berdasarkan setup (MariaDB, shared DB dengan beberapa koneksi simultan), kemungkinan VPS tier rendah (1–2 vCPU, 1–2 GB RAM).

---

## 6. Pengukuran Nyata (dari Laravel Access Log)

Data diambil dari log `php artisan serve` saat sesi testing aktif:

### Request yang Terjadi Saat Chat Terbuka

```
GET /api/admin/submissions/{id}/messages   ← polling setiap 2 detik per submission terbuka
POST /api/admin/submissions/{id}/messages  ← saat admin kirim pesan
GET /api/submissions/{id}/messages         ← polling pendaftar setiap 2 detik
POST /api/submissions/{id}/messages        ← saat pendaftar kirim pesan
```

### Response Time Sample (dari log aktual)

| Waktu | Endpoint | Response Time |
|-------|----------|--------------|
| 18:03:03 | `/admin/submissions/21/messages` | ~1s |
| 18:03:03 | `/admin/submissions/20/messages` | ~508ms |
| 18:03:04 | `/admin/submissions/19/messages` | ~513ms |
| 18:03:04 | `/admin/submissions/18/messages` | ~1s |
| 18:03:10 | `/admin/submissions/20/messages` | ~2s |
| 18:03:18 | `/admin/submissions/20/messages` | **~5s** (spike) |
| 18:03:18 | `/admin/submissions/19/messages` | **~5s** (spike) |

### Frekuensi Request

Dengan **5 submission** yang chat-nya terbuka bersamaan di sisi admin:
- **5 × (1 request / 2 detik) = 2.5 request/detik** ke database VPS
- Setiap request trigger **1–2 query SQL** ke remote database
- Total: **~5 query SQL/detik** ke VPS

---

## 7. Load Pesan Pertama Kali

### Perilaku Saat Ini

**Semua history pesan diload sekaligus** tanpa batasan limit atau pagination.

```php
// Controller — tidak ada limit()
$submission->messages()
    ->oldest()        // ORDER BY created_at ASC
    ->get([...])      // SELECT semua baris
```

```typescript
// Frontend — loadMessages dipanggil sekali saat pertama buka
const loadMessages = async (markRead = true) => {
  if (messagesLoadedRef.current) return  // skip jika sudah loaded

  setLoadingMessages(true)
  const res = await api.get(`/submissions/${submissionId}/messages`, {
    params: { email, nim }  // tanpa ?since → ambil semua
  })
  const msgs = res.data?.data ?? []
  setMessages(msgs)
  messagesLoadedRef.current = true  // flag: tidak load ulang
  // ...
}
```

### Guard: Tidak Reload Saat Reopen

Setelah initial load, `messagesLoadedRef.current = true`. Saat user tutup-buka chat, `loadMessages` langsung return tanpa network request. Polling delta (`?since=lastId`) yang handle update selanjutnya.

### Berapa Banyak Pesan di-Load?

- **Saat ini:** Semua pesan (35 total di DB, tersebar di 22 submission = rata-rata ~1–5 pesan/submission)
- **Worst case produksi:** Jika satu submission punya 500 pesan, semua 500 diambil sekaligus

### Rekomendasi untuk Produksi

```php
// Batasi 100 pesan terakhir saat initial load
$submission->messages()
    ->latest()
    ->limit(100)
    ->get([...])
    ->reverse();  // kembalikan urutan lama ke baru
```

---

## Ringkasan Temuan & Rekomendasi

| # | Masalah | Dampak | Rekomendasi |
|---|---------|--------|-------------|
| 1 | Database di remote VPS (20.6.10.194) | Latency 500ms–5s per request | Jalankan DB di localhost saat dev; di produksi pastikan DB & app server satu datacenter |
| 2 | PHP built-in server single-thread | Tidak bisa handle concurrent request dengan baik | Ganti ke Nginx + PHP-FPM di produksi |
| 3 | Polling interval 2 detik × N submission terbuka | Load server tinggi saat banyak chat aktif | Pertimbangkan Laravel Reverb (WebSocket) atau SSE untuk real-time |
| 4 | Semua pesan diload tanpa limit | Lambat jika history panjang | Tambah `limit(100)` + infinite scroll untuk produksi |
| 5 | `BROADCAST_CONNECTION=log` | Belum ada infrastruktur real-time | Setup Laravel Reverb jika ingin WebSocket tanpa biaya Pusher |
| 6 | Tidak ada queue worker | Notifikasi email/event tidak terproses | Jalankan `php artisan queue:work` dengan Supervisor |
