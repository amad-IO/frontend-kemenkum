import axios from 'axios'

// Dengan Vite proxy, semua request ke /api dan /sanctum
// otomatis diteruskan ke http://localhost:8000 oleh Vite.
// Sehingga tidak ada lagi masalah CORS atau CSRF cookie.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Response interceptor → handle error global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default api
