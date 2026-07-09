import api from './api'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Periode {
  id: number
  start_date: string
  end_date: string
  quota: number
  remaining_quota: number
  status: 'active' | 'inactive'
}

interface ApiListResponse<T> {
  success: boolean
  data: T
}

export interface PersyaratanItem {
  teks: string
  opsional?: boolean
}

export interface KategoriPersyaratan {
  kategori: string
  items: PersyaratanItem[]
}

export interface PeriodeKegiatan {
  mulai: string
  selesai: string
  label: string
}

export interface JudulPenelitian {
  id: number
  judul: string
}

export interface SubmitMagangPayload {
  type: 'magang'
  period_id: number
  institution: string
  study_program: string
  letter_number: string
  phone_number: string
  member_1: string       // format: "Nama Lengkap|NIM|email" atau hanya nama untuk kelompok
  member_2?: string
  member_3?: string
  document: File
}

export interface AnggotaKelompok {
  nama: string
  nim: string
  whatsapp?: string
  email?: string
}

// ─── Dummy Data (Sementara sampai backend menyediakan endpoint) ───────────────

/**
 * Persyaratan Magang — sesuai referensi visual dari tim design
 * TODO: Ganti dengan GET /api/persyaratan?type=magang ketika backend siap
 */
export const getPersyaratanMagang = (): KategoriPersyaratan[] => [
  {
    kategori: 'Dokumen Yang Harus Disiapkan',
    items: [
      { teks: 'Surat Permohonan Magang dari Kampus / Institusi' },
      { teks: 'Proposal Magang' },
      { teks: 'Kartu Tanda Mahasiswa (KTM) / Kartu Identitas Pelajar (format ZIP)' },
    ],
  },
  {
    kategori: 'Data yang harus diisi',
    items: [
      { teks: 'Asal Instansi Pendidikan (Sekolah / Universitas)' },
      { teks: 'Program Studi / Jurusan' },
      { teks: 'Periode Magang yang diinginkan' },
      { teks: 'Periode Magang (Tanggal Mulai s.d. Tanggal Selesai)' },
      { teks: 'Jenis Pendaftaran (Individu / Kelompok – maksimal 3 orang)' },
      { teks: 'Data Ketua Kelompok / Pendaftar Individu (Nama Lengkap & NIM / NISN)' },
      { teks: 'Anggota 1 (Nama Lengkap & NIM / NISN)', opsional: true },
      { teks: 'Anggota 2 (Nama Lengkap & NIM / NISN)', opsional: true },
      { teks: 'Alamat Email Aktif' },
      { teks: 'Nomor WhatsApp Aktif' },
    ],
  },
]

/**
 * Persyaratan Penelitian
 * TODO: Ganti dengan GET /api/persyaratan?type=penelitian ketika backend siap
 */
export const getPersyaratanPenelitian = (): KategoriPersyaratan[] => [
  {
    kategori: 'Dokumen Yang Harus Disiapkan',
    items: [
      { teks: 'Surat Permohonan Penelitian dari Kampus / Institusi' },
      { teks: 'Proposal Penelitian' },
      { teks: 'Kartu Tanda Mahasiswa (KTM) / Kartu Identitas Pelajar (format ZIP)' },
    ],
  },
  {
    kategori: 'Data yang harus diisi',
    items: [
      { teks: 'Asal Instansi Pendidikan (Sekolah / Universitas)' },
      { teks: 'Program Studi / Jurusan' },
      { teks: 'Judul Penelitian yang diajukan' },
      { teks: 'Periode Penelitian (Tanggal Mulai s.d. Tanggal Selesai)' },
      { teks: 'Jenis Pendaftaran (Individu / Kelompok)' },
      { teks: 'Data Ketua / Pendaftar Individu (Nama Lengkap & NIM / NISN)' },
      { teks: 'Anggota Kelompok (Nama Lengkap & NIM / NISN)', opsional: true },
      { teks: 'Alamat Email Aktif' },
      { teks: 'Nomor WhatsApp Aktif' },
    ],
  },
]

/**
 * Periode kegiatan aktif
 * TODO: Ganti dengan GET /api/periode?type=magang|penelitian ketika backend siap
 */
export const getPeriode = (_type: 'magang' | 'penelitian'): PeriodeKegiatan => ({
  mulai: '2026-01-28',
  selesai: '2026-08-06',
  label: '28 Januari 2026 - 6 Agustus 2026',
})

/**
 * Daftar judul penelitian tersedia
 * TODO: Ganti dengan GET /api/research-topics ketika backend siap
 */
export const getJudulPenelitian = (): JudulPenelitian[] => [
  { id: 1, judul: 'Analisis Hukum Digital dan Keamanan Siber' },
  { id: 2, judul: 'Reformasi Birokrasi di Kementerian Hukum' },
  { id: 3, judul: 'Implementasi UU Perlindungan Data Pribadi' },
  { id: 4, judul: 'Efektivitas Sistem Pemasyarakatan Modern' },
  { id: 5, judul: 'Hak Kekayaan Intelektual di Era Ekonomi Digital' },
  { id: 6, judul: 'Harmonisasi Hukum Nasional dengan Standar Internasional' },
  { id: 7, judul: 'Penegakan Hukum dan Akses Keadilan bagi Masyarakat' },
]

// ─── Real API Calls ───────────────────────────────────────────────────────────

/**
 * Ambil daftar periode magang aktif dari backend
 * GET /api/periods
 */
export const getPeriodeMagang = (): Promise<Periode[]> =>
  api.get<ApiListResponse<Periode[]>>('/periods').then((res) => res.data.data)

/**
 * Submit form pendaftaran (Magang & Penelitian)
 * POST /api/submit — menggunakan FormData karena ada file upload
 */
export const submitPendaftaran = (formData: FormData) =>
  api.post('/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
