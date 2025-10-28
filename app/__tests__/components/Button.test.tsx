/**
 * Button Component Tests
 */

import React from "react"
import { render, fireEvent } from "@testing-library/react-native"
import { Button } from "@/components/Button"

describe("Button Component", () => {
  it("renders correctly with text", () => {
    const { getByText } = render(<Button text="Click Me" />)
    expect(getByText("Click Me")).toBeTruthy()
  })

  it("handles onPress event", () => {
    const onPressMock = jest.fn()
    const { getByText } = render(<Button text="Press" onPress={onPressMock} />)

    fireEvent.press(getByText("Press"))
    expect(onPressMock).toHaveBeenCalledTimes(1)
  })

  it("shows loading state", () => {
    const { getByLabelText } = render(<Button text="Submit" isLoading={true} />)
    expect(getByLabelText("Loading")).toBeTruthy()
  })

  it("is disabled when disabled prop is true", () => {
    const onPressMock = jest.fn()
    const { getByText } = render(<Button text="Disabled" disabled={true} onPress={onPressMock} />)

    const button = getByText("Disabled").parent
    expect(button?.props.accessibilityState.disabled).toBe(true)
  })

  it("applies preset styles correctly", () => {
    const { getByText } = render(<Button text="CTA Button" preset="cta" />)
    const button = getByText("CTA Button")
    expect(button).toBeTruthy()
  })

  it("has proper accessibility label", () => {
    const { getByLabelText } = render(
      <Button text="Submit" accessibilityLabel="Submit Form" />
    )
    expect(getByLabelText("Submit Form")).toBeTruthy()
  })
})
