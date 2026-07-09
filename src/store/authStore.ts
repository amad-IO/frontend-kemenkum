import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminUser = Record<string, unknown> | null

type AuthStore = {
  admin: AdminUser
  token: string | null
  isAuthenticated: boolean
  setAuth: (admin: AdminUser, token: string) => void
  logout: () => void
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,

      setAuth: (admin, token) =>
        set({ admin, token, isAuthenticated: true }),

      logout: () => {
        set({ admin: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore
