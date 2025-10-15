import { useReducer, useCallback, useMemo } from "react"
import { PostType } from "@/types/post"

// Form data interface
export interface CreatePostFormData {
  // Basic info
  title: string
  production: string
  organizationName: string
  rehearsalSchedule: string
  location: string
  description: string
  tags: string
  status: "active" | "closed"
  deadline: string
  genre: "연극" | "뮤지컬" | "창작" | "기타"
  
  // Role info
  roles: Array<{
    name: string
    gender: "male" | "female" | "any"
    ageRange: string
    requirements: string
    count: number
  }>
  
  // Audition info
  auditionDate: string
  auditionLocation: string
  auditionRequirements: string
  auditionResultDate: string
  auditionMethod: "대면" | "화상" | "서류"
  
  // Performance info
  performanceDates: string
  performanceVenue: string
  ticketPrice: string
  targetAudience: string
  
  // Benefits info
  fee: string
  transportation: boolean
  costume: boolean
  portfolio: boolean
  photography: boolean
  meals: boolean
  otherBenefits: string
  
  // Contact info
  contactEmail: string
  contactPhone: string
  applicationMethod: "이메일" | "전화" | "온라인폼" | "방문"
  requiredDocuments: string
}

// UI state interface
export interface CreatePostUIState {
  postMode: PostType
  selectedImages: string[]
  uploadingImages: boolean
  loading: boolean
  showTemplateModal: boolean
  showDeadlinePicker: boolean
  showAuditionDatePicker: boolean
  showAuditionResultPicker: boolean
  showPerformanceDatePicker: boolean
  selectedTemplate: any | null
}

// Combined state
export interface CreatePostState {
  formData: CreatePostFormData
  ui: CreatePostUIState
}

// Action types
export type CreatePostAction =
  | { type: 'UPDATE_FIELD'; field: keyof CreatePostFormData; value: any }
  | { type: 'UPDATE_ROLE'; index: number; field: string; value: any }
  | { type: 'SET_POST_MODE'; mode: PostType }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_UPLOADING_IMAGES'; uploading: boolean }
  | { type: 'SET_SELECTED_IMAGES'; images: string[] }
  | { type: 'ADD_IMAGES'; images: string[] }
  | { type: 'REMOVE_IMAGE'; index: number }
  | { type: 'TOGGLE_MODAL'; modal: keyof Omit<CreatePostUIState, 'postMode' | 'selectedImages' | 'uploadingImages' | 'loading' | 'selectedTemplate'>; show: boolean }
  | { type: 'SET_TEMPLATE'; template: any }
  | { type: 'APPLY_TEMPLATE'; templateData: Partial<CreatePostFormData> }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_POST_DATA'; data: Partial<CreatePostFormData>; mode: PostType; images?: string[] }

// Initial form data
const initialFormData: CreatePostFormData = {
  title: "",
  production: "",
  organizationName: "",
  rehearsalSchedule: "",
  location: "",
  description: "",
  tags: "",
  status: "active",
  deadline: "",
  genre: "연극",
  roles: [{ name: "", gender: "any", ageRange: "", requirements: "", count: 1 }],
  auditionDate: "",
  auditionLocation: "",
  auditionRequirements: "",
  auditionResultDate: "",
  auditionMethod: "대면",
  performanceDates: "",
  performanceVenue: "",
  ticketPrice: "",
  targetAudience: "",
  fee: "",
  transportation: false,
  costume: false,
  portfolio: false,
  photography: false,
  meals: false,
  otherBenefits: "",
  contactEmail: "",
  contactPhone: "",
  applicationMethod: "이메일",
  requiredDocuments: "",
}

// Initial UI state
const initialUIState: CreatePostUIState = {
  postMode: 'text',
  selectedImages: [],
  uploadingImages: false,
  loading: false,
  showTemplateModal: false,
  showDeadlinePicker: false,
  showAuditionDatePicker: false,
  showAuditionResultPicker: false,
  showPerformanceDatePicker: false,
  selectedTemplate: null,
}

