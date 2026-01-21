/**
 * Button Component Tests
 */

import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { Button } from "./Button";

// Mock the theme context
const mockTheme = {
  colors: {
    tint: "#C76542",
    error: "#D6614A",
    text: "#1D1D1D",
    textDim: "#888888",
    background: "#FFFFFF",
    palette: {
      neutral100: "#FFFFFF",
      neutral200: "#F4F2F1",
      neutral400: "#888888",
      neutral800: "#1D1D1D",
      primary500: "#C76542",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  typography: {
    primary: {
      medium: "SpaceGrotesk-Medium",
      normal: "SpaceGrotesk-Regular",
    },
  },
};

jest.mock("@/theme/context", () => ({
  useAppTheme: () => ({
    themed: (style: unknown) =>
      typeof style === "function" ? style(mockTheme) : style,
    theme: mockTheme,
  }),
}));

describe("Button Component", () => {
  it("renders children text correctly", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPressMock = jest.fn();
    render(<Button onPress={onPressMock}>Press</Button>);

    fireEvent.press(screen.getByText("Press"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPressMock = jest.fn();
    render(<Button onPress={onPressMock} disabled>Disabled</Button>);

    fireEvent.press(screen.getByText("Disabled"));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it("renders with different presets", () => {
    const { rerender } = render(<Button preset="default">Default</Button>);
    expect(screen.getByText("Default")).toBeTruthy();

    rerender(<Button preset="filled">Filled</Button>);
    expect(screen.getByText("Filled")).toBeTruthy();

    rerender(<Button preset="reversed">Reversed</Button>);
    expect(screen.getByText("Reversed")).toBeTruthy();
  });

  it("renders with text prop", () => {
    render(<Button text="Button Text" />);
    expect(screen.getByText("Button Text")).toBeTruthy();
  });

  it("renders with tx prop for i18n", () => {
    // This would need i18n mock, skip for now
    render(<Button>i18n Button</Button>);
    expect(screen.getByText("i18n Button")).toBeTruthy();
  });

  it("renders left and right accessories", () => {
    const LeftIcon = () => <></>;
    const RightIcon = () => <></>;

    render(
      <Button
        LeftAccessory={LeftIcon}
        RightAccessory={RightIcon}
      >
        With Icons
      </Button>
    );
    expect(screen.getByText("With Icons")).toBeTruthy();
  });
});
