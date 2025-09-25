import React from "react"
import { render, fireEvent } from "@testing-library/react-native"
import { Button } from "../Button"

describe("Button Component", () => {
  const defaultProps = {
    onPress: jest.fn(),
    children: "Test Button",
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders correctly with default props", () => {
    const { getByText } = render(<Button {...defaultProps} />)
    
    expect(getByText("Test Button")).toBeTruthy()
  })

  it("calls onPress when pressed", () => {
    const mockOnPress = jest.fn()
    const { getByText } = render(
      <Button {...defaultProps} onPress={mockOnPress} />
    )
    
    fireEvent.press(getByText("Test Button"))
    expect(mockOnPress).toHaveBeenCalledTimes(1)
  })

  it("renders with filled preset correctly", () => {
    const { getByText } = render(
      <Button {...defaultProps} preset="filled" />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("renders with reversed preset correctly", () => {
    const { getByText } = render(
      <Button {...defaultProps} preset="reversed" />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("renders with cta preset correctly", () => {
    const { getByText } = render(
      <Button {...defaultProps} preset="cta" />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("renders with custom style correctly", () => {
    const customStyle = { backgroundColor: "red" }
    const { getByText } = render(
      <Button {...defaultProps} style={customStyle} />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("renders with text style correctly", () => {
    const customTextStyle = { fontSize: 20 }
    const { getByText } = render(
      <Button {...defaultProps} textStyle={customTextStyle} />
    )
    
    const text = getByText("Test Button")
    expect(text).toBeTruthy()
  })

  it("renders with disabled state correctly", () => {
    const { getByText } = render(
      <Button {...defaultProps} disabled={true} />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("shows loading state correctly", () => {
    const { queryByText } = render(
      <Button {...defaultProps} isLoading={true} />
    )
    
    // Text should not be visible when loading
    expect(queryByText("Test Button")).toBeNull()
  })

  it("is disabled when loading", () => {
    const mockOnPress = jest.fn()
    const { getByRole } = render(
      <Button {...defaultProps} onPress={mockOnPress} isLoading={true} />
    )
    
    const button = getByRole("button")
    fireEvent.press(button)
    
    expect(mockOnPress).not.toHaveBeenCalled()
  })

  it("is disabled when disabled prop is true", () => {
    const mockOnPress = jest.fn()
    const { getByText } = render(
      <Button {...defaultProps} onPress={mockOnPress} disabled={true} />
    )
    
    const button = getByText("Test Button").parent?.parent
    fireEvent.press(button!)
    
    expect(mockOnPress).not.toHaveBeenCalled()
  })

  it("renders with custom pressed style", () => {
    const pressedStyle = { backgroundColor: "blue" }
    const { getByText } = render(
      <Button {...defaultProps} pressedStyle={pressedStyle} />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("renders with disabled style", () => {
    const disabledStyle = { opacity: 0.5 }
    const { getByText } = render(
      <Button {...defaultProps} disabled={true} disabledStyle={disabledStyle} />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("handles undefined children gracefully", () => {
    const { getByRole } = render(
      <Button onPress={jest.fn()} />
    )
    
    expect(getByRole("button")).toBeTruthy()
  })

  it("handles string children correctly", () => {
    const { getByText } = render(
      <Button onPress={jest.fn()}>
        String Child
      </Button>
    )
    
    expect(getByText("String Child")).toBeTruthy()
  })

  it("handles React node children correctly", () => {
    const { getByText } = render(
      <Button onPress={jest.fn()}>
        <React.Fragment>Fragment Child</React.Fragment>
      </Button>
    )
    
    expect(getByText("Fragment Child")).toBeTruthy()
  })
})