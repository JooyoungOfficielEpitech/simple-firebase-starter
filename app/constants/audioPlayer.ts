// Audio Player Constants

// Storage
export const SAVED_SECTIONS_KEY = "audio_player_saved_sections"

// Player Configuration
export const TRACKPLAYER_SETUP_DELAY = 1000 // ms
export const TRACKPLAYER_TRACK_ID = 'audioplayerTrack'

// Time and Position
export const INITIAL_POINT_A = 0 // seconds
export const TIME_FORMAT_FALLBACK = "0:00"
export const MILLISECONDS_TO_SECONDS = 1000
export const SECONDS_TO_MILLISECONDS = 1000

// A-B Loop Timing
export const AB_LOOP_CHECK_INTERVAL = 500 // ms
export const JUMP_TIMEOUT = 500 // ms
export const SEEK_DEBOUNCE_DELAY = 300 // ms

// UI Interaction
export const MARKER_TOLERANCE = 30 // px
export const PROGRESS_BAR_DEFAULT_WIDTH = 200 // px
export const PULSE_ANIMATION_DURATION = 800 // ms
export const MODAL_ANIMATION_DELAY = 500 // ms

// Button and UI Sizing
export const BUTTON_SIZE = 32
export const PLAY_BUTTON_SIZE = 64
export const PLAY_BUTTON_RADIUS = 32
export const MARKER_SIZE = 28
export const MARKER_RADIUS = 14

// Progress Bar
export const PROGRESS_BAR_HEIGHT = 8
export const PROGRESS_BAR_RADIUS = 4
export const PROGRESS_BAR_MIN_WIDTH = 8

// Modal and Input
export const SECTION_NAME_MAX_LENGTH = 50
export const PRESS_OUT_DELAY = 100 // ms

// Animation
export const PULSE_SCALE_TO = 1.2
export const PULSE_SCALE_FROM = 1
export const ANIMATION_RESET_DURATION = 200 // ms

// Audio Quality and Performance
export const TRACK_PLAYER_WAIT_FOR_BUFFER = true
export const SHADOW_OPACITY = 0.2
export const SHADOW_RADIUS = 4
export const ELEVATION = 4

// Colors (as fallbacks when theme is unavailable)
export const FALLBACK_COLORS = {
  PRIMARY_BLUE: "#007AFF",
  ERROR_RED: "#FF3B30",
  NEUTRAL_GRAY: "#666",
  TRANSPARENT_BLACK: "rgba(0, 0, 0, 0.5)",
} as const

// Validation
export const MIN_SECTION_DURATION = 0.1 // seconds
export const MAX_AUDIO_DURATION = 7200 // 2 hours in seconds

// Performance Thresholds
export const LARGE_AUDIO_FILE_SIZE = 100 * 1024 * 1024 // 100MB
export const MAX_CONSOLE_LOGS_IN_PRODUCTION = 0