// Initial state
const initialState: CreatePostState = {
  formData: initialFormData,
  ui: initialUIState,
}

// Reducer function with performance optimizations
function createPostReducer(state: CreatePostState, action: CreatePostAction): CreatePostState {
  switch (action.type) {
    case 'UPDATE_FIELD': {
      const { field, value } = action
      // Only update if value actually changed
      if (state.formData[field] === value) return state
      
      return {
        ...state,
        formData: {
          ...state.formData,
          [field]: value,
        },
      }
    }

    case 'UPDATE_ROLE': {
      const { index, field, value } = action
      const currentRole = state.formData.roles[index]
      
      // Only update if role field actually changed
      if (currentRole && currentRole[field] === value) return state
      
      const newRoles = [...state.formData.roles]
      newRoles[index] = { ...newRoles[index], [field]: value }
      
      return {
        ...state,
        formData: {
          ...state.formData,
          roles: newRoles,
        },
      }
    }

    case 'SET_POST_MODE': {
      if (state.ui.postMode === action.mode) return state
      
      return {
        ...state,
        ui: {
          ...state.ui,
          postMode: action.mode,
        },
      }
    }

    case 'SET_LOADING': {
      if (state.ui.loading === action.loading) return state
      
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.loading,
        },
      }
    }

    case 'SET_UPLOADING_IMAGES': {
      if (state.ui.uploadingImages === action.uploading) return state
      
      return {
        ...state,
        ui: {
          ...state.ui,
          uploadingImages: action.uploading,
        },
      }
    }

    case 'SET_SELECTED_IMAGES': {
      if (state.ui.selectedImages === action.images) return state
      
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedImages: action.images,
        },
      }
    }

    case 'ADD_IMAGES': {
      const newImages = [...state.ui.selectedImages, ...action.images]
      
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedImages: newImages,
        },
      }
    }

    case 'REMOVE_IMAGE': {
      const newImages = state.ui.selectedImages.filter((_, i) => i !== action.index)
      
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedImages: newImages,
        },
      }
    }

    case 'TOGGLE_MODAL': {
      const { modal, show } = action
      if (state.ui[modal] === show) return state
      
      return {
        ...state,
        ui: {
          ...state.ui,
          [modal]: show,
        },
      }
    }

    case 'SET_TEMPLATE': {
      if (state.ui.selectedTemplate === action.template) return state
      
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTemplate: action.template,
        },
      }
    }

    case 'APPLY_TEMPLATE': {
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.templateData,
        },
        ui: {
          ...state.ui,
          showTemplateModal: false,
        },
      }
    }

    case 'LOAD_POST_DATA': {
      const { data, mode, images = [] } = action
      
      return {
        ...state,
        formData: {
          ...state.formData,
          ...data,
        },
        ui: {
          ...state.ui,
          postMode: mode,
          selectedImages: images,
        },
      }
    }

    case 'RESET_FORM': {
      return initialState
    }

    default:
      return state
  }
}

