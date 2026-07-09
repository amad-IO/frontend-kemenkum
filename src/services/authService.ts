import api from './api'

type LoginCredentials = {
  username: string
  password: string
}

// Login admin
export const login = (credentials: LoginCredentials) =>
  api.post('/admin/login', credentials)

// Logout admin
export const logout = () => api.post('/admin/logout')

// Ambil data admin yang sedang login
export const getMe = () => api.get('/admin/me')
