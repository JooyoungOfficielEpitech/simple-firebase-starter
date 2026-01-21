/**
 * Select Component Tests
 */

import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { Select, SelectOption } from "./Select";

// Mock the theme context
const mockTheme = {
  colors: {
    tint: "#C76542",
    error: "#D6614A",
    text: "#1D1D1D",
    textDim: "#888888",
    background: "#FFFFFF",
    separator: "#E0E0E0",
    palette: {
      neutral200: "#F4F2F1",
      neutral300: "#E0E0E0",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
  },
};

jest.mock("@/theme/context", () => ({
  useAppTheme: () => ({
    themed: (style: unknown) =>
      typeof style === "function" ? style(mockTheme) : style,
    theme: mockTheme,
  }),
}));

// Mock reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

const mockOptions: SelectOption[] = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3", disabled: true },
];

describe("Select Component", () => {
  it("renders placeholder when no value selected", () => {
    render(
      <Select
        options={mockOptions}
        onChange={() => {}}
        placeholder="Select an option"
      />
    );
    expect(screen.getByText("Select an option")).toBeTruthy();
  });

  it("renders selected option label", () => {
    render(
      <Select
        options={mockOptions}
        value="1"
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Option 1")).toBeTruthy();
  });

  it("renders label when provided", () => {
    render(
      <Select
        options={mockOptions}
        onChange={() => {}}
        label="Choose Option"
      />
    );
    expect(screen.getByText("Choose Option")).toBeTruthy();
  });

  it("renders error message when provided", () => {
    render(
      <Select
        options={mockOptions}
        onChange={() => {}}
        error="This field is required"
      />
    );
    expect(screen.getByText("This field is required")).toBeTruthy();
  });

  it("does not open when disabled", () => {
    render(
      <Select
        options={mockOptions}
        onChange={() => {}}
        disabled
        placeholder="Disabled Select"
      />
    );

    fireEvent.press(screen.getByText("Disabled Select"));
    // Modal should not open, so options should not be visible
    expect(screen.queryByText("Option 1")).toBeNull();
  });
});
