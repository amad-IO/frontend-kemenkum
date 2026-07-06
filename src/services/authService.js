import api from './api'

// Login admin
export const login = (credentials) => api.post('/auth/login', credentials)

// Logout admin
export const logout = () => api.post('/auth/logout')

// Ambil data admin yang sedang login
export const getMe = () => api.get('/auth/me')
