/**
 * AccessibilityTester - WCAG 2.1 AA Compliance Testing Utilities
 * 
 * This utility provides functions to test and validate accessibility compliance
 * according to WCAG 2.1 AA standards for React Native applications.
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null
}

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.1: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 * WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 0
  
  const l1 = getRelativeLuminance(...rgb1)
  const l2 = getRelativeLuminance(...rgb2)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

export const AccessibilityTester = {
  /**
   * Validate color contrast against WCAG 2.1 AA standards
   * @param foreground - Foreground color (hex)
   * @param background - Background color (hex)
   * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
   * @returns Object with compliance status and ratio
   */
  validateContrast: (
    foreground: string, 
    background: string, 
    isLargeText: boolean = false
  ): { isCompliant: boolean; ratio: number; required: number } => {
    const ratio = calculateContrastRatio(foreground, background)
    const required = isLargeText ? 3.0 : 4.5
    
    return {
      isCompliant: ratio >= required,
      ratio: Math.round(ratio * 100) / 100,
      required
    }
  },

  /**
   * Validate touch target size according to WCAG guidelines
   * Minimum 44x44 logical pixels (iOS HIG) or 48x48dp (Android)
   * @param width - Touch target width
   * @param height - Touch target height
   * @returns Compliance status with recommendations
   */
  validateTouchTarget: (
    width: number, 
    height: number
  ): { isCompliant: boolean; recommendations: string[] } => {
    const recommendations: string[] = []
    const minSize = 44 // WCAG 2.1 AA minimum
    const recommendedSize = 56 // Better UX
    
    if (width < minSize) {
      recommendations.push(`Width ${width}px is below minimum ${minSize}px`)
    } else if (width < recommendedSize) {
      recommendations.push(`Consider increasing width to ${recommendedSize}px for better usability`)
    }
    
    if (height < minSize) {
      recommendations.push(`Height ${height}px is below minimum ${minSize}px`)
    } else if (height < recommendedSize) {
      recommendations.push(`Consider increasing height to ${recommendedSize}px for better usability`)
    }
    
    return {
      isCompliant: width >= minSize && height >= minSize,
      recommendations
    }
  },

  /**
   * Validate screen reader content for accessibility
   * @param element - Object with accessibility properties
   * @returns Validation result with suggestions
   */
  validateScreenReaderContent: (element: {
    accessibilityLabel?: string
    accessibilityHint?: string
    accessibilityRole?: string
    text?: string
  }): { isCompliant: boolean; issues: string[]; suggestions: string[] } => {
    const issues: string[] = []
    const suggestions: string[] = []
    
    // Check for accessibility label
    if (!element.accessibilityLabel && !element.text) {
      issues.push('Missing accessibility label')
      suggestions.push('Add accessibilityLabel prop or ensure text content is meaningful')
    }
    
    // Check label quality
    if (element.accessibilityLabel) {
      if (element.accessibilityLabel.length < 3) {
        issues.push('Accessibility label too short')
        suggestions.push('Provide descriptive label (minimum 3 characters)')
      }
      
      if (element.accessibilityLabel.length > 100) {
        suggestions.push('Consider shorter accessibility label (under 100 characters)')
      }
    }
    
    // Check accessibility role
    if (!element.accessibilityRole) {
      suggestions.push('Consider adding accessibilityRole for better screen reader support')
    }
    
    return {
      isCompliant: issues.length === 0,
      issues,
      suggestions
    }
  },

  /**
   * Validate focus management and keyboard navigation
   * @param elements - Array of focusable elements
   * @returns Focus order validation result
   */
  validateFocusOrder: (elements: Array<{
    id: string
    accessible?: boolean
    accessibilityLabel?: string
    focusable?: boolean
  }>): { isCompliant: boolean; issues: string[] } => {
    const issues: string[] = []
    
    elements.forEach((element, index) => {
      // Check if interactive elements are accessible
      if (element.accessible === false && element.focusable !== false) {
        issues.push(`Element ${element.id} at index ${index} is focusable but not accessible`)
      }
      
      // Check for accessibility labels on focusable elements
      if (element.focusable !== false && !element.accessibilityLabel) {
        issues.push(`Focusable element ${element.id} missing accessibility label`)
      }
    })
    
    return {
      isCompliant: issues.length === 0,
      issues
    }
  },

  /**
   * Generate comprehensive accessibility report
   * @param componentName - Name of component being tested
   * @param tests - Array of test results
   * @returns Formatted accessibility report
   */
  generateReport: (componentName: string, tests: Array<{
    testName: string
    passed: boolean
    details?: any
  }>): string => {
    const passedTests = tests.filter(t => t.passed).length
    const totalTests = tests.length
    const complianceRate = Math.round((passedTests / totalTests) * 100)
    
    let report = `\n🧪 Accessibility Report for ${componentName}\n`
    report += `${'='.repeat(50)}\n`
    report += `📊 Compliance Rate: ${complianceRate}% (${passedTests}/${totalTests} tests passed)\n\n`
    
    tests.forEach(test => {
      const status = test.passed ? '✅' : '❌'
      report += `${status} ${test.testName}\n`
      if (test.details && !test.passed) {
        report += `   Details: ${JSON.stringify(test.details, null, 2)}\n`
      }
    })
    
    report += `\n${complianceRate >= 95 ? '🎉' : complianceRate >= 80 ? '⚠️' : '🚨'} `
    report += complianceRate >= 95 
      ? 'Excellent accessibility compliance!' 
      : complianceRate >= 80 
        ? 'Good accessibility, minor improvements needed'
        : 'Significant accessibility improvements required'
    
    return report
  },

  /**
   * Test color palette for WCAG compliance
   * @param palette - Object with color definitions
   * @returns Comprehensive color accessibility report
   */
  testColorPalette: (palette: Record<string, string>): {
    compliantPairs: Array<{ fg: string; bg: string; ratio: number }>
    nonCompliantPairs: Array<{ fg: string; bg: string; ratio: number; required: number }>
    recommendations: string[]
  } => {
    const compliantPairs: Array<{ fg: string; bg: string; ratio: number }> = []
    const nonCompliantPairs: Array<{ fg: string; bg: string; ratio: number; required: number }> = []
    const recommendations: string[] = []
    
    const colors = Object.entries(palette)
    
    // Test common text/background combinations
    const textColors = colors.filter(([name]) => 
      name.includes('text') || name.includes('800') || name.includes('900')
    )
    const backgroundColors = colors.filter(([name]) => 
      name.includes('background') || name.includes('100') || name.includes('200')
    )
    
    textColors.forEach(([fgName, fgColor]) => {
      backgroundColors.forEach(([bgName, bgColor]) => {
        const result = AccessibilityTester.validateContrast(fgColor, bgColor)
        
        if (result.isCompliant) {
          compliantPairs.push({ fg: fgName, bg: bgName, ratio: result.ratio })
        } else {
          nonCompliantPairs.push({ 
            fg: fgName, 
            bg: bgName, 
            ratio: result.ratio, 
            required: result.required 
          })
        }
      })
    })
    
    // Generate recommendations
    if (nonCompliantPairs.length > 0) {
      recommendations.push('Consider darkening text colors or lightening background colors')
      recommendations.push('Test with online contrast checkers for verification')
    }
    
    if (compliantPairs.length === 0) {
      recommendations.push('CRITICAL: No compliant color combinations found')
    }
    
    return { compliantPairs, nonCompliantPairs, recommendations }
  }
}

/**
 * Common color values for quick testing
 */
export const CommonColors = {
  // WCAG AA compliant combinations
  COMPLIANT: {
    'dark-on-light': { fg: '#212121', bg: '#FFFFFF' }, // 16.77:1
    'blue-on-white': { fg: '#1976D2', bg: '#FFFFFF' },  // 4.96:1
    'white-on-blue': { fg: '#FFFFFF', bg: '#1976D2' },  // 4.96:1
  },
  
  // Non-compliant combinations to avoid
  NON_COMPLIANT: {
    'light-gray-on-white': { fg: '#9E9E9E', bg: '#FFFFFF' }, // 2.84:1
    'yellow-on-white': { fg: '#FFEB3B', bg: '#FFFFFF' },     // 1.07:1
  }
}

export default AccessibilityTester