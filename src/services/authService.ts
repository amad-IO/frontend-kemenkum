import api from './api'

type LoginCredentials = {
  email: string
  password: string
}

// Login admin
export const login = (credentials: LoginCredentials) =>
  api.post('/auth/login', credentials)

// Logout admin
export const logout = () => api.post('/auth/logout')

// Ambil data admin yang sedang login
export const getMe = () => api.get('/auth/me')
