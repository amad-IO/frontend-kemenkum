import api from './api'

type ProgramPayload = Record<string, unknown>
type ProgramId = string | number

// Ambil semua program (magang & penelitian)
export const getAllProgram = () => api.get('/programs')

// Ambil program berdasarkan kategori
export const getProgramByKategori = (kategori: string) =>
  api.get(`/programs?kategori=${kategori}`)

// Ambil detail satu program
export const getProgramById = (id: ProgramId) => api.get(`/programs/${id}`)

// Admin: tambah program baru
export const createProgram = (data: ProgramPayload) => api.post('/programs', data)

// Admin: update program
export const updateProgram = (id: ProgramId, data: ProgramPayload) =>
  api.put(`/programs/${id}`, data)

// Admin: hapus program
export const deleteProgram = (id: ProgramId) => api.delete(`/programs/${id}`)
