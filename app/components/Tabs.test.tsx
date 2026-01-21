/**
 * Tabs Component Tests
 */

import { render, fireEvent } from "@testing-library/react-native";
import React from "react";

import { Tabs, TabsProps } from "./Tabs";

// Mock theme context
jest.mock("@/theme/context", () => ({
  useAppTheme: () => ({
    themed: (style: unknown) =>
      typeof style === "function"
        ? style({
            colors: {
              tint: "#007AFF",
              text: "#000000",
              textDim: "#666666",
              background: "#FFFFFF",
              border: "#CCCCCC",
              error: "#FF3B30",
              palette: {
                neutral100: "#FFFFFF",
                neutral200: "#F5F5F5",
                neutral300: "#E0E0E0",
              },
            },
            spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
            typography: {
              primary: { medium: "System", bold: "System-Bold" },
            },
          })
        : style,
    theme: {
      colors: {
        tint: "#007AFF",
        text: "#000000",
        textDim: "#666666",
        background: "#FFFFFF",
        border: "#CCCCCC",
        error: "#FF3B30",
        palette: {
          neutral100: "#FFFFFF",
          neutral200: "#F5F5F5",
          neutral300: "#E0E0E0",
        },
      },
    },
  }),
}));

// Mock reanimated
jest.mock("react-native-reanimated", () => ({
  ...jest.requireActual("react-native-reanimated/mock"),
}));

describe("Tabs", () => {
  const defaultTabs: TabsProps["tabs"] = [
    { key: "tab1", label: "Tab 1" },
    { key: "tab2", label: "Tab 2" },
    { key: "tab3", label: "Tab 3" },
  ];

  it("renders all tabs", () => {
    const { getByText } = render(
      <Tabs tabs={defaultTabs} activeKey="tab1" onChange={() => {}} />
    );

    expect(getByText("Tab 1")).toBeTruthy();
    expect(getByText("Tab 2")).toBeTruthy();
    expect(getByText("Tab 3")).toBeTruthy();
  });

  it("calls onChange when tab is pressed", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <Tabs tabs={defaultTabs} activeKey="tab1" onChange={onChange} />
    );

    fireEvent.press(getByText("Tab 2"));
    expect(onChange).toHaveBeenCalledWith("tab2");
  });

  it("renders with different variants", () => {
    const variants: Array<TabsProps["variant"]> = ["default", "pills", "underline", "segmented"];

    variants.forEach((variant) => {
      const { getByText } = render(
        <Tabs
          tabs={defaultTabs}
          activeKey="tab1"
          onChange={() => {}}
          variant={variant}
        />
      );
      expect(getByText("Tab 1")).toBeTruthy();
    });
  });

  it("renders with different sizes", () => {
    const sizes: Array<TabsProps["size"]> = ["sm", "md", "lg"];

    sizes.forEach((size) => {
      const { getByText } = render(
        <Tabs
          tabs={defaultTabs}
          activeKey="tab1"
          onChange={() => {}}
          size={size}
        />
      );
      expect(getByText("Tab 1")).toBeTruthy();
    });
  });

  it("renders with fullWidth prop", () => {
    const { getByText } = render(
      <Tabs tabs={defaultTabs} activeKey="tab1" onChange={() => {}} fullWidth />
    );
    expect(getByText("Tab 1")).toBeTruthy();
  });

  it("renders disabled tab correctly", () => {
    const onChange = jest.fn();
    const tabsWithDisabled: TabsProps["tabs"] = [
      { key: "tab1", label: "Tab 1" },
      { key: "tab2", label: "Tab 2", disabled: true },
    ];

    const { getByText } = render(
      <Tabs tabs={tabsWithDisabled} activeKey="tab1" onChange={onChange} />
    );

    fireEvent.press(getByText("Tab 2"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
