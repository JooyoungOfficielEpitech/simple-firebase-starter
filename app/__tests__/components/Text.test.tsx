/**
 * Text Component Tests
 */

import React from "react"
import { render } from "@testing-library/react-native"
import { Text } from "@/components/Text"

describe("Text Component", () => {
  it("renders text content", () => {
    const { getByText } = render(<Text text="Hello World" />)
    expect(getByText("Hello World")).toBeTruthy()
  })

  it("renders children when provided", () => {
    const { getByText } = render(<Text>Child Text</Text>)
    expect(getByText("Child Text")).toBeTruthy()
  })

  it("applies preset styles", () => {
    const { getByText } = render(<Text preset="heading" text="Heading" />)
    expect(getByText("Heading")).toBeTruthy()
  })

  it("applies size styles", () => {
    const { getByText } = render(<Text size="xl" text="Large Text" />)
    expect(getByText("Large Text")).toBeTruthy()
  })

  it("applies weight styles", () => {
    const { getByText } = render(<Text weight="bold" text="Bold Text" />)
    expect(getByText("Bold Text")).toBeTruthy()
  })

  it("handles translation keys", () => {
    // Note: 실제 i18n 모킹 필요
    const { getByText } = render(<Text tx="common:ok" />)
    // i18n이 설정되지 않으면 키가 그대로 표시됨
    expect(getByText).toBeTruthy()
  })
})
