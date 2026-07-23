import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminUser = Record<string, unknown> | null

type AuthStore = {
  admin: AdminUser
  isAuthenticated: boolean
  setAuth: (admin: AdminUser) => void
  logout: () => void
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,

      setAuth: (admin) =>
        set({ admin, isAuthenticated: true }),

      logout: () => {
        set({ admin: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore
