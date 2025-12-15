import { useEffect, useState, useMemo } from "react"
import { Post } from "@/core/types/post"
import { UserProfile } from "@/core/types/user"
import { Organization } from "@/core/types/organization"
import { postService, userService, organizationService } from "@/core/services/firestore"
import auth from "@react-native-firebase/auth"

export interface UsePostListReturn {
  posts: Post[]
  filteredPosts: Post[]
  organizations: Organization[]
  loading: boolean
  error: string | null
  userProfile: UserProfile | null
  isOrganizer: boolean
  getFilteredPosts: Post[]
}

export const usePostList = (selectedOrganizationId: string | null): UsePostListReturn => {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to user profile
  useEffect(() => {
    const currentUser = auth().currentUser
    
    if (!currentUser) {
      setUserProfile(null)
      return
    }

    const unsubscribe = userService.subscribeToUserProfile(currentUser.uid, (profile) => {
      setUserProfile(profile)
    })

    return unsubscribe
  }, [])

  // Subscribe to all posts
  useEffect(() => {
    const unsubscribe = postService.subscribeToActivePosts((posts) => {
      setPosts(posts)
      setLoading(false)
      setError(null)
    })

    return unsubscribe
  }, [])

  // Subscribe to organizations
  useEffect(() => {
    const unsubscribe = organizationService.subscribeToOrganizations((organizations) => {
      setOrganizations(organizations)
    })

    return unsubscribe
  }, [])

  // Subscribe to filtered posts by organization
  useEffect(() => {
    if (!selectedOrganizationId) {
      setFilteredPosts([])
      return
    }

    const unsubscribe = postService.subscribeToOrganizationPosts(
      selectedOrganizationId, 
      (filteredPosts) => {
        setFilteredPosts(filteredPosts)
      }
    )

    return unsubscribe
  }, [selectedOrganizationId])

  // Compute filtered posts based on organization selection
  const getFilteredPosts = useMemo(() => {
    return selectedOrganizationId ? filteredPosts : posts
  }, [selectedOrganizationId, filteredPosts, posts])

  // Compute isOrganizer
  const isOrganizer = useMemo(
    () => userProfile?.userType === "organizer", 
    [userProfile?.userType]
  )

  return {
    posts,
    filteredPosts,
    organizations,
    loading,
    error,
    userProfile,
    isOrganizer,
    getFilteredPosts,
  }
}
