import axios from 'axios'

// Dengan Vite proxy: semua /api → http://127.0.0.1:8000
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Untuk Sanctum SPA (mengirim HTTP-Only cookies)
  withXSRFToken: true, // Untuk Laravel CSRF Protection
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor sudah tidak butuh membaca localStorage karena menggunakan cookie otomatis
api.interceptors.request.use((config) => {
  return config
})

// Response interceptor: redirect ke login jika 401 atau 419 (CSRF mismatch)
// Auth sepenuhnya via HTTP-Only Cookie (Sanctum SPA) — tidak ada token di localStorage
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 419) {
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default api
