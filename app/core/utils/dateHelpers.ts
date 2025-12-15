/**
 * Date Helper Utilities
 * Centralized date formatting and parsing functions
 */

/**
 * Format a Date object to Korean format string
 * @param date - The date to format
 * @returns Formatted date string in "YYYY.MM.DD (요일)" format
 * @example formatDate(new Date()) // "2024.10.20 (일)"
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  return `${year}.${month}.${day} (${weekDay})`
}

/**
 * Parse a Korean format date string to Date object
 * @param dateString - The date string to parse in "YYYY.MM.DD (요일)" format
 * @returns Parsed Date object or current date if parsing fails
 * @example parseDate("2024.10.20 (일)") // Date object for 2024-10-20
 */
export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date()
  
  // "2024.10.20 (일)" 형식 파싱
  const match = dateString.match(/(\d{4})\.(\d{2})\.(\d{2})/)
  if (match) {
    const [, year, month, day] = match
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  
  return new Date()
}

/**
 * Generic date change handler for date pickers
 * @param setShowPicker - Function to hide the date picker
 * @param updateFormData - Function to update form data
 * @param field - The form field to update
 * @param platform - Current platform ('ios' | 'android')
 * @returns Date change handler function
 */
export const createDateChangeHandler = (
  setShowPicker: (show: boolean) => void,
  updateFormData: (field: string, value: string) => void,
  field: string,
  platform: 'ios' | 'android'
) => {
  return (_event: any, selectedDate?: Date) => {
    if (platform === 'android') {
      setShowPicker(false)
    }
    if (selectedDate) {
      updateFormData(field, formatDate(selectedDate))
      if (platform === 'ios') {
        setShowPicker(false)
      }
    }
  }
}
