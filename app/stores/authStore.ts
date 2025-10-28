/**
 * Auth Store (Zustand)
 * 기존 AuthContext를 대체하는 상태 관리
 */

import { create } from "zustand"
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth"

interface AuthState {
  user: FirebaseAuthTypes.User | null
  isLoading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: FirebaseAuthTypes.User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const result = await auth().signInWithEmailAndPassword(email, password)
      set({ user: result.user, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const result = await auth().createUserWithEmailAndPassword(email, password)
      set({ user: result.user, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  signOut: async () => {
    set({ isLoading: true })
    try {
      await auth().signOut()
      set({ user: null, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  setUser: (user) => set({ user }),
}))
