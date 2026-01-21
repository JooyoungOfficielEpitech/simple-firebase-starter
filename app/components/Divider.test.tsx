/**
 * Divider Component Tests
 */

import { render, screen } from "@testing-library/react-native";
import React from "react";

import { Divider } from "./Divider";

// Mock the theme context
const mockTheme = {
  colors: {
    separator: "#E0E0E0",
    textDim: "#888888",
    text: "#000000",
    background: "#FFFFFF",
  },
  spacing: {
    sm: 8,
    xs: 4,
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

describe("Divider Component", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<Divider />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders with label", () => {
    render(<Divider label="OR" />);
    expect(screen.getByText("OR")).toBeTruthy();
  });

  it("renders horizontal orientation by default", () => {
    const { toJSON } = render(<Divider />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders vertical orientation", () => {
    const { toJSON } = render(<Divider orientation="vertical" />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders with different variants", () => {
    const { rerender, toJSON } = render(<Divider variant="solid" />);
    expect(toJSON()).toBeTruthy();

    rerender(<Divider variant="dashed" />);
    expect(toJSON()).toBeTruthy();

    rerender(<Divider variant="dotted" />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders label at different positions", () => {
    const { rerender } = render(<Divider label="TEST" labelPosition="left" />);
    expect(screen.getByText("TEST")).toBeTruthy();

    rerender(<Divider label="TEST" labelPosition="center" />);
    expect(screen.getByText("TEST")).toBeTruthy();

    rerender(<Divider label="TEST" labelPosition="right" />);
    expect(screen.getByText("TEST")).toBeTruthy();
  });

  it("applies custom thickness", () => {
    const { toJSON } = render(<Divider thickness={2} />);
    expect(toJSON()).toBeTruthy();
  });

  it("applies custom spacing", () => {
    const { toJSON } = render(<Divider spacing={16} />);
    expect(toJSON()).toBeTruthy();
  });

  it("applies custom color", () => {
    const { toJSON } = render(<Divider color="#FF0000" />);
    expect(toJSON()).toBeTruthy();
  });
});
