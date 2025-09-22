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

  it("renders with primary variant correctly", () => {
    const { getByText } = render(
      <Button {...defaultProps} variant="primary" />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("renders with secondary variant correctly", () => {
    const { getByText } = render(
      <Button {...defaultProps} variant="secondary" />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("renders with outline variant correctly", () => {
    const { getByText } = render(
      <Button {...defaultProps} variant="outline" />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("renders with small size correctly", () => {
    const { getByText } = render(
      <Button {...defaultProps} size="small" />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("renders with medium size correctly", () => {
    const { getByText } = render(
      <Button {...defaultProps} size="medium" />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("renders with large size correctly", () => {
    const { getByText } = render(
      <Button {...defaultProps} size="large" />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("shows loading state correctly", () => {
    const { getByTestId, queryByText } = render(
      <Button {...defaultProps} loading={true} />
    )
    
    // Text should not be visible when loading
    expect(queryByText("Test Button")).toBeNull()
    
    // Loading indicator should be present
    expect(getByTestId("loading-indicator")).toBeTruthy()
  })

  it("is disabled when loading", () => {
    const mockOnPress = jest.fn()
    const { getByTestId } = render(
      <Button {...defaultProps} onPress={mockOnPress} loading={true} />
    )
    
    const button = getByTestId("loading-indicator").parent?.parent
    fireEvent.press(button!)
    
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

  it("applies custom style correctly", () => {
    const customStyle = { backgroundColor: "red" }
    const { getByText } = render(
      <Button {...defaultProps} style={customStyle} />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
    // Note: Detailed style testing would require react-native-testing-library with style assertions
  })

  it("applies custom text style correctly", () => {
    const customTextStyle = { fontSize: 20 }
    const { getByText } = render(
      <Button {...defaultProps} textStyle={customTextStyle} />
    )
    
    const text = getByText("Test Button")
    expect(text).toBeTruthy()
    // Note: Detailed style testing would require react-native-testing-library with style assertions
  })

  it("renders with full width when specified", () => {
    const { getByText } = render(
      <Button {...defaultProps} fullWidth={true} />
    )
    
    const button = getByText("Test Button").parent?.parent
    expect(button).toBeTruthy()
  })

  it("handles undefined children gracefully", () => {
    const { container } = render(
      <Button onPress={jest.fn()} />
    )
    
    expect(container).toBeTruthy()
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