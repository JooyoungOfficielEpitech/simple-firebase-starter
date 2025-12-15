import { useReducer, useCallback } from "react"
import { Post } from "@/core/types/post"
import { Organization } from "@/core/types/organization"
import { UserProfile } from "@/core/types/user"

// State interface
export interface BulletinBoardState {
  // Data states
  posts: Post[]
  filteredPosts: Post[]
  organizations: Organization[]
  userProfile: UserProfile | null
  
  // UI states
  loading: boolean
  error: string | null
  activeTab: 'announcements' | 'organizations'
  selectedOrganizationId: string | null
  unreadCount: number
}

// Action types
export type BulletinBoardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_POSTS'; payload: Post[] }
  | { type: 'SET_FILTERED_POSTS'; payload: Post[] }
  | { type: 'SET_ORGANIZATIONS'; payload: Organization[] }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_ACTIVE_TAB'; payload: 'announcements' | 'organizations' }
  | { type: 'SET_SELECTED_ORGANIZATION'; payload: string | null }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'RESET_FILTER' }
  | { type: 'RESET_STATE' }

// Initial state
const initialState: BulletinBoardState = {
  posts: [],
  filteredPosts: [],
  organizations: [],
  userProfile: null,
  loading: true,
  error: null,
  activeTab: 'announcements',
  selectedOrganizationId: null,
  unreadCount: 0,
}

// Reducer function with performance optimization
function bulletinBoardReducer(
  state: BulletinBoardState, 
  action: BulletinBoardAction
): BulletinBoardState {
  switch (action.type) {
    case 'SET_LOADING':
      // Only update if loading state actually changes
      if (state.loading === action.payload) return state
      return { ...state, loading: action.payload }

    case 'SET_ERROR':
      // Only update if error state actually changes  
      if (state.error === action.payload) return state
      return { ...state, error: action.payload }

    case 'SET_POSTS':
      // Avoid unnecessary updates if posts array is the same
      if (state.posts === action.payload) return state
      return { 
        ...state, 
        posts: action.payload,
        loading: false,
        error: null
      }

    case 'SET_FILTERED_POSTS':
      if (state.filteredPosts === action.payload) return state
      return { ...state, filteredPosts: action.payload }

    case 'SET_ORGANIZATIONS':
      if (state.organizations === action.payload) return state
      return { ...state, organizations: action.payload }

    case 'SET_USER_PROFILE':
      if (state.userProfile === action.payload) return state
      return { ...state, userProfile: action.payload }

    case 'SET_ACTIVE_TAB':
      if (state.activeTab === action.payload) return state
      return { ...state, activeTab: action.payload }

    case 'SET_SELECTED_ORGANIZATION':
      if (state.selectedOrganizationId === action.payload) return state
      return { 
        ...state, 
        selectedOrganizationId: action.payload,
        // Auto-switch to announcements when organization is selected
        activeTab: action.payload ? 'announcements' : state.activeTab
      }

    case 'SET_UNREAD_COUNT':
      if (state.unreadCount === action.payload) return state
      return { ...state, unreadCount: action.payload }

    case 'RESET_FILTER':
      return {
        ...state,
        selectedOrganizationId: null,
        filteredPosts: [],
        activeTab: 'organizations'
      }

    case 'RESET_STATE':
      return initialState

    default:
      return state
  }
}

// Custom hook with memoized actions
export function useBulletinBoardState() {
  const [state, dispatch] = useReducer(bulletinBoardReducer, initialState)

  // Memoized action creators to prevent unnecessary re-renders
  const actions = {
    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading })
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error })
    }, []),

    setPosts: useCallback((posts: Post[]) => {
      dispatch({ type: 'SET_POSTS', payload: posts })
    }, []),

    setFilteredPosts: useCallback((posts: Post[]) => {
      dispatch({ type: 'SET_FILTERED_POSTS', payload: posts })
    }, []),

    setOrganizations: useCallback((organizations: Organization[]) => {
      dispatch({ type: 'SET_ORGANIZATIONS', payload: organizations })
    }, []),

    setUserProfile: useCallback((profile: UserProfile | null) => {
      dispatch({ type: 'SET_USER_PROFILE', payload: profile })
    }, []),

    setActiveTab: useCallback((tab: 'announcements' | 'organizations') => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })
    }, []),

    setSelectedOrganization: useCallback((organizationId: string | null) => {
      dispatch({ type: 'SET_SELECTED_ORGANIZATION', payload: organizationId })
    }, []),

    setUnreadCount: useCallback((count: number) => {
      dispatch({ type: 'SET_UNREAD_COUNT', payload: count })
    }, []),

    resetFilter: useCallback(() => {
      dispatch({ type: 'RESET_FILTER' })
    }, []),

    resetState: useCallback(() => {
      dispatch({ type: 'RESET_STATE' })
    }, []),
  }

  return {
    state,
    actions,
    // Computed values
    isOrganizer: state.userProfile?.userType === "organizer",
    displayPosts: state.selectedOrganizationId ? state.filteredPosts : state.posts,
    headerTitle: state.selectedOrganizationId 
      ? state.organizations.find(org => org.id === state.selectedOrganizationId)?.name || "단체"
      : "게시판",
  }
}

// Performance monitoring hook (development only)
export function useBulletinBoardPerformance() {
  if (__DEV__) {
    const startTime = Date.now()
    
    return {
      logRenderTime: (componentName: string) => {
        const renderTime = Date.now() - startTime
        if (renderTime > 100) {
          console.warn(`🐌 [Performance] ${componentName} took ${renderTime}ms to render`)
        } else if (renderTime > 50) {
          console.log(`⚡ [Performance] ${componentName} rendered in ${renderTime}ms`)
        }
      }
    }
  }
  
  return { logRenderTime: () => {} }
}