/**
 * Theme Store (Zustand)
 */

import { create } from "zustand"
import { persist, createJSONStorage, StateStorage } from "zustand/middleware"
import * as storage from "@/utils/storage"

interface ThemeState {
  themeName: string
  colorScheme: "light" | "dark"
  setTheme: (name: string) => void
  setColorScheme: (scheme: "light" | "dark") => void
  toggleColorScheme: () => void
}

// MMKV storage adapter for Zustand
const mmkvStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storage.loadString(name)
    return value ?? null
  },
  setItem: (name: string, value: string) => {
    storage.saveString(name, value)
  },
  removeItem: (name: string) => {
    storage.remove(name)
  },
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeName: "base",
      colorScheme: "light",

      setTheme: (name) => set({ themeName: name }),

      setColorScheme: (scheme) => set({ colorScheme: scheme }),

      toggleColorScheme: () => set({
        colorScheme: get().colorScheme === "light" ? "dark" : "light"
      }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)
