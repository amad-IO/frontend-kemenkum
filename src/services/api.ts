// Base URL Backend Laravel
// VITE_API_URL = http://localhost:8000 (TANPA /api)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
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
