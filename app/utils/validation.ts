/**
 * Validation utilities for user input and data validation
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PostValidationData {
  title: string
  description: string
  production: string
  location: string
  organizationName: string
  tags: string[]
}

/**
 * Validates email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email?.trim())
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates post data before submission
 */
export function validatePostData(data: PostValidationData): ValidationResult {
  const errors: string[] = []

  // Title validation
  if (!data.title?.trim()) {
    errors.push("Title is required")
  } else if (data.title.length > 200) {
    errors.push("Title must be less than 200 characters")
  }

  // Description validation
  if (!data.description?.trim()) {
    errors.push("Description is required")
  } else if (data.description.length < 20) {
    errors.push("Description must be at least 20 characters")
  } else if (data.description.length > 5000) {
    errors.push("Description must be less than 5000 characters")
  }

  // Production validation
  if (!data.production?.trim()) {
    errors.push("Production name is required")
  } else if (data.production.length > 100) {
    errors.push("Production name must be less than 100 characters")
  }

  // Location validation
  if (!data.location?.trim()) {
    errors.push("Location is required")
  } else if (data.location.length > 200) {
    errors.push("Location must be less than 200 characters")
  }

  // Organization name validation
  if (!data.organizationName?.trim()) {
    errors.push("Organization name is required")
  } else if (data.organizationName.length > 100) {
    errors.push("Organization name must be less than 100 characters")
  }

  // Tags validation
  if (!data.tags || data.tags.length === 0) {
    errors.push("At least one tag is required")
  } else if (data.tags.length > 10) {
    errors.push("Cannot have more than 10 tags")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitizes user input to prevent XSS attacks
 */
export function validateUserInput(input: string | null | undefined): string {
  if (!input) return ""
  
  return input
    .toString()
    .trim()
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove HTML tags (basic sanitization)
    .replace(/<[^>]*>/g, "")
    // Remove potential JavaScript event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    // Remove javascript: protocol
    .replace(/javascript:/gi, "")
}

/**
 * Validates Korean phone number format
 */
export function validateKoreanPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+82|0)?(10|11|16|17|18|19)-?\d{3,4}-?\d{4}$/
  return phoneRegex.test(phone?.replace(/\s/g, ""))
}

/**
 * Validates date string in YYYY-MM-DD format
 */
export function validateDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Validates URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates that a string contains only allowed characters for tags
 */
export function validateTagFormat(tag: string): boolean {
  // Allow Korean, English, numbers, and basic punctuation
  const tagRegex = /^[가-힣a-zA-Z0-9\s\-_]+$/
  return tagRegex.test(tag) && tag.length <= 20
}