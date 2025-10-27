# E2E Testing Guide

This directory contains end-to-end (E2E) tests for the application. E2E tests verify that the entire application workflow functions correctly from the user's perspective.

## Testing Framework Options

This project supports multiple E2E testing frameworks:

### 1. Detox (Recommended for React Native)
- **Setup**: `npm install -D detox detox-cli`
- **Configuration**: See `.detoxrc.json`
- **Best for**: Native iOS/Android testing with React Native

### 2. Maestro (Currently Configured)
- **Setup**: Install Maestro CLI from [maestro.mobile.dev](https://maestro.mobile.dev)
- **Configuration**: See `.maestro/` directory
- **Run tests**: `npm run test:maestro`
- **Best for**: Cross-platform mobile testing with simple YAML syntax

### 3. Appium
- **Setup**: `npm install -D appium webdriverio`
- **Best for**: Cross-platform testing with WebDriver protocol

## Getting Started

### Prerequisites
- Development build of the app (iOS simulator or Android emulator)
- Testing framework installed (Detox or Maestro)

### Running Tests

#### Maestro Tests
```bash
# Run all Maestro tests
npm run test:maestro

# Run specific flow
maestro test .maestro/flows/login.yaml
```

#### Detox Tests (if configured)
```bash
# Build the app for testing
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug
```

## Test Structure

```
e2e/
├── README.md                 # This file
├── examples/                 # Example E2E tests
│   ├── auth.e2e.ts          # Authentication flow tests
│   ├── navigation.e2e.ts    # Navigation tests
│   └── posting.e2e.ts       # Post creation tests
├── helpers/                  # Test helper functions
│   ├── setup.ts             # Test setup and teardown
│   └── utils.ts             # Common test utilities
└── config/                   # E2E test configuration
    └── detox.config.js      # Detox configuration
```

## Writing E2E Tests

### Test Principles
1. **User-Centric**: Test from the user's perspective
2. **Independent**: Each test should be able to run independently
3. **Repeatable**: Tests should produce consistent results
4. **Fast**: Optimize for execution speed
5. **Maintainable**: Use page objects and helper functions

### Example Test Pattern

```typescript
describe('Authentication Flow', () => {
  beforeAll(async () => {
    // Setup: Launch app, clear data
    await device.launchApp({ newInstance: true })
  })

  afterAll(async () => {
    // Teardown: Clean up test data
    await cleanup()
  })

  it('should login successfully with valid credentials', async () => {
    // Arrange: Navigate to login screen
    await element(by.id('login-button')).tap()

    // Act: Enter credentials and submit
    await element(by.id('email-input')).typeText('test@example.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('submit-button')).tap()

    // Assert: Verify successful login
    await expect(element(by.id('home-screen'))).toBeVisible()
  })
})
```

## Best Practices

### Test Data Management
- Use dedicated test accounts
- Clean up test data after each test
- Avoid hardcoding sensitive data
- Use environment variables for configuration

### Test Organization
- Group related tests in describe blocks
- Use meaningful test descriptions
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and atomic

### Stability
- Use reliable selectors (testID preferred)
- Add appropriate waits for async operations
- Handle flaky tests with retry logic
- Test on multiple devices/screen sizes

### Debugging
- Use screenshots for failed tests
- Enable detailed logging
- Run tests in visible mode during development
- Use breakpoints and step-through debugging

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Build app
        run: detox build --configuration ios.sim.release
      - name: Run tests
        run: detox test --configuration ios.sim.release
```

## Troubleshooting

### Common Issues

**App won't launch**
- Ensure development build is installed
- Check simulator/emulator is running
- Verify app bundle identifier matches configuration

**Elements not found**
- Check testID is correctly set in components
- Verify element is visible and enabled
- Add explicit waits for async operations

**Flaky tests**
- Increase timeout values
- Add synchronization points
- Check for race conditions
- Use waitFor helpers

**Performance issues**
- Optimize test data setup
- Run tests in parallel when possible
- Use faster simulators/emulators
- Profile and optimize slow tests

## Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Maestro Documentation](https://maestro.mobile.dev)
- [React Native Testing Best Practices](https://github.com/react-native-community/discussions-and-proposals/issues/179)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
