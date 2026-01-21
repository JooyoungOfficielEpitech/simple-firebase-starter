/**
 * Chip Component Tests
 */

import { render, fireEvent } from "@testing-library/react-native";
import React from "react";

import { Chip, ChipGroup } from "./Chip";

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
              border: "#CCCCCC",
              error: "#FF3B30",
              palette: {
                neutral100: "#FFFFFF",
                neutral200: "#F5F5F5",
                neutral300: "#E0E0E0",
                neutral400: "#BDBDBD",
                neutral500: "#9E9E9E",
                secondary500: "#4CAF50",
                accent500: "#FFC107",
              },
            },
            spacing: { xxs: 2, xs: 4, sm: 8, md: 16 },
            typography: {
              primary: { medium: "System" },
            },
          })
        : style,
    theme: {
      colors: {
        tint: "#007AFF",
        text: "#000000",
        textDim: "#666666",
        border: "#CCCCCC",
        error: "#FF3B30",
        palette: {
          neutral100: "#FFFFFF",
          neutral200: "#F5F5F5",
          neutral300: "#E0E0E0",
          neutral400: "#BDBDBD",
          neutral500: "#9E9E9E",
          secondary500: "#4CAF50",
          accent500: "#FFC107",
        },
      },
    },
  }),
}));

// Mock Icon component
jest.mock("./Icon", () => ({
  Icon: ({ icon, size, color }: { icon: string; size: number; color: string }) => {
    const { Text } = require("react-native");
    return <Text testID={`icon-${icon}`}>{icon}</Text>;
  },
}));

describe("Chip", () => {
  it("renders with label", () => {
    const { getByText } = render(<Chip label="Test Chip" />);
    expect(getByText("Test Chip")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(<Chip label="Pressable Chip" onPress={onPress} />);

    fireEvent.press(getByText("Pressable Chip"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Chip label="Disabled Chip" onPress={onPress} disabled />
    );

    fireEvent.press(getByText("Disabled Chip"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders with selected state", () => {
    const { getByText } = render(<Chip label="Selected Chip" selected />);
    expect(getByText("Selected Chip")).toBeTruthy();
  });

  it("renders with different sizes", () => {
    const { rerender, getByText } = render(<Chip label="Small" size="sm" />);
    expect(getByText("Small")).toBeTruthy();

    rerender(<Chip label="Medium" size="md" />);
    expect(getByText("Medium")).toBeTruthy();

    rerender(<Chip label="Large" size="lg" />);
    expect(getByText("Large")).toBeTruthy();
  });

  it("renders with different variants", () => {
    const { rerender, getByText } = render(<Chip label="Filled" variant="filled" />);
    expect(getByText("Filled")).toBeTruthy();

    rerender(<Chip label="Outlined" variant="outlined" />);
    expect(getByText("Outlined")).toBeTruthy();

    rerender(<Chip label="Soft" variant="soft" />);
    expect(getByText("Soft")).toBeTruthy();
  });

  it("renders with different colors", () => {
    const colors: Array<"default" | "primary" | "secondary" | "success" | "warning" | "error"> = [
      "default",
      "primary",
      "secondary",
      "success",
      "warning",
      "error",
    ];

    colors.forEach((color) => {
      const { getByText } = render(<Chip label={`${color} chip`} color={color} />);
      expect(getByText(`${color} chip`)).toBeTruthy();
    });
  });

  it("calls onRemove when remove icon is pressed", () => {
    const onRemove = jest.fn();
    const { getByTestId } = render(<Chip label="Removable" onRemove={onRemove} />);

    fireEvent.press(getByTestId("icon-x"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe("ChipGroup", () => {
  const options = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
  ];

  it("renders all options", () => {
    const { getByText } = render(<ChipGroup options={options} />);

    expect(getByText("Option 1")).toBeTruthy();
    expect(getByText("Option 2")).toBeTruthy();
    expect(getByText("Option 3")).toBeTruthy();
  });

  it("calls onChange with selected value in single mode", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <ChipGroup options={options} onChange={onChange} />
    );

    fireEvent.press(getByText("Option 1"));
    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("calls onChange with array of values in multiple mode", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <ChipGroup options={options} value={["1"]} onChange={onChange} multiple />
    );

    fireEvent.press(getByText("Option 2"));
    expect(onChange).toHaveBeenCalledWith(["1", "2"]);
  });

  it("removes value when already selected in multiple mode", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <ChipGroup options={options} value={["1", "2"]} onChange={onChange} multiple />
    );

    fireEvent.press(getByText("Option 1"));
    expect(onChange).toHaveBeenCalledWith(["2"]);
  });
});
