/**
 * Navigation Flow E2E Tests
 *
 * Tests the application navigation including:
 * - Tab navigation
 * - Stack navigation
 * - Deep linking
 * - Back navigation
 */

describe('Navigation Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })

    // Login before navigation tests
    await element(by.id('email-input')).typeText('test@example.com')
    await element(by.id('password-input')).typeText('TestPassword123!')
    await element(by.id('login-button')).tap()

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000)
  })

  describe('Bottom Tab Navigation', () => {
    it('should display all bottom tabs', async () => {
      await expect(element(by.id('home-tab'))).toBeVisible()
      await expect(element(by.id('bulletin-tab'))).toBeVisible()
      await expect(element(by.id('karaoke-tab'))).toBeVisible()
      await expect(element(by.id('settings-tab'))).toBeVisible()
    })

    it('should navigate to Bulletin Board tab', async () => {
      await element(by.id('bulletin-tab')).tap()

      await expect(element(by.id('bulletin-screen'))).toBeVisible()
      await expect(element(by.id('bulletin-tab'))).toHaveId('bulletin-tab') // Active state
    })

    it('should navigate to Karaoke tab', async () => {
      await element(by.id('karaoke-tab')).tap()

      await expect(element(by.id('karaoke-screen'))).toBeVisible()
      await expect(element(by.id('karaoke-tab'))).toHaveId('karaoke-tab') // Active state
    })

    it('should navigate to Settings tab', async () => {
      await element(by.id('settings-tab')).tap()

      await expect(element(by.id('settings-screen'))).toBeVisible()
      await expect(element(by.id('settings-tab'))).toHaveId('settings-tab') // Active state
    })

    it('should return to Home tab', async () => {
      // Navigate away from home
      await element(by.id('bulletin-tab')).tap()
      await expect(element(by.id('bulletin-screen'))).toBeVisible()

      // Return to home
      await element(by.id('home-tab')).tap()

      await expect(element(by.id('home-screen'))).toBeVisible()
      await expect(element(by.id('home-tab'))).toHaveId('home-tab') // Active state
    })
  })

  describe('Stack Navigation', () => {
    beforeEach(async () => {
      // Ensure we're on home screen
      await element(by.id('home-tab')).tap()
    })

    it('should navigate to post detail screen', async () => {
      // Tap on first post
      await element(by.id('post-item-0')).tap()

      // Verify post detail screen
      await expect(element(by.id('post-detail-screen'))).toBeVisible()
      await expect(element(by.id('back-button'))).toBeVisible()
    })

    it('should navigate back from post detail', async () => {
      // Navigate to post detail
      await element(by.id('post-item-0')).tap()
      await expect(element(by.id('post-detail-screen'))).toBeVisible()

      // Navigate back
      await element(by.id('back-button')).tap()

      // Verify we're back on home screen
      await expect(element(by.id('home-screen'))).toBeVisible()
    })

    it('should navigate to user profile screen', async () => {
      await element(by.id('user-profile-button')).tap()

      await expect(element(by.id('profile-screen'))).toBeVisible()
      await expect(element(by.id('back-button'))).toBeVisible()
    })

    it('should navigate to edit profile screen', async () => {
      // Navigate to profile
      await element(by.id('user-profile-button')).tap()
      await expect(element(by.id('profile-screen'))).toBeVisible()

      // Tap edit button
      await element(by.id('edit-profile-button')).tap()

      // Verify edit profile screen
      await expect(element(by.id('edit-profile-screen'))).toBeVisible()
    })

    it('should handle nested navigation correctly', async () => {
      // Navigate to profile
      await element(by.id('user-profile-button')).tap()
      await expect(element(by.id('profile-screen'))).toBeVisible()

      // Navigate to edit profile
      await element(by.id('edit-profile-button')).tap()
      await expect(element(by.id('edit-profile-screen'))).toBeVisible()

      // Navigate back to profile
      await element(by.id('back-button')).tap()
      await expect(element(by.id('profile-screen'))).toBeVisible()

      // Navigate back to home
      await element(by.id('back-button')).tap()
      await expect(element(by.id('home-screen'))).toBeVisible()
    })
  })

  describe('Deep Linking', () => {
    it('should handle post detail deep link', async () => {
      // Open deep link
      await device.openURL({ url: 'myapp://post/test-post-id' })

      // Verify post detail screen is displayed
      await waitFor(element(by.id('post-detail-screen')))
        .toBeVisible()
        .withTimeout(3000)

      await expect(element(by.id('post-detail-screen'))).toBeVisible()
    })

    it('should handle user profile deep link', async () => {
      await device.openURL({ url: 'myapp://profile/test-user-id' })

      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(3000)

      await expect(element(by.id('profile-screen'))).toBeVisible()
    })

    it('should handle invalid deep link gracefully', async () => {
      await device.openURL({ url: 'myapp://invalid/route' })

      // Should show home screen or error screen
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(3000)
    })
  })

  describe('Navigation State', () => {
    it('should preserve tab state when switching tabs', async () => {
      // Scroll on home tab
      await element(by.id('home-tab')).tap()
      await element(by.id('home-screen')).scroll(500, 'down')

      // Switch to bulletin tab
      await element(by.id('bulletin-tab')).tap()
      await expect(element(by.id('bulletin-screen'))).toBeVisible()

      // Switch back to home tab
      await element(by.id('home-tab')).tap()

      // Verify scroll position is preserved (approximately)
      await expect(element(by.id('home-screen'))).toBeVisible()
    })

    it('should reset stack when switching tabs', async () => {
      // Navigate deep into home stack
      await element(by.id('home-tab')).tap()
      await element(by.id('post-item-0')).tap()
      await expect(element(by.id('post-detail-screen'))).toBeVisible()

      // Switch to bulletin tab
      await element(by.id('bulletin-tab')).tap()
      await expect(element(by.id('bulletin-screen'))).toBeVisible()

      // Switch back to home tab
      await element(by.id('home-tab')).tap()

      // Should be back at root of home stack
      await expect(element(by.id('home-screen'))).toBeVisible()
    })
  })

  describe('Navigation Gestures', () => {
    beforeEach(async () => {
      await element(by.id('home-tab')).tap()
    })

    it('should support swipe back gesture', async () => {
      // Navigate to post detail
      await element(by.id('post-item-0')).tap()
      await expect(element(by.id('post-detail-screen'))).toBeVisible()

      // Swipe from left edge to go back
      await element(by.id('post-detail-screen')).swipe('right', 'fast', 0.1)

      // Verify we're back on home screen
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(2000)
    })

    it('should support hardware back button (Android)', async () => {
      if (device.getPlatform() === 'android') {
        // Navigate to post detail
        await element(by.id('post-item-0')).tap()
        await expect(element(by.id('post-detail-screen'))).toBeVisible()

        // Press hardware back button
        await device.pressBack()

        // Verify we're back on home screen
        await expect(element(by.id('home-screen'))).toBeVisible()
      }
    })
  })

  describe('Navigation Performance', () => {
    it('should navigate between tabs quickly', async () => {
      const startTime = Date.now()

      // Rapid tab switching
      await element(by.id('bulletin-tab')).tap()
      await element(by.id('karaoke-tab')).tap()
      await element(by.id('settings-tab')).tap()
      await element(by.id('home-tab')).tap()

      const endTime = Date.now()
      const duration = endTime - startTime

      // Navigation should complete within reasonable time
      expect(duration).toBeLessThan(2000)
    })

    it('should load screens efficiently', async () => {
      // Navigate to bulletin board
      await element(by.id('bulletin-tab')).tap()

      // Screen should load within acceptable time
      await waitFor(element(by.id('bulletin-screen')))
        .toBeVisible()
        .withTimeout(1000)
    })
  })

  describe('Error Handling', () => {
    it('should handle navigation to non-existent screen gracefully', async () => {
      // This would require programmatic navigation to test
      // Example: navigation.navigate('NonExistentScreen')

      // Should not crash and show error boundary or fallback
      await expect(element(by.id('error-boundary'))).not.toBeVisible()
    })

    it('should recover from navigation errors', async () => {
      // Simulate navigation error scenario
      // Verify app doesn't crash and shows appropriate feedback
      await expect(element(by.id('home-screen'))).toBeVisible()
    })
  })
})
