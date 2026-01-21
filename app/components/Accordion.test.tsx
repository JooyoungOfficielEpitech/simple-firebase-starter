/**
 * Accordion Component Tests
 */

import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";

import { Accordion, AccordionItem } from "./Accordion";

// Mock the theme context
const mockTheme = {
  colors: {
    tint: "#C76542",
    text: "#1D1D1D",
    textDim: "#888888",
    background: "#FFFFFF",
    separator: "#E0E0E0",
    palette: {
      neutral100: "#FFFFFF",
      neutral200: "#F4F2F1",
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

// Mock LayoutAnimation
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  RN.LayoutAnimation.configureNext = jest.fn();
  return RN;
});

const mockItems: AccordionItem[] = [
  { id: "1", title: "Section 1", content: "Content 1" },
  { id: "2", title: "Section 2", content: "Content 2" },
  { id: "3", title: "Section 3", content: "Content 3" },
];

describe("Accordion Component", () => {
  it("renders all section titles", () => {
    render(<Accordion items={mockItems} />);

    expect(screen.getByText("Section 1")).toBeTruthy();
    expect(screen.getByText("Section 2")).toBeTruthy();
    expect(screen.getByText("Section 3")).toBeTruthy();
  });

  it("expands section on press", () => {
    render(<Accordion items={mockItems} />);

    fireEvent.press(screen.getByText("Section 1"));
    expect(screen.getByText("Content 1")).toBeTruthy();
  });

  it("collapses expanded section on second press", () => {
    render(<Accordion items={mockItems} />);

    // Expand
    fireEvent.press(screen.getByText("Section 1"));
    expect(screen.getByText("Content 1")).toBeTruthy();

    // Collapse
    fireEvent.press(screen.getByText("Section 1"));
    expect(screen.queryByText("Content 1")).toBeNull();
  });

  it("allows only one section open when allowMultiple is false", () => {
    render(<Accordion items={mockItems} allowMultiple={false} />);

    // Open first section
    fireEvent.press(screen.getByText("Section 1"));
    expect(screen.getByText("Content 1")).toBeTruthy();

    // Open second section - first should close
    fireEvent.press(screen.getByText("Section 2"));
    expect(screen.queryByText("Content 1")).toBeNull();
    expect(screen.getByText("Content 2")).toBeTruthy();
  });

  it("allows multiple sections open when allowMultiple is true", () => {
    render(<Accordion items={mockItems} allowMultiple={true} />);

    // Open first section
    fireEvent.press(screen.getByText("Section 1"));
    expect(screen.getByText("Content 1")).toBeTruthy();

    // Open second section - first should stay open
    fireEvent.press(screen.getByText("Section 2"));
    expect(screen.getByText("Content 1")).toBeTruthy();
    expect(screen.getByText("Content 2")).toBeTruthy();
  });

  it("respects defaultExpandedIds", () => {
    render(<Accordion items={mockItems} defaultExpandedIds={["2"]} />);

    expect(screen.queryByText("Content 1")).toBeNull();
    expect(screen.getByText("Content 2")).toBeTruthy();
    expect(screen.queryByText("Content 3")).toBeNull();
  });

  it("calls onExpandedChange callback", () => {
    const onChangeMock = jest.fn();
    render(<Accordion items={mockItems} onExpandedChange={onChangeMock} />);

    fireEvent.press(screen.getByText("Section 1"));
    expect(onChangeMock).toHaveBeenCalledWith(["1"]);
  });
});
