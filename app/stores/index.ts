/**
 * Zustand Stores
 */

export { useAuthStore } from "./authStore"
export { useThemeStore } from "./themeStore"

// 기존 Context API 호환 레이어 (점진적 마이그레이션)
// TODO: Create compatibility layer for gradual migration
// export { useAuth } from "./compat/useAuth"
