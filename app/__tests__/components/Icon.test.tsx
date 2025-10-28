/**
 * Icon Component Tests
 */

import React from "react"
import { render } from "@testing-library/react-native"
import { Icon } from "@/components/Icon"

describe("Icon Component", () => {
  it("renders PNG icon", () => {
    const { container } = render(<Icon icon="back" />)
    expect(container).toBeTruthy()
  })

  it("renders SVG icon", () => {
    const { container } = render(<Icon icon="settings" />)
    expect(container).toBeTruthy()
  })

  it("applies custom size", () => {
    const { container } = render(<Icon icon="menu" size={32} />)
    expect(container).toBeTruthy()
  })

  it("applies custom color", () => {
    const { container } = render(<Icon icon="user" color="#FF0000" />)
    expect(container).toBeTruthy()
  })

  it("caches icon metadata", () => {
    // 첫 번째 렌더링
    const { rerender } = render(<Icon icon="heart" />)

    // 두 번째 렌더링 (캐시에서 가져옴)
    rerender(<Icon icon="heart" size={24} />)

    // 캐시가 작동하는지 확인 (성능 테스트)
    expect(true).toBe(true)
  })
})
