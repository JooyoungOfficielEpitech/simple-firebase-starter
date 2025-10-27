import { useReducer, useCallback } from 'react'
import type { SavedSection } from '@/components/AudioPlayer'

// Constants
export const INITIAL_POINT_A = 0
export const AUTO_SET_B_DELAY = 1000
export const JUMP_TIMEOUT = 500
export const MARKER_TOLERANCE = 30
export const PROGRESS_BAR_DEFAULT_WIDTH = 200

// State interfaces
export interface LoopState {
  pointA: number | null
  pointB: number | null
  isLooping: boolean
  currentSection: SavedSection | null
}

export interface AudioPlayerState {
  // Core player state
  isLoading: boolean
  error: string | null
  isPlayerInitialized: boolean
  
  // Loop state
  loopState: LoopState
  
  // A-B setup flags
  hasAutoSetB: boolean
  isJumping: boolean
  
  // Modal state
  showSaveModal: boolean
  sectionName: string
  
  // Progress bar state
  progressBarWidth: number
  isDragging: 'A' | 'B' | null
}

// Action types
type AudioPlayerAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLAYER_INITIALIZED'; payload: boolean }
  | { type: 'SET_LOOP_STATE'; payload: Partial<LoopState> }
  | { type: 'SET_POINT_A'; payload: number }
  | { type: 'SET_POINT_B'; payload: number }
  | { type: 'SET_HAS_AUTO_SET_B'; payload: boolean }
  | { type: 'SET_IS_JUMPING'; payload: boolean }
  | { type: 'SET_SHOW_SAVE_MODAL'; payload: boolean }
  | { type: 'SET_SECTION_NAME'; payload: string }
  | { type: 'SET_PROGRESS_BAR_WIDTH'; payload: number }
  | { type: 'SET_IS_DRAGGING'; payload: 'A' | 'B' | null }
  | { type: 'RESET_FOR_NEW_AUDIO' }
  | { type: 'LOAD_SECTION'; payload: SavedSection }
  | { type: 'AUTO_SET_B_TO_DURATION'; payload: number }

// Initial state
const initialState: AudioPlayerState = {
  isLoading: false,
  error: null,
  isPlayerInitialized: false,
  loopState: {
    pointA: INITIAL_POINT_A,
    pointB: null,
    isLooping: true,
    currentSection: null,
  },
  hasAutoSetB: false,
  isJumping: false,
  showSaveModal: false,
  sectionName: "",
  progressBarWidth: PROGRESS_BAR_DEFAULT_WIDTH,
  isDragging: null,
}

// Reducer function
function audioPlayerReducer(state: AudioPlayerState, action: AudioPlayerAction): AudioPlayerState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_PLAYER_INITIALIZED':
      return { ...state, isPlayerInitialized: action.payload }
    
    case 'SET_LOOP_STATE':
      return { 
        ...state, 
        loopState: { ...state.loopState, ...action.payload } 
      }
    
    case 'SET_POINT_A':
      return {
        ...state,
        loopState: { ...state.loopState, pointA: action.payload }
      }
    
    case 'SET_POINT_B':
      return {
        ...state,
        loopState: { ...state.loopState, pointB: action.payload },
        hasAutoSetB: true
      }
    
    case 'SET_HAS_AUTO_SET_B':
      return { ...state, hasAutoSetB: action.payload }
    
    case 'SET_IS_JUMPING':
      return { ...state, isJumping: action.payload }
    
    case 'SET_SHOW_SAVE_MODAL':
      return { ...state, showSaveModal: action.payload }
    
    case 'SET_SECTION_NAME':
      return { ...state, sectionName: action.payload }
    
    case 'SET_PROGRESS_BAR_WIDTH':
      return { ...state, progressBarWidth: action.payload }
    
    case 'SET_IS_DRAGGING':
      return { ...state, isDragging: action.payload }
    
    case 'RESET_FOR_NEW_AUDIO':
      return {
        ...state,
        loopState: {
          pointA: INITIAL_POINT_A,
          pointB: null,
          isLooping: true,
          currentSection: null,
        },
        hasAutoSetB: false,
        error: null,
      }
    
    case 'LOAD_SECTION':
      return {
        ...state,
        loopState: {
          pointA: action.payload.pointA,
          pointB: action.payload.pointB,
          isLooping: false,
          currentSection: action.payload,
        },
        hasAutoSetB: true,
      }
    
    case 'AUTO_SET_B_TO_DURATION':
      if (state.hasAutoSetB || state.loopState.pointB !== null) {
        return state // Don't auto-set if already set
      }
      return {
        ...state,
        loopState: { ...state.loopState, pointB: action.payload },
        hasAutoSetB: true,
      }
    
    default:
      return state
  }
}

// Custom hook
export function useAudioPlayerState() {
  const [state, dispatch] = useReducer(audioPlayerReducer, initialState)

  // Action creators
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const setPlayerInitialized = useCallback((initialized: boolean) => {
    dispatch({ type: 'SET_PLAYER_INITIALIZED', payload: initialized })
  }, [])

  const setLoopState = useCallback((updater: (prev: LoopState) => LoopState) => {
    const newState = updater(state.loopState)
    dispatch({ type: 'SET_LOOP_STATE', payload: newState })
  }, [state.loopState])

  const setPointA = useCallback((pointA: number) => {
    dispatch({ type: 'SET_POINT_A', payload: pointA })
  }, [])

  const setPointB = useCallback((pointB: number) => {
    dispatch({ type: 'SET_POINT_B', payload: pointB })
  }, [])

  const setHasAutoSetB = useCallback((hasAutoSetB: boolean) => {
    dispatch({ type: 'SET_HAS_AUTO_SET_B', payload: hasAutoSetB })
  }, [])

  const setIsJumping = useCallback((isJumping: boolean) => {
    dispatch({ type: 'SET_IS_JUMPING', payload: isJumping })
  }, [])

  const setShowSaveModal = useCallback((showSaveModal: boolean) => {
    dispatch({ type: 'SET_SHOW_SAVE_MODAL', payload: showSaveModal })
  }, [])

  const setSectionName = useCallback((sectionName: string) => {
    dispatch({ type: 'SET_SECTION_NAME', payload: sectionName })
  }, [])

  const setProgressBarWidth = useCallback((width: number) => {
    dispatch({ type: 'SET_PROGRESS_BAR_WIDTH', payload: width })
  }, [])

  const setIsDragging = useCallback((dragging: 'A' | 'B' | null) => {
    dispatch({ type: 'SET_IS_DRAGGING', payload: dragging })
  }, [])

  const resetForNewAudio = useCallback(() => {
    dispatch({ type: 'RESET_FOR_NEW_AUDIO' })
  }, [])

  const loadSection = useCallback((section: SavedSection) => {
    dispatch({ type: 'LOAD_SECTION', payload: section })
  }, [])

  const autoSetBToDuration = useCallback((duration: number) => {
    dispatch({ type: 'AUTO_SET_B_TO_DURATION', payload: duration })
  }, [])

  return {
    state,
    actions: {
      setLoading,
      setError,
      setPlayerInitialized,
      setLoopState,
      setPointA,
      setPointB,
      setHasAutoSetB,
      setIsJumping,
      setShowSaveModal,
      setSectionName,
      setProgressBarWidth,
      setIsDragging,
      resetForNewAudio,
      loadSection,
      autoSetBToDuration,
    },
  }
}