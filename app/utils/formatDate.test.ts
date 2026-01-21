/**
 * formatDate Utility Tests
 */

import { formatDate, loadDateFnsLocale } from "./formatDate";

// Mock i18next
jest.mock("i18next", () => ({
  language: "en-US",
}));

describe("formatDate Utility", () => {
  const testDateString = "2024-01-15T14:30:00Z";

  beforeAll(() => {
    loadDateFnsLocale();
  });

  it("formats date with default format", () => {
    const result = formatDate(testDateString);
    expect(result).toBeTruthy();
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("formats date with custom format", () => {
    const result = formatDate(testDateString, "yyyy-MM-dd");
    expect(result).toBe("2024-01-15");
  });

  it("formats with year-month format", () => {
    const result = formatDate(testDateString, "yyyy/MM");
    expect(result).toBe("2024/01");
  });

  it("formats with different date formats", () => {
    const shortDate = formatDate(testDateString, "MM/dd/yyyy");
    expect(shortDate).toBe("01/15/2024");

    const isoFormat = formatDate(testDateString, "yyyy-MM-dd");
    expect(isoFormat).toBe("2024-01-15");
  });
});
