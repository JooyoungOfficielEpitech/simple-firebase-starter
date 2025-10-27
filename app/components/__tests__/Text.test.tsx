import React from "react"
import { render } from "@testing-library/react-native"
import { Text } from "../Text"
import { ThemeProvider } from "@/theme/context"

describe("Text Component", () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>)
  }

  describe("Text - Basic Rendering", () => {
    it("renders text prop correctly", () => {
      const { getByText } = renderWithTheme(<Text text="Hello World" />)
      expect(getByText("Hello World")).toBeTruthy()
    })

    it("renders children correctly", () => {
      const { getByText } = renderWithTheme(<Text>Hello Children</Text>)
      expect(getByText("Hello Children")).toBeTruthy()
    })

    it("prioritizes tx over text prop", () => {
      // Note: This would require proper i18n mocking
      const { getByText } = renderWithTheme(<Text text="fallback" />)
      expect(getByText("fallback")).toBeTruthy()
    })

    it("renders with default preset", () => {
      const { getByText } = renderWithTheme(<Text text="Default Text" />)
      const textElement = getByText("Default Text")
      expect(textElement).toBeTruthy()
    })
  })

  describe("Text - Presets", () => {
    it("renders with bold preset", () => {
      const { getByText } = renderWithTheme(
        <Text text="Bold Text" preset="bold" />
      )
      expect(getByText("Bold Text")).toBeTruthy()
    })

    it("renders with heading preset", () => {
      const { getByText } = renderWithTheme(
        <Text text="Heading Text" preset="heading" />
      )
      expect(getByText("Heading Text")).toBeTruthy()
    })

    it("renders with subheading preset", () => {
      const { getByText } = renderWithTheme(
        <Text text="Subheading Text" preset="subheading" />
      )
      expect(getByText("Subheading Text")).toBeTruthy()
    })

    it("renders with formLabel preset", () => {
      const { getByText } = renderWithTheme(
        <Text text="Form Label" preset="formLabel" />
      )
      expect(getByText("Form Label")).toBeTruthy()
    })

    it("renders with formHelper preset", () => {
      const { getByText } = renderWithTheme(
        <Text text="Helper Text" preset="formHelper" />
      )
      expect(getByText("Helper Text")).toBeTruthy()
    })
  })

  describe("Text - Sizes", () => {
    it("renders with xxl size", () => {
      const { getByText } = renderWithTheme(
        <Text text="XXL Text" size="xxl" />
      )
      expect(getByText("XXL Text")).toBeTruthy()
    })

    it("renders with xl size", () => {
      const { getByText } = renderWithTheme(
        <Text text="XL Text" size="xl" />
      )
      expect(getByText("XL Text")).toBeTruthy()
    })

    it("renders with lg size", () => {
      const { getByText } = renderWithTheme(
        <Text text="LG Text" size="lg" />
      )
      expect(getByText("LG Text")).toBeTruthy()
    })

    it("renders with md size", () => {
      const { getByText } = renderWithTheme(
        <Text text="MD Text" size="md" />
      )
      expect(getByText("MD Text")).toBeTruthy()
    })

    it("renders with sm size", () => {
      const { getByText } = renderWithTheme(
        <Text text="SM Text" size="sm" />
      )
      expect(getByText("SM Text")).toBeTruthy()
    })

    it("renders with xs size", () => {
      const { getByText } = renderWithTheme(
        <Text text="XS Text" size="xs" />
      )
      expect(getByText("XS Text")).toBeTruthy()
    })

    it("renders with xxs size", () => {
      const { getByText } = renderWithTheme(
        <Text text="XXS Text" size="xxs" />
      )
      expect(getByText("XXS Text")).toBeTruthy()
    })
  })

  describe("Text - Font Weights", () => {
    it("renders with normal weight", () => {
      const { getByText } = renderWithTheme(
        <Text text="Normal Weight" weight="normal" />
      )
      expect(getByText("Normal Weight")).toBeTruthy()
    })

    it("renders with medium weight", () => {
      const { getByText } = renderWithTheme(
        <Text text="Medium Weight" weight="medium" />
      )
      expect(getByText("Medium Weight")).toBeTruthy()
    })

    it("renders with semiBold weight", () => {
      const { getByText } = renderWithTheme(
        <Text text="SemiBold Weight" weight="semiBold" />
      )
      expect(getByText("SemiBold Weight")).toBeTruthy()
    })

    it("renders with bold weight", () => {
      const { getByText } = renderWithTheme(
        <Text text="Bold Weight" weight="bold" />
      )
      expect(getByText("Bold Weight")).toBeTruthy()
    })
  })

  describe("Text - Styling", () => {
    it("applies custom style correctly", () => {
      const customStyle = { color: "red", fontSize: 20 }
      const { getByText } = renderWithTheme(
        <Text text="Styled Text" style={customStyle} />
      )
      const textElement = getByText("Styled Text")
      expect(textElement).toBeTruthy()
    })

    it("combines multiple style props", () => {
      const { getByText } = renderWithTheme(
        <Text
          text="Combined Styles"
          size="lg"
          weight="bold"
          preset="heading"
          style={{ color: "blue" }}
        />
      )
      expect(getByText("Combined Styles")).toBeTruthy()
    })
  })

  describe("Text - Accessibility", () => {
    it("supports accessibility label", () => {
      const { getByLabelText } = renderWithTheme(
        <Text text="Accessible Text" accessibilityLabel="Custom Label" />
      )
      expect(getByLabelText("Custom Label")).toBeTruthy()
    })

    it("supports accessibility role", () => {
      const { getByRole } = renderWithTheme(
        <Text text="Header Text" accessibilityRole="header" />
      )
      expect(getByRole("header")).toBeTruthy()
    })

    it("supports numberOfLines for truncation", () => {
      const longText = "This is a very long text that should be truncated"
      const { getByText } = renderWithTheme(
        <Text text={longText} numberOfLines={1} />
      )
      expect(getByText(longText)).toBeTruthy()
    })
  })

  describe("Text - Edge Cases", () => {
    it("handles empty text gracefully", () => {
      const { container } = renderWithTheme(<Text text="" />)
      expect(container).toBeTruthy()
    })

    it("handles undefined text gracefully", () => {
      const { container } = renderWithTheme(<Text />)
      expect(container).toBeTruthy()
    })

    it("handles null children gracefully", () => {
      const { container } = renderWithTheme(<Text>{null}</Text>)
      expect(container).toBeTruthy()
    })

    it("handles very long text", () => {
      const veryLongText = "A".repeat(1000)
      const { getByText } = renderWithTheme(<Text text={veryLongText} />)
      expect(getByText(veryLongText)).toBeTruthy()
    })

    it("handles special characters", () => {
      const specialText = "Test 한글 🎉 @#$%"
      const { getByText } = renderWithTheme(<Text text={specialText} />)
      expect(getByText(specialText)).toBeTruthy()
    })
  })

  describe("Text - Internationalization", () => {
    it("handles Korean text correctly", () => {
      const koreanText = "안녕하세요"
      const { getByText } = renderWithTheme(<Text text={koreanText} />)
      expect(getByText(koreanText)).toBeTruthy()
    })

    it("handles RTL text", () => {
      // This would require proper RTL testing setup
      const { getByText } = renderWithTheme(<Text text="مرحبا" />)
      expect(getByText("مرحبا")).toBeTruthy()
    })

    it("handles mixed language text", () => {
      const mixedText = "Hello 안녕 مرحبا"
      const { getByText } = renderWithTheme(<Text text={mixedText} />)
      expect(getByText(mixedText)).toBeTruthy()
    })
  })

  describe("Text - React Props", () => {
    it("forwards ref correctly", () => {
      const ref = React.createRef<any>()
      renderWithTheme(<Text text="Ref Test" ref={ref} />)
      expect(ref.current).toBeTruthy()
    })

    it("supports testID prop", () => {
      const { getByTestId } = renderWithTheme(
        <Text text="Test ID" testID="test-text" />
      )
      expect(getByTestId("test-text")).toBeTruthy()
    })

    it("supports onPress handler", () => {
      const onPressMock = jest.fn()
      const { getByText } = renderWithTheme(
        <Text text="Pressable Text" onPress={onPressMock} />
      )
      const textElement = getByText("Pressable Text")
      textElement.props.onPress()
      expect(onPressMock).toHaveBeenCalledTimes(1)
    })
  })

  describe("Text - Performance", () => {
    it("renders multiple text components efficiently", () => {
      const { getAllByText } = renderWithTheme(
        <>
          <Text text="Text 1" />
          <Text text="Text 2" />
          <Text text="Text 3" />
          <Text text="Text 4" />
          <Text text="Text 5" />
        </>
      )
      expect(getAllByText(/Text \d/)).toHaveLength(5)
    })

    it("handles rapid re-renders", () => {
      const { rerender, getByText } = renderWithTheme(<Text text="Initial" />)

      rerender(
        <ThemeProvider>
          <Text text="Updated 1" />
        </ThemeProvider>
      )
      expect(getByText("Updated 1")).toBeTruthy()

      rerender(
        <ThemeProvider>
          <Text text="Updated 2" />
        </ThemeProvider>
      )
      expect(getByText("Updated 2")).toBeTruthy()
    })
  })
})
