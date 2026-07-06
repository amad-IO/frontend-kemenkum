import api from './api'

// Ambil semua program (magang & penelitian)
export const getAllProgram = () => api.get('/programs')

// Ambil program berdasarkan kategori
export const getProgramByKategori = (kategori) =>
  api.get(`/programs?kategori=${kategori}`)

// Ambil detail satu program
export const getProgramById = (id) => api.get(`/programs/${id}`)

// Admin: tambah program baru
export const createProgram = (data) => api.post('/programs', data)

// Admin: update program
export const updateProgram = (id, data) => api.put(`/programs/${id}`, data)

// Admin: hapus program
export const deleteProgram = (id) => api.delete(`/programs/${id}`)
