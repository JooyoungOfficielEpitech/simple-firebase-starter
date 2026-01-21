/**
 * Badge Component Tests
 */

import { render, screen } from "@testing-library/react-native";
import React from "react";

import { Badge } from "./Badge";

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
      neutral400: "#888888",
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

describe("Badge Component", () => {
  it("renders text correctly", () => {
    render(<Badge text="NEW" />);
    expect(screen.getByText("NEW")).toBeTruthy();
  });

  it("renders count correctly", () => {
    render(<Badge count={5} />);
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("displays 99+ when count exceeds maxCount", () => {
    render(<Badge count={150} maxCount={99} />);
    expect(screen.getByText("99+")).toBeTruthy();
  });

  it("renders dot variant without text", () => {
    const { queryByText } = render(<Badge dot />);
    // Dot variant should not have any text
    expect(queryByText("")).toBeNull();
  });

  it("respects custom maxCount", () => {
    render(<Badge count={15} maxCount={10} />);
    expect(screen.getByText("10+")).toBeTruthy();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Badge text="SM" size="sm" />);
    expect(screen.getByText("SM")).toBeTruthy();

    rerender(<Badge text="MD" size="md" />);
    expect(screen.getByText("MD")).toBeTruthy();

    rerender(<Badge text="LG" size="lg" />);
    expect(screen.getByText("LG")).toBeTruthy();
  });

  it("renders with different variants", () => {
    const { rerender } = render(<Badge text="DEFAULT" variant="default" />);
    expect(screen.getByText("DEFAULT")).toBeTruthy();

    rerender(<Badge text="PRIMARY" variant="primary" />);
    expect(screen.getByText("PRIMARY")).toBeTruthy();

    rerender(<Badge text="ERROR" variant="error" />);
    expect(screen.getByText("ERROR")).toBeTruthy();
  });
});
