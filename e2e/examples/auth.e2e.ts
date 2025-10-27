/**
 * Authentication Flow E2E Tests
 *
 * Tests the complete authentication user flows including:
 * - Login with email/password
 * - Signup with email/password
 * - Google Sign-In
 * - Password reset
 * - Logout
 */

// Note: This is an example for Detox framework
// Adjust imports and syntax based on your chosen E2E framework

describe('Authentication Flow', () => {
  beforeAll(async () => {
    // Launch app with clean state
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    })
  })

  beforeEach(async () => {
    // Reset app state before each test
    await device.reloadReactNative()
  })

  afterAll(async () => {
    // Cleanup: Remove test user data
    // This should be implemented based on your backend setup
  })

  describe('Login Flow', () => {
    it('should display login screen on app launch', async () => {
      // Verify login screen elements are visible
      await expect(element(by.id('email-input'))).toBeVisible()
      await expect(element(by.id('password-input'))).toBeVisible()
      await expect(element(by.id('login-button'))).toBeVisible()
      await expect(element(by.id('signup-link'))).toBeVisible()
    })

    it('should show validation errors for empty fields', async () => {
      // Attempt to login with empty fields
      await element(by.id('login-button')).tap()

      // Verify error messages
      await expect(element(by.text('이메일을 입력해주세요'))).toBeVisible()
      await expect(element(by.text('비밀번호를 입력해주세요'))).toBeVisible()
    })

    it('should show error for invalid email format', async () => {
      // Enter invalid email
      await element(by.id('email-input')).typeText('invalid-email')
      await element(by.id('password-input')).typeText('password123')
      await element(by.id('login-button')).tap()

      // Verify email format error
      await expect(element(by.text('올바른 이메일 형식이 아닙니다'))).toBeVisible()
    })

    it('should login successfully with valid credentials', async () => {
      // Enter valid credentials
      await element(by.id('email-input')).typeText('test@example.com')
      await element(by.id('password-input')).typeText('TestPassword123!')

      // Tap login button
      await element(by.id('login-button')).tap()

      // Wait for home screen to appear
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000)

      // Verify user is logged in
      await expect(element(by.id('home-screen'))).toBeVisible()
      await expect(element(by.id('user-profile-button'))).toBeVisible()
    })

    it('should show error for incorrect credentials', async () => {
      // Enter invalid credentials
      await element(by.id('email-input')).typeText('test@example.com')
      await element(by.id('password-input')).typeText('WrongPassword123!')
      await element(by.id('login-button')).tap()

      // Verify error message
      await expect(element(by.text('이메일 또는 비밀번호가 잘못되었습니다'))).toBeVisible()
    })

    it('should toggle password visibility', async () => {
      // Enter password
      await element(by.id('password-input')).typeText('TestPassword123!')

      // Initially password should be hidden
      await expect(element(by.id('password-hidden-icon'))).toBeVisible()

      // Toggle visibility
      await element(by.id('password-visibility-toggle')).tap()

      // Password should now be visible
      await expect(element(by.id('password-visible-icon'))).toBeVisible()
    })
  })

  describe('Signup Flow', () => {
    it('should navigate to signup screen', async () => {
      // Tap signup link
      await element(by.id('signup-link')).tap()

      // Verify signup screen is displayed
      await expect(element(by.id('signup-screen'))).toBeVisible()
      await expect(element(by.id('email-input'))).toBeVisible()
      await expect(element(by.id('password-input'))).toBeVisible()
      await expect(element(by.id('password-confirm-input'))).toBeVisible()
      await expect(element(by.id('signup-button'))).toBeVisible()
    })

    it('should validate password confirmation match', async () => {
      await element(by.id('signup-link')).tap()

      // Enter mismatched passwords
      await element(by.id('email-input')).typeText('newuser@example.com')
      await element(by.id('password-input')).typeText('TestPassword123!')
      await element(by.id('password-confirm-input')).typeText('DifferentPassword123!')
      await element(by.id('signup-button')).tap()

      // Verify error message
      await expect(element(by.text('비밀번호가 일치하지 않습니다'))).toBeVisible()
    })

    it('should create account successfully with valid data', async () => {
      await element(by.id('signup-link')).tap()

      // Generate unique email for test
      const timestamp = Date.now()
      const testEmail = `test${timestamp}@example.com`

      // Enter valid signup data
      await element(by.id('email-input')).typeText(testEmail)
      await element(by.id('password-input')).typeText('TestPassword123!')
      await element(by.id('password-confirm-input')).typeText('TestPassword123!')
      await element(by.id('signup-button')).tap()

      // Wait for profile completion or home screen
      await waitFor(element(by.id('profile-setup-screen')))
        .toBeVisible()
        .withTimeout(5000)

      // Verify account creation
      await expect(element(by.id('profile-setup-screen'))).toBeVisible()
    })

    it('should show error for existing email', async () => {
      await element(by.id('signup-link')).tap()

      // Try to create account with existing email
      await element(by.id('email-input')).typeText('test@example.com')
      await element(by.id('password-input')).typeText('TestPassword123!')
      await element(by.id('password-confirm-input')).typeText('TestPassword123!')
      await element(by.id('signup-button')).tap()

      // Verify error message
      await expect(element(by.text('이미 사용 중인 이메일입니다'))).toBeVisible()
    })
  })

  describe('Google Sign-In', () => {
    it('should display Google Sign-In button', async () => {
      await expect(element(by.id('google-signin-button'))).toBeVisible()
    })

    // Note: Actual Google Sign-In testing requires special setup
    // and is often mocked in E2E tests
    it('should initiate Google Sign-In flow', async () => {
      await element(by.id('google-signin-button')).tap()

      // Verify Google Sign-In dialog or loading state
      await waitFor(element(by.id('google-signin-webview')))
        .toBeVisible()
        .withTimeout(3000)
    })
  })

  describe('Password Reset', () => {
    it('should navigate to password reset screen', async () => {
      await element(by.id('forgot-password-link')).tap()

      // Verify password reset screen
      await expect(element(by.id('password-reset-screen'))).toBeVisible()
      await expect(element(by.id('email-input'))).toBeVisible()
      await expect(element(by.id('send-reset-link-button'))).toBeVisible()
    })

    it('should send password reset email', async () => {
      await element(by.id('forgot-password-link')).tap()

      // Enter email
      await element(by.id('email-input')).typeText('test@example.com')
      await element(by.id('send-reset-link-button')).tap()

      // Verify success message
      await waitFor(element(by.text('비밀번호 재설정 이메일을 전송했습니다')))
        .toBeVisible()
        .withTimeout(3000)
    })

    it('should show error for non-existent email', async () => {
      await element(by.id('forgot-password-link')).tap()

      // Enter non-existent email
      await element(by.id('email-input')).typeText('nonexistent@example.com')
      await element(by.id('send-reset-link-button')).tap()

      // Verify error message
      await expect(element(by.text('등록되지 않은 이메일입니다'))).toBeVisible()
    })
  })

  describe('Logout Flow', () => {
    beforeEach(async () => {
      // Login before each logout test
      await element(by.id('email-input')).typeText('test@example.com')
      await element(by.id('password-input')).typeText('TestPassword123!')
      await element(by.id('login-button')).tap()

      // Wait for home screen
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000)
    })

    it('should logout successfully', async () => {
      // Navigate to settings
      await element(by.id('settings-tab')).tap()

      // Tap logout button
      await element(by.id('logout-button')).tap()

      // Confirm logout in dialog
      await element(by.text('로그아웃')).tap()

      // Verify user is logged out and on login screen
      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(3000)

      await expect(element(by.id('login-screen'))).toBeVisible()
    })

    it('should clear user data on logout', async () => {
      // Navigate to settings and logout
      await element(by.id('settings-tab')).tap()
      await element(by.id('logout-button')).tap()
      await element(by.text('로그아웃')).tap()

      // Wait for login screen
      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(3000)

      // Verify login fields are empty
      await expect(element(by.id('email-input'))).toHaveText('')
      await expect(element(by.id('password-input'))).toHaveText('')
    })
  })

  describe('Session Persistence', () => {
    it('should maintain session after app restart', async () => {
      // Login
      await element(by.id('email-input')).typeText('test@example.com')
      await element(by.id('password-input')).typeText('TestPassword123!')
      await element(by.id('login-button')).tap()

      // Wait for home screen
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000)

      // Restart app
      await device.launchApp({ newInstance: true })

      // User should still be logged in
      await expect(element(by.id('home-screen'))).toBeVisible()
    })
  })
})