// Custom hook with memoized actions and computed values
export function useCreatePostForm() {
  const [state, dispatch] = useReducer(createPostReducer, initialState)

  // Memoized action creators
  const actions = {
    updateField: useCallback((field: keyof CreatePostFormData, value: any) => {
      dispatch({ type: 'UPDATE_FIELD', field, value })
    }, []),

    updateRole: useCallback((index: number, field: string, value: any) => {
      dispatch({ type: 'UPDATE_ROLE', index, field, value })
    }, []),

    setPostMode: useCallback((mode: PostType) => {
      dispatch({ type: 'SET_POST_MODE', mode })
    }, []),

    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', loading })
    }, []),

    setUploadingImages: useCallback((uploading: boolean) => {
      dispatch({ type: 'SET_UPLOADING_IMAGES', uploading })
    }, []),

    setSelectedImages: useCallback((images: string[]) => {
      dispatch({ type: 'SET_SELECTED_IMAGES', images })
    }, []),

    addImages: useCallback((images: string[]) => {
      dispatch({ type: 'ADD_IMAGES', images })
    }, []),

    removeImage: useCallback((index: number) => {
      dispatch({ type: 'REMOVE_IMAGE', index })
    }, []),

    toggleModal: useCallback((modal: keyof Omit<CreatePostUIState, 'postMode' | 'selectedImages' | 'uploadingImages' | 'loading' | 'selectedTemplate'>, show: boolean) => {
      dispatch({ type: 'TOGGLE_MODAL', modal, show })
    }, []),

    setTemplate: useCallback((template: any) => {
      dispatch({ type: 'SET_TEMPLATE', template })
    }, []),

    applyTemplate: useCallback((templateData: Partial<CreatePostFormData>) => {
      dispatch({ type: 'APPLY_TEMPLATE', templateData })
    }, []),

    loadPostData: useCallback((data: Partial<CreatePostFormData>, mode: PostType, images?: string[]) => {
      dispatch({ type: 'LOAD_POST_DATA', data, mode, images })
    }, []),

    resetForm: useCallback(() => {
      dispatch({ type: 'RESET_FORM' })
    }, []),
  }

  // Memoized computed values
  const computed = useMemo(() => {
    const { formData, ui } = state
    
    // Form completion calculation
    const requiredFields = [
      formData.title,
      ui.postMode === 'text' ? formData.production : true, // production not required for images
      formData.organizationName,
      ui.postMode === 'text' ? formData.rehearsalSchedule : true,
      ui.postMode === 'text' ? formData.location : true,
      ui.postMode === 'text' ? formData.description : true,
      formData.contactEmail
    ]
    
    const optionalFields = [
      formData.deadline,
      formData.roles[0]?.name,
      formData.auditionDate,
      formData.fee,
      formData.tags
    ]
    
    const filledRequired = requiredFields.filter(field => field && (typeof field === 'string' ? field.trim() : true)).length
    const filledOptional = optionalFields.filter(field => field && field.trim()).length
    
    const requiredScore = (filledRequired / requiredFields.length) * 70
    const optionalScore = (filledOptional / optionalFields.length) * 30
    const completeness = Math.round(requiredScore + optionalScore)
    
    // Validation for images mode
    const isValidForImages = ui.postMode === 'images' && ui.selectedImages.length > 0 && formData.title.trim() && formData.contactEmail.trim()
    
    // Validation for text mode
    const isValidForText = ui.postMode === 'text' && 
      formData.title.trim() && 
      formData.production.trim() && 
      formData.organizationName.trim() && 
      formData.rehearsalSchedule.trim() && 
      formData.location.trim() && 
      formData.description.trim() && 
      formData.contactEmail.trim()
    
    const isValid = isValidForImages || isValidForText
    
    return {
      completeness,
      isValid,
      canSubmit: isValid && !ui.loading && !ui.uploadingImages,
      hasImages: ui.selectedImages.length > 0,
      isImageMode: ui.postMode === 'images',
      isTextMode: ui.postMode === 'text',
    }
  }, [state])

  return {
    state,
    actions,
    computed,
    // Direct access to commonly used state
    formData: state.formData,
    ui: state.ui,
  }
}

// Performance monitoring for form rendering
export function useCreatePostPerformance() {
  if (__DEV__) {
    let renderCount = 0
    let startTime = Date.now()
    
    return {
      incrementRenderCount: () => {
        renderCount++
        if (renderCount > 10) {
          console.warn(`🐌 [Performance] CreatePost rendered ${renderCount} times`)
        }
      },
      
      logFormActionTime: (actionName: string) => {
        const actionTime = Date.now() - startTime
        if (actionTime > 50) {
          console.warn(`🐌 [Performance] Form action '${actionName}' took ${actionTime}ms`)
        }
        startTime = Date.now()
      },
    }
  }
  
  return {
    incrementRenderCount: () => {},
    logFormActionTime: () => {},
  }
}