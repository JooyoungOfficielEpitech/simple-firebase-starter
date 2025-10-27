import { useReducer, useCallback } from 'react'
import type { SavedSection } from '../AudioPlayer'

// Types
export type UIMode = 'normal' | 'setting-sections' | 'loop-active'
export type SectionSettingStep = 'none' | 'setting-a' | 'setting-b' | 'complete'

export interface LoopState {
  pointA: number | null
  pointB: number | null
  isLooping: boolean
  currentSection: SavedSection | null
}

export interface AudioPlayerState {
  // Player state
  isLoading: boolean
  error: string | null
  isPlayerInitialized: boolean
  
  // Loop state
  loopState: LoopState
  hasAutoSetB: boolean
  isJumping: boolean
  
  // UI state
  uiMode: UIMode
  sectionSettingStep: SectionSettingStep
  progressBarWidth: number
  
  // Modal state
  showSaveModal: boolean
  sectionName: string
  
  // Dragging state
  isDragging: 'A' | 'B' | null
  dragStartX: number
  dragStartTime: number
}

// Action types
export type AudioPlayerAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLAYER_INITIALIZED'; payload: boolean }
  | { type: 'SET_LOOP_STATE'; payload: Partial<LoopState> }
  | { type: 'SET_HAS_AUTO_SET_B'; payload: boolean }
  | { type: 'SET_IS_JUMPING'; payload: boolean }
  | { type: 'SET_UI_MODE'; payload: UIMode }
  | { type: 'SET_SECTION_SETTING_STEP'; payload: SectionSettingStep }
  | { type: 'SET_PROGRESS_BAR_WIDTH'; payload: number }
  | { type: 'SET_SHOW_SAVE_MODAL'; payload: boolean }
  | { type: 'SET_SECTION_NAME'; payload: string }
  | { type: 'SET_DRAGGING'; payload: 'A' | 'B' | null }
  | { type: 'SET_DRAG_START'; payload: { x: number; time: number } }
  | { type: 'RESET_LOOP_STATE' }
  | { type: 'RESET_FOR_NEW_AUDIO' }

// Initial state
const initialState: AudioPlayerState = {
  isLoading: false,
  error: null,
  isPlayerInitialized: false,
  
  loopState: {
    pointA: 0,
    pointB: null,
    isLooping: true,
    currentSection: null,
  },
  hasAutoSetB: false,
  isJumping: false,
  
  uiMode: 'normal',
  sectionSettingStep: 'none',
  progressBarWidth: 200,
  
  showSaveModal: false,
  sectionName: '',
  
  isDragging: null,
  dragStartX: 0,
  dragStartTime: 0,
}

// Reducer
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
    
    case 'SET_HAS_AUTO_SET_B':
      return { ...state, hasAutoSetB: action.payload }
    
    case 'SET_IS_JUMPING':
      return { ...state, isJumping: action.payload }
    
    case 'SET_UI_MODE':
      return { ...state, uiMode: action.payload }
    
    case 'SET_SECTION_SETTING_STEP':
      return { ...state, sectionSettingStep: action.payload }
    
    case 'SET_PROGRESS_BAR_WIDTH':
      return { ...state, progressBarWidth: action.payload }
    
    case 'SET_SHOW_SAVE_MODAL':
      return { ...state, showSaveModal: action.payload }
    
    case 'SET_SECTION_NAME':
      return { ...state, sectionName: action.payload }
    
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload }
    
    case 'SET_DRAG_START':
      return { 
        ...state, 
        dragStartX: action.payload.x, 
        dragStartTime: action.payload.time 
      }
    
    case 'RESET_LOOP_STATE':
      return {
        ...state,
        loopState: {
          pointA: 0,
          pointB: null,
          isLooping: true,
          currentSection: null,
        },
        hasAutoSetB: false,
      }
    
    case 'RESET_FOR_NEW_AUDIO':
      return {
        ...state,
        loopState: {
          pointA: 0,
          pointB: null,
          isLooping: true,
          currentSection: null,
        },
        hasAutoSetB: false,
        isJumping: false,
        uiMode: 'normal',
        sectionSettingStep: 'none',
        showSaveModal: false,
        sectionName: '',
        isDragging: null,
      }
    
    default:
      return state
  }
}

// Custom hook
export function useAudioPlayerState() {
  const [state, dispatch] = useReducer(audioPlayerReducer, initialState)

  // Action creators
  const actions = {
    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading })
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error })
    }, []),

    setPlayerInitialized: useCallback((initialized: boolean) => {
      dispatch({ type: 'SET_PLAYER_INITIALIZED', payload: initialized })
    }, []),

    setLoopState: useCallback((loopState: Partial<LoopState>) => {
      dispatch({ type: 'SET_LOOP_STATE', payload: loopState })
    }, []),

    setHasAutoSetB: useCallback((hasAutoSetB: boolean) => {
      dispatch({ type: 'SET_HAS_AUTO_SET_B', payload: hasAutoSetB })
    }, []),

    setIsJumping: useCallback((isJumping: boolean) => {
      dispatch({ type: 'SET_IS_JUMPING', payload: isJumping })
    }, []),

    setUIMode: useCallback((mode: UIMode) => {
      dispatch({ type: 'SET_UI_MODE', payload: mode })
    }, []),

    setSectionSettingStep: useCallback((step: SectionSettingStep) => {
      dispatch({ type: 'SET_SECTION_SETTING_STEP', payload: step })
    }, []),

    setProgressBarWidth: useCallback((width: number) => {
      dispatch({ type: 'SET_PROGRESS_BAR_WIDTH', payload: width })
    }, []),

    setShowSaveModal: useCallback((show: boolean) => {
      dispatch({ type: 'SET_SHOW_SAVE_MODAL', payload: show })
    }, []),

    setSectionName: useCallback((name: string) => {
      dispatch({ type: 'SET_SECTION_NAME', payload: name })
    }, []),

    setDragging: useCallback((dragging: 'A' | 'B' | null) => {
      dispatch({ type: 'SET_DRAGGING', payload: dragging })
    }, []),

    setDragStart: useCallback((x: number, time: number) => {
      dispatch({ type: 'SET_DRAG_START', payload: { x, time } })
    }, []),

    resetLoopState: useCallback(() => {
      dispatch({ type: 'RESET_LOOP_STATE' })
    }, []),

    resetForNewAudio: useCallback(() => {
      dispatch({ type: 'RESET_FOR_NEW_AUDIO' })
    }, []),
  }

  return { state, actions }
}