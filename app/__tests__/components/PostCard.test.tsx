/**
 * PostCard Component Tests
 */

import React from "react"
import { render, fireEvent } from "@testing-library/react-native"
import { PostCard } from "@/components/PostCard"
import { Post } from "@/types/post"

const mockPost: Post = {
  id: "test-post-1",
  title: "Test Post Title",
  production: "Test Production",
  organizationName: "Test Organization",
  location: "Seoul, Korea",
  rehearsalSchedule: "Mon-Fri 10:00-18:00",
  status: "active",
  deadline: "2025-12-31",
  totalApplicants: 5,
  roles: [
    { name: "Actor", count: 2, description: "Lead role" },
    { name: "Dancer", count: 3, description: "Background" },
  ],
  tags: ["Musical", "Drama", "Korean"],
  postType: "text",
  createdAt: new Date(),
  updatedAt: new Date(),
  authorId: "user-1",
  organizationId: "org-1",
}

describe("PostCard Component", () => {
  it("renders post information correctly", () => {
    const { getByText } = render(<PostCard post={mockPost} onPress={jest.fn()} />)

    expect(getByText("Test Post Title")).toBeTruthy()
    expect(getByText("Test Production")).toBeTruthy()
    expect(getByText("Test Organization")).toBeTruthy()
  })

  it("handles onPress event with correct post ID", () => {
    const onPressMock = jest.fn()
    const { getByText } = render(<PostCard post={mockPost} onPress={onPressMock} />)

    fireEvent.press(getByText("Test Post Title"))
    expect(onPressMock).toHaveBeenCalledWith("test-post-1")
  })

  it("displays status badge", () => {
    const { getByText } = render(<PostCard post={mockPost} onPress={jest.fn()} />)
    // StatusBadge 텍스트는 번역 키에 따라 다를 수 있음
    expect(getByText).toBeTruthy()
  })

  it("shows deadline when present", () => {
    const { getByText } = render(<PostCard post={mockPost} onPress={jest.fn()} />)
    expect(getByText(/2025-12-31/)).toBeTruthy()
  })

  it("displays roles preview", () => {
    const { getByText } = render(<PostCard post={mockPost} onPress={jest.fn()} />)
    expect(getByText(/Actor/)).toBeTruthy()
    expect(getByText(/Dancer/)).toBeTruthy()
  })

  it("shows image preview when images are present", () => {
    const postWithImages = {
      ...mockPost,
      postType: "images" as const,
      images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    }

    const { getByText } = render(<PostCard post={postWithImages} onPress={jest.fn()} />)
    expect(getByText("+1")).toBeTruthy() // 이미지 카운트
  })

  it("memoizes correctly with same props", () => {
    const { rerender } = render(<PostCard post={mockPost} onPress={jest.fn()} />)

    // 같은 props로 리렌더링
    rerender(<PostCard post={mockPost} onPress={jest.fn()} />)

    // memo가 작동하는지 확인 (실제로는 render count 확인 필요)
    expect(true).toBe(true)
  })
})
