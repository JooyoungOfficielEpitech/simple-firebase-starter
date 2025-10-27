/**
 * Design System - Component Library Index
 *
 * Centralized registry for all design system components.
 * Components are organized by category for easy discovery.
 *
 * Categories:
 * - Core: Foundational components (Button, Text, Icon)
 * - Layout: Structural components (Screen, Card, Container)
 * - Form: Input and form components (TextField, Dropdown, Toggle)
 * - Feedback: Status and notification components (Alert, Badge, Toast)
 * - Navigation: Navigation components (Header, TabBar, BackButton)
 * - Media: Media components (Image, Video, Audio)
 * - Overlay: Modal and overlay components (Modal, Drawer, BottomSheet)
 *
 * Usage:
 * ```tsx
 * import { Button, Text, Icon } from "@/design-system/components"
 * ```
 */

/**
 * CORE COMPONENTS
 * Foundational building blocks of the UI
 */

// Button - Interactive button component
export { default as Button } from "@/components/Button"

// Text - Styled text component with typography presets
export { default as Text } from "@/components/Text"

// Icon - Icon component with SVG support
export { default as Icon } from "@/components/Icon"

/**
 * LAYOUT COMPONENTS
 * Structural components for page layout
 */

// Screen - Full screen container with safe area
export { default as Screen } from "@/components/Screen"

// Card - Card container for content grouping
export { default as Card } from "@/components/Card"

// Header - Page header component
export { default as Header } from "@/components/Header"

// Container - Generic container with consistent spacing
export { ScreenContainer } from "@/components/Layout/ScreenContainer"
export { ScreenHeader } from "@/components/Layout/ScreenHeader"
export { ContentSection } from "@/components/Layout/ContentSection"

/**
 * FORM COMPONENTS
 * Input and form-related components
 */

// TextField - Text input component
export { default as TextField } from "@/components/TextField"

// FormTextField - Form-integrated text field
export { default as FormTextField } from "@/components/FormTextField"

// Toggle - Switch/checkbox/radio toggle components
export { Toggle } from "@/components/Toggle/Toggle"
export { Checkbox } from "@/components/Toggle/Checkbox"
export { Radio } from "@/components/Toggle/Radio"
export { Switch } from "@/components/Toggle/Switch"

// Dropdown - Dropdown selection component
export { default as Dropdown } from "@/components/Dropdown"

// SearchBar - Search input component
export { default as SearchBar } from "@/components/SearchBar"

/**
 * FEEDBACK COMPONENTS
 * Status indicators and user feedback
 */

// Alert Modal - Alert dialog component
export { default as AlertModal } from "@/components/AlertModal"

// Badge - Notification badge component
export { default as NotificationBadge } from "@/components/NotificationBadge"

// Status Badge - Status indicator badge
export { default as StatusBadge } from "@/components/StatusBadge"

// Loading Spinner - Loading indicator
export { default as LoadingSpinner } from "@/components/LoadingSpinner"

// Loading Overlay - Full-screen loading overlay
export { default as LoadingOverlay } from "@/components/LoadingOverlay"

// Empty State - Empty state placeholder
export { default as EmptyState } from "@/components/EmptyState"

// Error State - Error state display
export { default as ErrorState } from "@/components/ErrorState"

// Notification Banner - Toast-style notification
export { default as NotificationBanner } from "@/components/NotificationBanner"

/**
 * NAVIGATION COMPONENTS
 * Navigation and routing components
 */

// Back Button - Navigation back button
export { default as BackButton } from "@/components/BackButton"

// Header Back Button - Header-specific back button
export { default as HeaderBackButton } from "@/components/HeaderBackButton"

// Tab Bar Icon - Tab navigation icon
export { default as TabBarIcon } from "@/components/TabBarIcon"

// Screen Header - Screen-specific header
export { default as ScreenHeader } from "@/components/ScreenHeader"

/**
 * MEDIA COMPONENTS
 * Image, video, and media handling
 */

// Auto Image - Responsive image component
export { default as AutoImage } from "@/components/AutoImage"

