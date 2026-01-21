# React Native Firebase Boilerplate

Production-ready React Native + Expo boilerplate with Firebase integration, featuring 66+ UI components, real-time chat, push notifications, offline support, and more.

## 🚀 Features

### Core Features
- ✅ **Firebase Authentication** - Email/Password, Google Sign-In
- ✅ **Firebase Firestore** - Real-time database with offline support
- ✅ **Firebase Storage** - Image upload with compression
- ✅ **Firebase Cloud Messaging** - Push notifications
- ✅ **Firebase Analytics** - Usage tracking

### App Features
- ✅ **Real-time Chat** - 1:1 messaging with typing indicators
- ✅ **Push Notifications** - Remote & local notifications
- ✅ **Image Upload** - Camera/gallery picker with compression
- ✅ **Offline Support** - Automatic sync when back online
- ✅ **Payment Template** - Subscription & IAP ready
- ✅ **Theming** - Light/Dark mode with custom themes
- ✅ **i18n** - 7 languages (EN, KO, JA, ES, FR, AR, HI)

### Developer Experience
- ✅ **66+ UI Components** - Full component library
- ✅ **5 Code Generators** - Screen, Component, Service, Function, i18n
- ✅ **TypeScript** - Full type safety
- ✅ **ESLint + Prettier** - Code quality
- ✅ **Jest + Testing Library** - Unit testing
- ✅ **Maestro** - E2E testing
- ✅ **CI/CD** - GitHub Actions workflows

## 📱 Screens

### Main Screens
- Home, Settings, Profile Edit
- Sign In, Sign Up, Forgot Password
- Chat List, Chat Room
- Notifications, Subscription

### Showcase Screens
- **7 Component Showcases** - Button, Card, Text, Toggle, Form, Layout, Feedback
- **8 Feature Showcases** - Auth, Notifications, Offline, Chat, Theme, i18n, Error Handling, Network

## 🧩 Components (66+)

### UI Components
Badge, Button, Card, Chip, Icon, Text, Avatar, Tabs, Tooltip, Rating

### Form Components
TextField, FormTextField, Toggle, Checkbox, Radio, Switch, Select, Slider, DatePicker, TimePicker, ColorPicker, SearchBar

### Layout Components
Screen, Header, ListItem, ListView, Grid, Container, Divider, Spacer, Accordion

### Feedback Components
Toast, Snackbar, AlertDialog, ConfirmDialog, LoadingOverlay, ProgressBar, Skeleton, BottomSheet, EmptyState

### Media Components
AutoImage, ImageGallery, ImagePickerButton, ImageUploadProgress, CodeBlock

### Chat Components
ChatListItem, MessageBubble, MessageInput, TypingIndicator, DateSeparator, MessageImage

### Network Components
OfflineBanner, SyncIndicator, NetworkStatusIcon

### Payment Components
PricingCard, PaymentSuccessModal

## 🛠 Setup

### Prerequisites
- Node.js >= 20.0.0
- Yarn
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fast-matching

# Install dependencies
yarn install

# iOS setup
cd ios && pod install && cd ..
```

### Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, Storage, and Cloud Messaging
3. Download configuration files:
   - `google-services.json` → `android/app/`
   - `GoogleService-Info.plist` → `ios/`
4. Set environment variables in `.env`:
   ```
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
   ```

### Running the App

```bash
# Start Metro bundler
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android
```

## 📁 Project Structure

```
app/
├── components/           # 66+ UI components
│   ├── chat/            # Chat-specific components
│   └── payment/         # Payment components
├── context/             # React Context providers
├── i18n/                # Translations (7 languages)
├── navigators/          # React Navigation setup
├── screens/             # Screen components
│   ├── components/      # Component showcase screens
│   └── features/        # Feature showcase screens
├── services/            # Business logic services
│   ├── chat/           # Chat service
│   ├── firestore/      # Firestore service
│   ├── network/        # Network monitoring
│   ├── notifications/  # Push notifications
│   ├── payment/        # Payment service
│   └── storage/        # Image storage
├── theme/               # Theming system
├── types/               # TypeScript types
└── utils/               # Utility functions

functions/               # Firebase Cloud Functions
scripts/                 # Build & generator scripts
.maestro/               # E2E test flows
.github/workflows/      # CI/CD pipelines
docs/                   # Documentation
```

## 🔧 Scripts

### Development
```bash
yarn start              # Start Expo dev server
yarn ios                # Run on iOS
yarn android            # Run on Android
yarn lint               # Run ESLint
yarn compile            # TypeScript check
```

### Testing
```bash
yarn test               # Run unit tests
yarn test:watch         # Watch mode
yarn test:e2e           # Run Maestro E2E tests
yarn test:e2e:auth      # Run auth flow test
```

### Code Generation
```bash
yarn generate                           # Interactive generator
yarn generate:screen MyScreen           # Generate screen
yarn generate:component MyComponent     # Generate component
yarn generate:service myService         # Generate service
yarn generate:function myFunction       # Generate Cloud Function
yarn generate:i18n namespace key "value" # Add i18n key
```

### Build & Analysis
```bash
yarn build:ios:sim       # Build iOS for simulator
yarn build:android:sim   # Build Android for emulator
yarn analyze:bundle      # Analyze bundle size
yarn analyze:startup     # Check startup optimization
```

## 📚 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [Components Reference](docs/COMPONENTS.md)
- [Generators Guide](docs/GENERATORS.md)
- [iOS APNs Setup](docs/setup/ios-apns-setup.md)
- [Android FCM Setup](docs/setup/android-fcm-setup.md)
- [Firebase Storage Rules](docs/setup/firebase-storage-rules.md)

## 🧪 Testing

### Unit Tests (Jest)
- 15+ test files covering components and services
- Run with `yarn test`

### E2E Tests (Maestro)
- 5 test flows: auth, navigation, components, chat, offline
- Run with `yarn test:e2e`

## 🔄 CI/CD

### GitHub Actions Workflows
- **ci.yml** - Lint, typecheck, and test on push
- **pr-check.yml** - PR validation
- **release.yml** - Production build
- **functions.yml** - Cloud Functions deployment
- **e2e.yml** - Maestro E2E tests

## 📦 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native 0.79.5, Expo 53 |
| Language | TypeScript 5.8 |
| Backend | Firebase (Auth, Firestore, Storage, FCM) |
| Navigation | React Navigation 7 |
| State | React Context |
| Forms | React Hook Form + Zod |
| Styling | Themed StyleSheet |
| Animation | Reanimated 3 |
| Testing | Jest, Testing Library, Maestro |

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
