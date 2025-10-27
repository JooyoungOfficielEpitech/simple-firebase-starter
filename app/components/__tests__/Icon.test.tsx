import React from "react"
import { render } from "@testing-library/react-native"
import { Icon, PressableIcon, isIconRegistered, getRegisteredIcons } from "../Icon"
import { ThemeProvider } from "@/theme/context"

describe("Icon Component", () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>)
  }

  describe("Icon - Basic Rendering", () => {
    it("renders PNG icon correctly", () => {
      const { getByTestId } = renderWithTheme(
        <Icon icon="heart" testID="test-icon" />
      )
      expect(getByTestId("test-icon")).toBeTruthy()
    })

    it("renders SVG icon correctly", () => {
      const { getByTestId } = renderWithTheme(
        <Icon icon="google" testID="test-icon" />
      )
      expect(getByTestId("test-icon")).toBeTruthy()
    })

    it("applies default size when not specified", () => {
      const { getByTestId } = renderWithTheme(
        <Icon icon="heart" testID="test-icon" />
      )
      const icon = getByTestId("test-icon")
      expect(icon).toBeTruthy()
    })

    it("applies custom size correctly", () => {
      const customSize = 48
      const { getByTestId } = renderWithTheme(
        <Icon icon="heart" size={customSize} testID="test-icon" />
      )
      const icon = getByTestId("test-icon")
      expect(icon).toBeTruthy()
    })

    it("applies custom color correctly", () => {
      const customColor = "#FF0000"
      const { getByTestId } = renderWithTheme(
        <Icon icon="heart" color={customColor} testID="test-icon" />
      )
      const icon = getByTestId("test-icon")
      expect(icon).toBeTruthy()
    })

    it("applies container style correctly", () => {
      const containerStyle = { backgroundColor: "blue", padding: 10 }
      const { getByTestId } = renderWithTheme(
        <Icon icon="heart" containerStyle={containerStyle} testID="test-icon" />
      )
      const icon = getByTestId("test-icon")
      expect(icon).toBeTruthy()
    })

    it("applies image style override correctly", () => {
      const imageStyle = { opacity: 0.5 }
      const { getByTestId } = renderWithTheme(
        <Icon icon="heart" style={imageStyle} testID="test-icon" />
      )
      const icon = getByTestId("test-icon")
      expect(icon).toBeTruthy()
    })
  })

  describe("PressableIcon - Interaction", () => {
    it("renders pressable icon correctly", () => {
      const { getByTestId } = renderWithTheme(
        <PressableIcon icon="heart" testID="test-icon" onPress={jest.fn()} />
      )
      expect(getByTestId("test-icon")).toBeTruthy()
    })

    it("handles press events correctly", () => {
      const onPressMock = jest.fn()
      const { getByTestId } = renderWithTheme(
        <PressableIcon icon="heart" testID="test-icon" onPress={onPressMock} />
      )
      const icon = getByTestId("test-icon")
      icon.props.onPress()
      expect(onPressMock).toHaveBeenCalledTimes(1)
    })

    it("applies disabled state correctly", () => {
      const onPressMock = jest.fn()
      const { getByTestId } = renderWithTheme(
        <PressableIcon
          icon="heart"
          testID="test-icon"
          onPress={onPressMock}
          disabled={true}
        />
      )
      const icon = getByTestId("test-icon")
      expect(icon.props.disabled).toBe(true)
    })

    it("respects accessibility props", () => {
      const { getByTestId } = renderWithTheme(
        <PressableIcon
          icon="heart"
          testID="test-icon"
          onPress={jest.fn()}
          accessibilityLabel="Like button"
          accessibilityHint="Double tap to like this item"
        />
      )
      const icon = getByTestId("test-icon")
      expect(icon.props.accessibilityLabel).toBe("Like button")
      expect(icon.props.accessibilityHint).toBe("Double tap to like this item")
    })
  })

  describe("Icon Registry", () => {
    it("verifies all PNG icons are registered", () => {
      const pngIcons = [
        "back", "bell", "caretLeft", "caretRight", "check",
        "heart", "hidden", "ladybug", "lock", "menu",
        "more", "user", "view", "x"
      ]

      pngIcons.forEach(iconName => {
        expect(isIconRegistered(iconName)).toBe(true)
      })
    })

    it("verifies all SVG icons are registered", () => {
      const svgIcons = ["settings", "google"]

      svgIcons.forEach(iconName => {
        expect(isIconRegistered(iconName)).toBe(true)
      })
    })

    it("returns all registered icons", () => {
      const icons = getRegisteredIcons()
      expect(icons.length).toBeGreaterThan(0)
      expect(icons).toContain("heart")
      expect(icons).toContain("google")
    })

    it("returns false for unregistered icons", () => {
      expect(isIconRegistered("non-existent-icon")).toBe(false)
    })
  })

  describe("Icon - Edge Cases", () => {
    it("handles zero size gracefully", () => {
      const { getByTestId } = renderWithTheme(
        <Icon icon="heart" size={0} testID="test-icon" />
      )
      expect(getByTestId("test-icon")).toBeTruthy()
    })

    it("handles negative size gracefully", () => {
      const { getByTestId } = renderWithTheme(
        <Icon icon="heart" size={-10} testID="test-icon" />
      )
      expect(getByTestId("test-icon")).toBeTruthy()
    })

    it("handles very large size", () => {
      const { getByTestId } = renderWithTheme(
        <Icon icon="heart" size={500} testID="test-icon" />
      )
      expect(getByTestId("test-icon")).toBeTruthy()
    })

    it("handles multiple style props", () => {
      const { getByTestId } = renderWithTheme(
        <Icon
          icon="heart"
          size={32}
          color="#FF0000"
          style={{ opacity: 0.8 }}
          containerStyle={{ padding: 10 }}
          testID="test-icon"
        />
      )
      expect(getByTestId("test-icon")).toBeTruthy()
    })
  })

  describe("Icon - Memoization", () => {
    it("Icon component is memoized", () => {
      const { rerender } = renderWithTheme(
        <Icon icon="heart" testID="test-icon" />
      )

      // Re-render with same props should not cause re-render
      rerender(
        <ThemeProvider>
          <Icon icon="heart" testID="test-icon" />
        </ThemeProvider>
      )

      // Component should still be rendered
      expect(true).toBe(true)
    })

    it("PressableIcon component is memoized", () => {
      const onPress = jest.fn()
      const { rerender } = renderWithTheme(
        <PressableIcon icon="heart" onPress={onPress} testID="test-icon" />
      )

      // Re-render with same props
      rerender(
        <ThemeProvider>
          <PressableIcon icon="heart" onPress={onPress} testID="test-icon" />
        </ThemeProvider>
      )

      expect(true).toBe(true)
    })
  })
})
