import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      setAuth: (token, admin) =>
        set({ token, admin, isAuthenticated: true }),

      logout: () => {
        localStorage.removeItem('admin_token')
        set({ token: null, admin: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore
