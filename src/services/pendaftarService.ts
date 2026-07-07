import api from './api'

type FormPayload = Record<string, unknown>
type QueryParams = Record<string, string | number | boolean | undefined>
type PendaftarId = string | number

// Submit form pendaftaran magang
export const daftarMagang = (data: FormPayload) =>
  api.post('/pendaftar/magang', data)

// Submit form pendaftaran penelitian
export const daftarPenelitian = (data: FormPayload) =>
  api.post('/pendaftar/penelitian', data)

// Admin: ambil semua pendaftar (bisa filter kategori)
export const getAllPendaftar = (params?: QueryParams) =>
  api.get('/pendaftar', { params })

// Admin: ambil detail satu pendaftar
export const getPendaftarById = (id: PendaftarId) =>
  api.get(`/pendaftar/${id}`)

// Admin: update status pendaftar
export const updateStatusPendaftar = (id: PendaftarId, status: string) =>
  api.patch(`/pendaftar/${id}/status`, { status })

// Cek nomor pendaftaran (untuk user)
export const cekNomorPendaftaran = (nomor: string) =>
  api.get(`/pendaftar/cek/${nomor}`)
