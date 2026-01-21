# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-20

### Added

#### Core Features
- Firebase Authentication with Email/Password and Google Sign-In
- Firebase Firestore integration with offline support
- Firebase Storage for image uploads with compression
- Firebase Cloud Messaging for push notifications
- Firebase Analytics for usage tracking

#### App Features
- Real-time chat system with typing indicators and read receipts
- Push notification service with local and remote notifications
- Image upload with camera/gallery picker and compression
- Offline support with automatic sync
- Payment template (Subscription & IAP ready)
- Theming system with light/dark mode
- i18n support for 7 languages (EN, KO, JA, ES, FR, AR, HI)

#### Components (66+)
- **UI Components**: Badge, Button, Card, Chip, Icon, Text, Avatar, Tabs, Tooltip, Rating
- **Form Components**: TextField, FormTextField, Toggle, Checkbox, Radio, Switch, Select, Slider, DatePicker, TimePicker, ColorPicker, SearchBar
- **Layout Components**: Screen, Header, ListItem, ListView, Grid, Container, Divider, Spacer, Accordion
- **Feedback Components**: Toast, Snackbar, AlertDialog, ConfirmDialog, LoadingOverlay, ProgressBar, Skeleton, BottomSheet, EmptyState
- **Media Components**: AutoImage, ImageGallery, ImagePickerButton, ImageUploadProgress, CodeBlock
- **Chat Components**: ChatListItem, MessageBubble, MessageInput, TypingIndicator, DateSeparator, MessageImage
- **Network Components**: OfflineBanner, SyncIndicator, NetworkStatusIcon
- **Payment Components**: PricingCard, PaymentSuccessModal

#### Screens
- Main screens: Home, Settings, Profile Edit, Sign In, Sign Up, Forgot Password, Chat List, Chat Room, Notifications, Subscription
- 7 Component Showcase screens: Button, Card, Text, Toggle, Form, Layout, Feedback
- 8 Feature Showcase screens: Auth, Notifications, Offline, Chat, Theme, i18n, Error Handling, Network

#### Services
- `authService` - Firebase Authentication
- `userService` - User data management
- `chatService` - Real-time chat
- `notificationService` - Push notifications
- `imageService` - Image upload/compression
- `networkService` - Network monitoring
- `paymentService` - Payment processing template

#### Developer Experience
- 5 Code Generators: Screen, Component, Service, Cloud Function, i18n
- TypeScript with full type safety
- ESLint + Prettier configuration
- Jest + Testing Library setup (15+ test files)
- Maestro E2E testing (5 test flows)
- CI/CD with GitHub Actions (5 workflows)

#### Documentation
- Architecture guide (docs/ARCHITECTURE.md)
- Components reference (docs/COMPONENTS.md)
- Generators guide (docs/GENERATORS.md)
- Firebase setup guides (iOS APNs, Android FCM, Storage Rules)

#### Firebase Cloud Functions
- `sendNotification` - Send push notifications
- `chatNotifications` - Chat message notification triggers
- `matchNotifications` - Match-related notification triggers

### Technical Details
- React Native 0.79.5
- Expo 53.0.20
- TypeScript 5.8.3
- Firebase SDK 22.4.0
- React Navigation 7
- React Hook Form + Zod
- Reanimated 3

---

## [0.1.0] - 2026-01-15

### Added
- Initial project setup
- Basic Firebase Authentication
- Simple navigation structure
- Basic theme system
