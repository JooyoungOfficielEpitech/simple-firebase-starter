import { jest } from "@jest/globals"
import firestore from "@react-native-firebase/firestore"
import { PostService } from "../postService"
import { Post, CreatePost, UpdatePost, PostStatus } from "../../../types/post"

// Mock the Firebase Firestore module
jest.mock("@react-native-firebase/firestore")

describe("PostService", () => {
  const mockFirestore = firestore as jest.Mocked<typeof firestore>
  const mockCollection = jest.fn()
  const mockDoc = jest.fn()
  const mockGet = jest.fn()
  const mockAdd = jest.fn()
  const mockSet = jest.fn()
  const mockUpdate = jest.fn()
  const mockDelete = jest.fn()
  const mockWhere = jest.fn()
  const mockOrderBy = jest.fn()
  const mockLimit = jest.fn()
  const mockOnSnapshot = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup mock chain
    mockLimit.mockReturnValue({
      get: mockGet,
      onSnapshot: mockOnSnapshot,
    })
    
    mockOrderBy.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
      onSnapshot: mockOnSnapshot,
    })
    
    mockWhere.mockReturnValue({
      orderBy: mockOrderBy,
      limit: mockLimit,
      get: mockGet,
      onSnapshot: mockOnSnapshot,
    })
    
    mockDoc.mockReturnValue({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      delete: mockDelete,
      onSnapshot: mockOnSnapshot,
    })
    
    mockCollection.mockReturnValue({
      doc: mockDoc,
      add: mockAdd,
      where: mockWhere,
      orderBy: mockOrderBy,
      get: mockGet,
      onSnapshot: mockOnSnapshot,
    })
    
    mockFirestore.mockReturnValue({
      collection: mockCollection,
    } as any)
  })

  const mockPost: Post = {
    id: "test-post-1",
    title: "Test Post",
    description: "Test Description",
    production: "Test Production",
    rehearsalSchedule: "Every Sunday",
    location: "Test Location",
    organizationId: "org-1",
    organizationName: "Test Organization",
    authorId: "user-1",
    authorName: "Test User",
    status: "active" as PostStatus,
    tags: ["musical", "audition"],
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  }

  describe("createPost", () => {
    it("should create a post successfully", async () => {
      const createPostData: CreatePost = {
        title: "New Post",
        description: "New Description",
        production: "New Production",
        rehearsalSchedule: "Every Monday",
        location: "New Location",
        organizationName: "New Organization",
        status: "active" as PostStatus,
        tags: ["theatre"],
        createdAt: { serverTimestamp: true } as any,
        updatedAt: { serverTimestamp: true } as any,
      }

      mockAdd.mockResolvedValue({ id: "new-post-id" })

      const result = await PostService.createPost("user-1", "org-1", createPostData)

      expect(mockCollection).toHaveBeenCalledWith("posts")
      expect(mockAdd).toHaveBeenCalledWith({
        ...createPostData,
        authorId: "user-1",
        organizationId: "org-1",
      })
      expect(result).toBe("new-post-id")
    })

    it("should handle creation errors", async () => {
      const createPostData: CreatePost = {
        title: "New Post",
        description: "New Description",
        production: "New Production",
        rehearsalSchedule: "Every Monday",
        location: "New Location",
        organizationName: "New Organization",
        status: "active" as PostStatus,
        tags: ["theatre"],
        createdAt: { serverTimestamp: true } as any,
        updatedAt: { serverTimestamp: true } as any,
      }

      mockAdd.mockRejectedValue(new Error("Network error"))

      await expect(PostService.createPost("user-1", "org-1", createPostData))
        .rejects.toThrow("Failed to create post")
    })
  })

  describe("getPost", () => {
    it("should get a post successfully", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "test-post-1",
        data: () => ({
          ...mockPost,
          createdAt: mockPost.createdAt,
          updatedAt: mockPost.updatedAt,
        }),
      })

      const result = await PostService.getPost("test-post-1")

      expect(mockCollection).toHaveBeenCalledWith("posts")
      expect(mockDoc).toHaveBeenCalledWith("test-post-1")
      expect(mockGet).toHaveBeenCalled()
      expect(result).toEqual(mockPost)
    })

    it("should return null for non-existent post", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      })

      const result = await PostService.getPost("non-existent")

      expect(result).toBeNull()
    })

    it("should handle get errors", async () => {
      mockGet.mockRejectedValue(new Error("Network error"))

      await expect(PostService.getPost("test-post-1"))
        .rejects.toThrow("Failed to get post")
    })
  })

  describe("updatePost", () => {
    it("should update a post successfully", async () => {
      const updateData: UpdatePost = {
        title: "Updated Title",
        description: "Updated Description",
        updatedAt: { serverTimestamp: true } as any,
      }

      mockUpdate.mockResolvedValue(undefined)

      await PostService.updatePost("test-post-1", updateData)

      expect(mockCollection).toHaveBeenCalledWith("posts")
      expect(mockDoc).toHaveBeenCalledWith("test-post-1")
      expect(mockUpdate).toHaveBeenCalledWith(updateData)
    })

    it("should handle update errors", async () => {
      const updateData: UpdatePost = {
        title: "Updated Title",
        updatedAt: { serverTimestamp: true } as any,
      }

      mockUpdate.mockRejectedValue(new Error("Permission denied"))

      await expect(PostService.updatePost("test-post-1", updateData))
        .rejects.toThrow("Failed to update post")
    })
  })

  describe("deletePost", () => {
    it("should delete a post successfully", async () => {
      mockDelete.mockResolvedValue(undefined)

      await PostService.deletePost("test-post-1")

      expect(mockCollection).toHaveBeenCalledWith("posts")
      expect(mockDoc).toHaveBeenCalledWith("test-post-1")
      expect(mockDelete).toHaveBeenCalled()
    })

    it("should handle delete errors", async () => {
      mockDelete.mockRejectedValue(new Error("Permission denied"))

      await expect(PostService.deletePost("test-post-1"))
        .rejects.toThrow("Failed to delete post")
    })
  })

  describe("getActivePosts", () => {
    it("should get active posts with pagination", async () => {
      const mockDocs = [
        {
          id: "post-1",
          data: () => ({ ...mockPost, id: "post-1" }),
        },
        {
          id: "post-2", 
          data: () => ({ ...mockPost, id: "post-2" }),
        },
      ]

      mockGet.mockResolvedValue({
        docs: mockDocs,
        empty: false,
      })

      const result = await PostService.getActivePosts(10)

      expect(mockCollection).toHaveBeenCalledWith("posts")
      expect(mockWhere).toHaveBeenCalledWith("status", "==", "active")
      expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc")
      expect(mockLimit).toHaveBeenCalledWith(10)
      expect(result.posts).toHaveLength(2)
      expect(result.hasMore).toBe(false)
    })

    it("should handle empty results", async () => {
      mockGet.mockResolvedValue({
        docs: [],
        empty: true,
      })

      const result = await PostService.getActivePosts(10)

      expect(result.posts).toHaveLength(0)
      expect(result.hasMore).toBe(false)
    })
  })

  describe("getPostsByOrganization", () => {
    it("should get posts by organization", async () => {
      const mockDocs = [
        {
          id: "post-1",
          data: () => ({ ...mockPost, organizationId: "org-1" }),
        },
      ]

      mockGet.mockResolvedValue({
        docs: mockDocs,
        empty: false,
      })

      const result = await PostService.getPostsByOrganization("org-1", 10)

      expect(mockWhere).toHaveBeenCalledWith("organizationId", "==", "org-1")
      expect(result.posts).toHaveLength(1)
    })
  })

  describe("subscribeToActivePosts", () => {
    it("should set up real-time subscription", () => {
      const callback = jest.fn()
      const unsubscribe = jest.fn()
      
      mockOnSnapshot.mockReturnValue(unsubscribe)

      const result = PostService.subscribeToActivePosts(callback, 10)

      expect(mockCollection).toHaveBeenCalledWith("posts")
      expect(mockWhere).toHaveBeenCalledWith("status", "==", "active")
      expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc")
      expect(mockLimit).toHaveBeenCalledWith(10)
      expect(mockOnSnapshot).toHaveBeenCalled()
      expect(result).toBe(unsubscribe)
    })
  })

  describe("incrementViewCount", () => {
    it("should increment view count", async () => {
      mockUpdate.mockResolvedValue(undefined)

      await PostService.incrementViewCount("test-post-1")

      expect(mockUpdate).toHaveBeenCalledWith({
        viewCount: { increment: 1 },
        updatedAt: { serverTimestamp: true },
      })
    })
  })
})