/**
 * Post Creation and Management E2E Tests
 *
 * Tests post-related user flows including:
 * - Creating posts
 * - Editing posts
 * - Deleting posts
 * - Commenting
 * - Liking posts
 */

describe('Posting Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })

    // Login before posting tests
    await element(by.id('email-input')).typeText('test@example.com')
    await element(by.id('password-input')).typeText('TestPassword123!')
    await element(by.id('login-button')).tap()

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000)
  })

  describe('Create Post', () => {
    beforeEach(async () => {
      // Navigate to bulletin board
      await element(by.id('bulletin-tab')).tap()
    })

    it('should display create post button', async () => {
      await expect(element(by.id('create-post-button'))).toBeVisible()
    })

    it('should open create post screen', async () => {
      await element(by.id('create-post-button')).tap()

      await expect(element(by.id('create-post-screen'))).toBeVisible()
      await expect(element(by.id('post-title-input'))).toBeVisible()
      await expect(element(by.id('post-content-input'))).toBeVisible()
      await expect(element(by.id('submit-post-button'))).toBeVisible()
    })

    it('should validate required fields', async () => {
      await element(by.id('create-post-button')).tap()

      // Try to submit empty post
      await element(by.id('submit-post-button')).tap()

      // Verify validation errors
      await expect(element(by.text('제목을 입력해주세요'))).toBeVisible()
      await expect(element(by.text('내용을 입력해주세요'))).toBeVisible()
    })

    it('should create text post successfully', async () => {
      await element(by.id('create-post-button')).tap()

      // Fill in post details
      const timestamp = Date.now()
      await element(by.id('post-title-input')).typeText(`Test Post ${timestamp}`)
      await element(by.id('post-content-input')).typeText('This is a test post content')

      // Submit post
      await element(by.id('submit-post-button')).tap()

      // Verify success and navigation back to bulletin
      await waitFor(element(by.id('bulletin-screen')))
        .toBeVisible()
        .withTimeout(3000)

      // Verify post appears in feed
      await waitFor(element(by.text(`Test Post ${timestamp}`)))
        .toBeVisible()
        .withTimeout(3000)
    })

    it('should create post with image', async () => {
      await element(by.id('create-post-button')).tap()

      // Fill in text
      await element(by.id('post-title-input')).typeText('Post with Image')
      await element(by.id('post-content-input')).typeText('This post has an image')

      // Add image
      await element(by.id('add-image-button')).tap()
      await element(by.id('select-from-gallery')).tap()

      // Select first image (this requires gallery permissions)
      await waitFor(element(by.id('gallery-image-0')))
        .toBeVisible()
        .withTimeout(2000)
      await element(by.id('gallery-image-0')).tap()

      // Verify image preview
      await expect(element(by.id('image-preview'))).toBeVisible()

      // Submit post
      await element(by.id('submit-post-button')).tap()

      // Verify success
      await waitFor(element(by.id('bulletin-screen')))
        .toBeVisible()
        .withTimeout(3000)
    })

    it('should allow cancelling post creation', async () => {
      await element(by.id('create-post-button')).tap()

      // Start filling in post
      await element(by.id('post-title-input')).typeText('Cancelled Post')

      // Cancel
      await element(by.id('cancel-button')).tap()

      // Confirm cancellation if dialog appears
      if (await element(by.text('취소하시겠습니까?')).exists()) {
        await element(by.text('확인')).tap()
      }

      // Verify back on bulletin screen
      await expect(element(by.id('bulletin-screen'))).toBeVisible()
    })
  })

  describe('Edit Post', () => {
    const testPostTitle = `Edit Test Post ${Date.now()}`

    beforeEach(async () => {
      // Create a post to edit
      await element(by.id('bulletin-tab')).tap()
      await element(by.id('create-post-button')).tap()
      await element(by.id('post-title-input')).typeText(testPostTitle)
      await element(by.id('post-content-input')).typeText('Original content')
      await element(by.id('submit-post-button')).tap()

      await waitFor(element(by.text(testPostTitle)))
        .toBeVisible()
        .withTimeout(3000)
    })

    it('should open edit post screen', async () => {
      // Find and tap on the post
      await element(by.text(testPostTitle)).tap()

      // Tap edit button
      await element(by.id('edit-post-button')).tap()

      // Verify edit screen
      await expect(element(by.id('edit-post-screen'))).toBeVisible()
      await expect(element(by.id('post-title-input'))).toHaveText(testPostTitle)
    })

    it('should edit post content', async () => {
      await element(by.text(testPostTitle)).tap()
      await element(by.id('edit-post-button')).tap()

      // Edit content
      await element(by.id('post-content-input')).clearText()
      await element(by.id('post-content-input')).typeText('Updated content')

      // Save changes
      await element(by.id('save-post-button')).tap()

      // Verify changes saved
      await waitFor(element(by.text('Updated content')))
        .toBeVisible()
        .withTimeout(3000)
    })

    it('should only show edit option for own posts', async () => {
      // Tap on a post from another user (if exists)
      // This test assumes there are posts from other users
      await element(by.id('post-item-other-user')).tap()

      // Edit button should not be visible
      await expect(element(by.id('edit-post-button'))).not.toBeVisible()
    })
  })

  describe('Delete Post', () => {
    const testPostTitle = `Delete Test Post ${Date.now()}`

    beforeEach(async () => {
      // Create a post to delete
      await element(by.id('bulletin-tab')).tap()
      await element(by.id('create-post-button')).tap()
      await element(by.id('post-title-input')).typeText(testPostTitle)
      await element(by.id('post-content-input')).typeText('To be deleted')
      await element(by.id('submit-post-button')).tap()

      await waitFor(element(by.text(testPostTitle)))
        .toBeVisible()
        .withTimeout(3000)
    })

    it('should delete post with confirmation', async () => {
      // Open post detail
      await element(by.text(testPostTitle)).tap()

      // Tap delete button
      await element(by.id('delete-post-button')).tap()

      // Confirm deletion
      await waitFor(element(by.text('삭제하시겠습니까?')))
        .toBeVisible()
        .withTimeout(1000)
      await element(by.text('삭제')).tap()

      // Verify post deleted and back on bulletin screen
      await waitFor(element(by.id('bulletin-screen')))
        .toBeVisible()
        .withTimeout(3000)

      // Verify post no longer exists
      await expect(element(by.text(testPostTitle))).not.toBeVisible()
    })

    it('should cancel post deletion', async () => {
      await element(by.text(testPostTitle)).tap()
      await element(by.id('delete-post-button')).tap()

      // Cancel deletion
      await element(by.text('취소')).tap()

      // Verify still on post detail screen
      await expect(element(by.id('post-detail-screen'))).toBeVisible()
      await expect(element(by.text(testPostTitle))).toBeVisible()
    })
  })

  describe('Comments', () => {
    const testPostTitle = `Comment Test Post ${Date.now()}`

    beforeEach(async () => {
      // Create a post to comment on
      await element(by.id('bulletin-tab')).tap()
      await element(by.id('create-post-button')).tap()
      await element(by.id('post-title-input')).typeText(testPostTitle)
      await element(by.id('post-content-input')).typeText('Post for commenting')
      await element(by.id('submit-post-button')).tap()

      await waitFor(element(by.text(testPostTitle)))
        .toBeVisible()
        .withTimeout(3000)

      // Open post detail
      await element(by.text(testPostTitle)).tap()
    })

    it('should display comment input', async () => {
      await expect(element(by.id('comment-input'))).toBeVisible()
      await expect(element(by.id('submit-comment-button'))).toBeVisible()
    })

    it('should add comment to post', async () => {
      const commentText = 'This is a test comment'

      // Type comment
      await element(by.id('comment-input')).typeText(commentText)

      // Submit comment
      await element(by.id('submit-comment-button')).tap()

      // Verify comment appears
      await waitFor(element(by.text(commentText)))
        .toBeVisible()
        .withTimeout(3000)
    })

    it('should not submit empty comment', async () => {
      // Try to submit without typing
      await element(by.id('submit-comment-button')).tap()

      // Comment should not be submitted (input should still be focused)
      await expect(element(by.id('comment-input'))).toBeVisible()
    })

    it('should delete own comment', async () => {
      const commentText = 'Comment to delete'

      // Add comment
      await element(by.id('comment-input')).typeText(commentText)
      await element(by.id('submit-comment-button')).tap()

      await waitFor(element(by.text(commentText)))
        .toBeVisible()
        .withTimeout(3000)

      // Delete comment
      await element(by.id('delete-comment-button')).atIndex(0).tap()

      // Confirm deletion
      await element(by.text('삭제')).tap()

      // Verify comment removed
      await expect(element(by.text(commentText))).not.toBeVisible()
    })
  })

  describe('Likes', () => {
    const testPostTitle = `Like Test Post ${Date.now()}`

    beforeEach(async () => {
      // Create a post to like
      await element(by.id('bulletin-tab')).tap()
      await element(by.id('create-post-button')).tap()
      await element(by.id('post-title-input')).typeText(testPostTitle)
      await element(by.id('post-content-input')).typeText('Post for liking')
      await element(by.id('submit-post-button')).tap()

      await waitFor(element(by.text(testPostTitle)))
        .toBeVisible()
        .withTimeout(3000)
    })

    it('should like post from feed', async () => {
      // Find like button for the post
      await element(by.id('like-button')).atIndex(0).tap()

      // Verify like count increased
      await waitFor(element(by.id('like-count-1')))
        .toBeVisible()
        .withTimeout(1000)
    })

    it('should unlike post', async () => {
      // Like post
      await element(by.id('like-button')).atIndex(0).tap()
      await waitFor(element(by.id('like-count-1')))
        .toBeVisible()
        .withTimeout(1000)

      // Unlike post
      await element(by.id('like-button')).atIndex(0).tap()

      // Verify like count decreased
      await waitFor(element(by.id('like-count-0')))
        .toBeVisible()
        .withTimeout(1000)
    })

    it('should like post from detail view', async () => {
      // Open post detail
      await element(by.text(testPostTitle)).tap()

      // Like post
      await element(by.id('like-button')).tap()

      // Verify like animation or state change
      await expect(element(by.id('liked-icon'))).toBeVisible()
    })
  })

  describe('Post Feed', () => {
    it('should load posts on scroll', async () => {
      await element(by.id('bulletin-tab')).tap()

      // Scroll down to load more posts
      await element(by.id('bulletin-screen')).scroll(500, 'down')

      // Verify loading indicator or new posts
      await waitFor(element(by.id('loading-indicator')))
        .toBeVisible()
        .withTimeout(1000)
    })

    it('should pull to refresh posts', async () => {
      await element(by.id('bulletin-tab')).tap()

      // Pull to refresh
      await element(by.id('bulletin-screen')).swipe('down', 'fast', 0.9)

      // Verify refresh indicator
      await waitFor(element(by.id('refresh-indicator')))
        .toBeVisible()
        .withTimeout(1000)
    })

    it('should display empty state when no posts', async () => {
      // This would require a test account with no posts
      // Or filtering to show empty state
      await element(by.id('bulletin-tab')).tap()

      // If no posts exist
      if (await element(by.id('empty-state')).exists()) {
        await expect(element(by.id('empty-state'))).toBeVisible()
        await expect(element(by.text('게시글이 없습니다'))).toBeVisible()
      }
    })
  })
})
