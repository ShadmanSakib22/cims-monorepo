import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  role: string | null
  userName: string | null
  setUser: (role: string, name: string) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      userName: null,
      setUser: (role, userName) => set({ role, userName }),
      clearUser: () => set({ role: null, userName: null }),
    }),
    { name: 'auth-storage' }
  )
)
