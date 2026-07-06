import api from './api'

// Submit form pendaftaran magang
export const daftarMagang = (data) => api.post('/pendaftar/magang', data)

// Submit form pendaftaran penelitian
export const daftarPenelitian = (data) => api.post('/pendaftar/penelitian', data)

// Admin: ambil semua pendaftar (bisa filter kategori)
export const getAllPendaftar = (params) => api.get('/pendaftar', { params })

// Admin: ambil detail satu pendaftar
export const getPendaftarById = (id) => api.get(`/pendaftar/${id}`)

// Admin: update status pendaftar
export const updateStatusPendaftar = (id, status) =>
  api.patch(`/pendaftar/${id}/status`, { status })

// Cek nomor pendaftaran (untuk user)
export const cekNomorPendaftaran = (nomor) =>
  api.get(`/pendaftar/cek/${nomor}`)