// Optimized Image - Performance-optimized image
export { default as OptimizedImage } from "@/components/OptimizedImage"

/**
 * OVERLAY COMPONENTS
 * Modals, drawers, and overlay elements
 */

// Base Modal - Base modal component
export { default as BaseModal } from "@/components/BaseModal"

// Profile Completion Modal - Profile setup modal
export { default as ProfileCompletionModal } from "@/components/ProfileCompletionModal"

/**
 * LIST COMPONENTS
 * List and collection display
 */

// List Item - Generic list item component
export { default as ListItem } from "@/components/ListItem"

// List View - Optimized list view
export { default as ListView } from "@/components/ListView"

// Post Card - Post display card
export { default as PostCard } from "@/components/PostCard"

// Optimized Post Card - Performance-optimized post card
export { default as OptimizedPostCard } from "@/components/OptimizedPostCard"

/**
 * UTILITY COMPONENTS
 * Helper and utility components
 */

// Error Boundary - Error boundary wrapper
export { default as ErrorBoundary } from "@/components/ErrorBoundary"

// Keyboard Aware View - Keyboard-aware container
export { default as KeyboardAwareView } from "@/components/KeyboardAwareView"

// Permission Gate - Permission-based access control
export { default as PermissionGate } from "@/components/PermissionGate"

// Permission Message - Permission denied message
export { default as PermissionMessage } from "@/components/PermissionMessage"

// Debug Info - Debug information display (dev only)
export { default as DebugInfo } from "@/components/DebugInfo"

// Dev Floating Button - Development floating action button
export { default as DevFloatingButton } from "@/components/DevFloatingButton"

/**
 * SPECIALIZED COMPONENTS
 * Domain-specific components
 */

// Audio Player - Audio playback component
export { default as AudioPlayer } from "@/components/AudioPlayer"

// Music Player - Music player component
export { default as MusicPlayer } from "@/components/MusicPlayer"

// Song List - Song list display
export { default as SongList } from "@/components/SongList"

// Song List Item - Song list item component
export { default as SongListItem } from "@/components/SongListItem"

// Saved Sections List - Saved audio sections list
export { default as SavedSectionsList } from "@/components/SavedSectionsList"

// Lyrics Display - Lyrics display component
export { default as LyricsDisplay } from "@/components/LyricsDisplay"

// Google Sign In Button - Google authentication button
export { default as GoogleSignInButton } from "@/components/GoogleSignInButton"

/**
 * Component Library Documentation
 *
 * ORGANIZATION PRINCIPLES:
 * 1. Category-based organization for easy discovery
 * 2. Consistent naming conventions (PascalCase)
 * 3. Clear export structure with JSDoc comments
 * 4. Type-safe imports with TypeScript
 *
 * USAGE PATTERNS:
 *
 * 1. Import specific components:
 * ```tsx
 * import { Button, Text } from "@/design-system/components"
 * ```
 *
 * 2. Import from category:
 * ```tsx
 * import { TextField, Dropdown } from "@/design-system/components"
 * ```
 *
 * 3. Tree-shakable imports:
 * ```tsx
 * import { Button } from "@/design-system/components"
 * // Only Button code is included in bundle
 * ```
 *
 * COMPONENT STANDARDS:
 * - All components support theming via useAppTheme()
 * - Accessibility props included by default
 * - Performance optimized with React.memo
 * - TypeScript types for all props
 * - Consistent API patterns across components
 *
 * ADDING NEW COMPONENTS:
 * 1. Create component file in appropriate category
 * 2. Add export to this index file
 * 3. Update component documentation
 * 4. Add component to Storybook (when available)
 * 5. Write unit tests for component
 *
 * DEPRECATION POLICY:
 * - Mark deprecated components with @deprecated tag
 * - Provide migration path in JSDoc
 * - Remove after 2 major versions
 *
 * VERSIONING:
 * - Follow semantic versioning (MAJOR.MINOR.PATCH)
 * - Document breaking changes in CHANGELOG
 * - Maintain backward compatibility when possible
 */
