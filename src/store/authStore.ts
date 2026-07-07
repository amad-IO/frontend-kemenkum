import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminUser = Record<string, unknown> | null

type AuthStore = {
  token: string | null
  admin: AdminUser
  isAuthenticated: boolean
  setAuth: (token: string, admin: AdminUser) => void
  logout: () => void
}

const useAuthStore = create<AuthStore>()(
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
