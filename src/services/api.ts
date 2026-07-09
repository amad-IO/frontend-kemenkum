import axios from 'axios'

// Dengan Vite proxy: semua /api → http://127.0.0.1:8000
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor: tambahkan Bearer Token dari localStorage
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth-storage')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      const token = parsed?.state?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Abaikan jika gagal parse
    }
  }
  return config
})

// Response interceptor: redirect ke login jika 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default api
