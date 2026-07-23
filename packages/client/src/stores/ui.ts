import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  language: 'en' | 'bn'
  setLanguage: (lang: 'en' | 'bn') => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  language: 'en',
  setLanguage: (language) => {
    set({ language })
    import('@/i18n').then((mod) => mod.default.changeLanguage(language))
  },
}))
