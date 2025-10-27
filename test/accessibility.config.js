/**
 * Accessibility Testing Configuration
 *
 * Configuration for automated accessibility testing using various tools:
 * - React Native Testing Library accessibility matchers
 * - Custom accessibility rules and validators
 * - WCAG 2.1 compliance checks
 */

module.exports = {
  /**
   * Accessibility Test Levels
   * - A: Basic accessibility (must pass)
   * - AA: Enhanced accessibility (recommended)
   * - AAA: Advanced accessibility (best practice)
   */
  wcagLevel: 'AA',

  /**
   * Test Categories
   */
  categories: {
    // Perceivable: Information must be presentable to users in ways they can perceive
    perceivable: {
      enabled: true,
      rules: [
        'text-alternatives',      // Alt text for images
        'adaptable',              // Content structure and relationships
        'distinguishable',        // Sufficient color contrast
        'time-based-media',       // Alternatives for audio/video
      ]
    },

    // Operable: User interface components must be operable
    operable: {
      enabled: true,
      rules: [
        'keyboard-accessible',    // All functionality via keyboard
        'enough-time',            // Sufficient time to interact
        'seizures',               // No flashing content
        'navigable',              // Navigation and wayfinding
        'input-modalities',       // Various input methods
      ]
    },

    // Understandable: Information and operation must be understandable
    understandable: {
      enabled: true,
      rules: [
        'readable',               // Text readability
        'predictable',            // Predictable behavior
        'input-assistance',       // Error prevention and correction
      ]
    },

    // Robust: Content must be robust enough for assistive technologies
    robust: {
      enabled: true,
      rules: [
        'compatible',             // Assistive technology compatibility
        'parsing',                // Proper markup
      ]
    },
  },

  /**
   * Component-Specific Rules
   */
  componentRules: {
    Button: {
      requiredProps: ['accessibilityLabel', 'accessibilityRole'],
      accessibilityRole: 'button',
      mustBeOperable: true,
      minimumTouchTarget: { width: 44, height: 44 }, // iOS minimum
    },

    Text: {
      requiredProps: ['accessibilityLabel'],
      accessibilityRole: 'text',
      minimumFontSize: 12,
      minimumContrast: 4.5, // WCAG AA for normal text
    },

    Icon: {
      requiredProps: ['accessibilityLabel', 'accessibilityRole'],
      accessibilityRole: 'image',
      mustHaveAlternative: true,
    },

    TextField: {
      requiredProps: ['accessibilityLabel', 'accessibilityHint'],
      accessibilityRole: 'none', // React Native handles this
      mustHaveLabel: true,
      errorHandling: true,
    },

    Modal: {
      requiredProps: ['accessibilityViewIsModal'],
      accessibilityViewIsModal: true,
      trapFocus: true,
      announceOpening: true,
    },
  },

  /**
   * Color Contrast Requirements (WCAG AA)
   */
  colorContrast: {
    normalText: {
      minimum: 4.5,     // WCAG AA
      enhanced: 7.0,    // WCAG AAA
    },
    largeText: {
      minimum: 3.0,     // WCAG AA (18pt+)
      enhanced: 4.5,    // WCAG AAA
    },
    uiComponents: {
      minimum: 3.0,     // WCAG AA for UI elements
    },
  },

  /**
   * Touch Target Sizes
   */
  touchTargets: {
    minimum: {
      width: 44,
      height: 44,
    },
    recommended: {
      width: 48,
      height: 48,
    },
    spacing: 8, // Minimum spacing between targets
  },

  /**
   * Screen Reader Support
   */
  screenReader: {
    enabled: true,
    announcements: {
      navigation: true,
      stateChanges: true,
      errors: true,
      loading: true,
    },
    grouping: true,
    ordering: true,
  },

  /**
   * Focus Management
   */
  focusManagement: {
    enabled: true,
    visibleIndicator: true,
    logicalOrder: true,
    trapInModals: true,
    restoreOnDismiss: true,
  },

  /**
   * Animation and Motion
   */
  animation: {
    respectReduceMotion: true,
    maxDuration: 500, // milliseconds
    providesAlternative: true,
  },

  /**
   * Form Accessibility
   */
  forms: {
    requireLabels: true,
    requireHints: true,
    errorIdentification: true,
    errorSuggestions: true,
    confirmationForDestructive: true,
  },

  /**
   * Custom Test Matchers
   */
  customMatchers: {
    // Check if element has minimum touch target size
    toHaveMinimumTouchTarget: (element) => {
      const { width, height } = element.props.style || {}
      const minWidth = 44
      const minHeight = 44

      return {
        pass: width >= minWidth && height >= minHeight,
        message: () =>
          `Expected element to have minimum touch target of ${minWidth}x${minHeight}, but got ${width}x${height}`,
      }
    },

    // Check if text has sufficient contrast
    toHaveSufficientContrast: (element, backgroundColor) => {
      const textColor = element.props.style?.color
      const contrast = calculateContrastRatio(textColor, backgroundColor)
      const minimumContrast = 4.5

      return {
        pass: contrast >= minimumContrast,
        message: () =>
          `Expected contrast ratio to be at least ${minimumContrast}, but got ${contrast.toFixed(2)}`,
      }
    },

    // Check if element has accessibility label
    toHaveAccessibilityLabel: (element) => {
      const hasLabel = !!element.props.accessibilityLabel

      return {
        pass: hasLabel,
        message: () =>
          `Expected element to have accessibilityLabel, but it was ${element.props.accessibilityLabel}`,
      }
    },

    // Check if element has proper accessibility role
    toHaveAccessibilityRole: (element, expectedRole) => {
      const actualRole = element.props.accessibilityRole

      return {
        pass: actualRole === expectedRole,
        message: () =>
          `Expected accessibilityRole to be "${expectedRole}", but got "${actualRole}"`,
      }
    },

    // Check if element is keyboard accessible
    toBeKeyboardAccessible: (element) => {
      const hasOnPress = !!element.props.onPress
      const isFocusable = element.props.accessible !== false

      return {
        pass: hasOnPress && isFocusable,
        message: () =>
          `Expected element to be keyboard accessible (have onPress and be focusable)`,
      }
    },
  },

  /**
   * Ignore Rules (use sparingly and document why)
   */
  ignoreRules: [
    // Example: 'color-contrast' for decorative elements
  ],

  /**
   * Test Reports
   */
  reports: {
    enabled: true,
    format: 'json',
    outputDir: './test-reports/accessibility',
    includeScreenshots: true,
    verbose: true,
  },

  /**
   * Integration with CI/CD
   */
  ci: {
    failOnError: true,
    failOnWarning: false,
    generateBadge: true,
  },
}

/**
 * Helper function to calculate color contrast ratio
 * Based on WCAG 2.1 formula
 */
function calculateContrastRatio(color1, color2) {
  const luminance1 = getRelativeLuminance(color1)
  const luminance2 = getRelativeLuminance(color2)

  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(color) {
  // Convert hex to RGB
  const rgb = hexToRgb(color)
  if (!rgb) return 0

  // Convert RGB to relative luminance
  const rsRGB = rgb.r / 255
  const gsRGB = rgb.g / 255
  const bsRGB = rgb.b / 255

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex) {
  if (!hex) return null

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}
