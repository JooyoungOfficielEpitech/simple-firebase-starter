/**
 * Card Component Tests
 */

import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { Card } from "./Card";

// Mock the theme context
const mockTheme = {
  colors: {
    tint: "#C76542",
    text: "#1D1D1D",
    textDim: "#888888",
    background: "#FFFFFF",
    palette: {
      neutral100: "#FFFFFF",
      neutral200: "#F4F2F1",
      neutral300: "#E0E0E0",
      neutral500: "#888888",
      neutral800: "#1D1D1D",
    },
  },
  spacing: {
    xxxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
};

jest.mock("@/theme/context", () => ({
  useAppTheme: () => ({
    themed: (style: unknown) => {
      if (Array.isArray(style)) {
        return style.map((s) => (typeof s === "function" ? s(mockTheme) : s));
      }
      return typeof style === "function" ? style(mockTheme) : style;
    },
    theme: mockTheme,
  }),
}));

describe("Card Component", () => {
  it("renders heading correctly", () => {
    render(<Card heading="Card Heading" />);
    expect(screen.getByText("Card Heading")).toBeTruthy();
  });

  it("renders content correctly", () => {
    render(<Card content="Card Content" />);
    expect(screen.getByText("Card Content")).toBeTruthy();
  });

  it("renders footer correctly", () => {
    render(<Card footer="Card Footer" />);
    expect(screen.getByText("Card Footer")).toBeTruthy();
  });

  it("renders heading, content, and footer together", () => {
    render(
      <Card
        heading="Card Heading"
        content="Card Content"
        footer="Card Footer"
      />
    );
    expect(screen.getByText("Card Heading")).toBeTruthy();
    expect(screen.getByText("Card Content")).toBeTruthy();
    expect(screen.getByText("Card Footer")).toBeTruthy();
  });

  it("handles press events", () => {
    const onPressMock = jest.fn();
    render(<Card heading="Pressable Card" onPress={onPressMock} />);

    fireEvent.press(screen.getByText("Pressable Card"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("renders with preset 'default'", () => {
    render(<Card heading="Default Card" preset="default" />);
    expect(screen.getByText("Default Card")).toBeTruthy();
  });

  it("renders with preset 'reversed'", () => {
    render(<Card heading="Reversed Card" preset="reversed" />);
    expect(screen.getByText("Reversed Card")).toBeTruthy();
  });

  it("renders with custom HeadingComponent", () => {
    render(
      <Card HeadingComponent={<Text>Custom Heading</Text>} />
    );
    expect(screen.getByText("Custom Heading")).toBeTruthy();
  });

  it("renders with custom ContentComponent", () => {
    render(
      <Card ContentComponent={<Text>Custom Content</Text>} />
    );
    expect(screen.getByText("Custom Content")).toBeTruthy();
  });

  it("renders with custom FooterComponent", () => {
    render(
      <Card FooterComponent={<Text>Custom Footer</Text>} />
    );
    expect(screen.getByText("Custom Footer")).toBeTruthy();
  });

  it("renders with LeftComponent", () => {
    render(
      <Card
        heading="Card with Left"
        LeftComponent={<Text>Left Icon</Text>}
      />
    );
    expect(screen.getByText("Left Icon")).toBeTruthy();
    expect(screen.getByText("Card with Left")).toBeTruthy();
  });

  it("renders with RightComponent", () => {
    render(
      <Card
        heading="Card with Right"
        RightComponent={<Text>Right Icon</Text>}
      />
    );
    expect(screen.getByText("Right Icon")).toBeTruthy();
    expect(screen.getByText("Card with Right")).toBeTruthy();
  });

  it("renders with different vertical alignments", () => {
    const alignments = ["top", "center", "space-between", "force-footer-bottom"] as const;

    alignments.forEach((alignment) => {
      const { unmount } = render(
        <Card
          heading="Aligned Card"
          content="Content"
          footer="Footer"
          verticalAlignment={alignment}
        />
      );
      expect(screen.getByText("Aligned Card")).toBeTruthy();
      unmount();
    });
  });
});
