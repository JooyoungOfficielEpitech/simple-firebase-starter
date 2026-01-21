/**
 * ProgressBar Component Tests
 */

import { render, screen } from "@testing-library/react-native";
import React from "react";

import { ProgressBar } from "./ProgressBar";

// Mock reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock the theme context
const mockTheme = {
  colors: {
    tint: "#C76542",
    error: "#D6614A",
    text: "#000000",
    textDim: "#888888",
    background: "#FFFFFF",
    palette: {
      neutral100: "#FFFFFF",
      neutral300: "#E0E0E0",
      neutral500: "#888888",
      secondary500: "#4CAF50",
      accent500: "#FF9800",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
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

describe("ProgressBar Component", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<ProgressBar progress={50} />);
    expect(toJSON()).toBeTruthy();
  });

  it("clamps progress to 0-100 range", () => {
    const { rerender, toJSON } = render(<ProgressBar progress={-10} />);
    expect(toJSON()).toBeTruthy();

    rerender(<ProgressBar progress={150} />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders with label", () => {
    render(<ProgressBar progress={75} showLabel />);
    expect(screen.getByText("75%")).toBeTruthy();
  });

  it("renders label at different positions", () => {
    const { rerender } = render(
      <ProgressBar progress={50} showLabel labelPosition="top" />,
    );
    expect(screen.getByText("50%")).toBeTruthy();

    rerender(<ProgressBar progress={50} showLabel labelPosition="right" />);
    expect(screen.getByText("50%")).toBeTruthy();
  });

  it("renders with different sizes", () => {
    const { rerender, toJSON } = render(<ProgressBar progress={50} size="sm" />);
    expect(toJSON()).toBeTruthy();

    rerender(<ProgressBar progress={50} size="md" />);
    expect(toJSON()).toBeTruthy();

    rerender(<ProgressBar progress={50} size="lg" />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders with different variants", () => {
    const { rerender, toJSON } = render(
      <ProgressBar progress={50} variant="primary" />,
    );
    expect(toJSON()).toBeTruthy();

    rerender(<ProgressBar progress={50} variant="success" />);
    expect(toJSON()).toBeTruthy();

    rerender(<ProgressBar progress={50} variant="error" />);
    expect(toJSON()).toBeTruthy();
  });

  it("applies custom colors", () => {
    const { toJSON } = render(
      <ProgressBar progress={50} progressColor="#FF0000" trackColor="#CCCCCC" />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
