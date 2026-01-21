/**
 * Image Utils Tests
 */

import {
  formatFileSize,
  generateUniqueFileName,
  getImageExtension,
  buildStoragePath,
  calculateAspectRatio,
  isLocalImageUri,
  isRemoteImageUri,
  isFirebaseStorageUrl,
} from "./imageUtils";

describe("Image Utils", () => {
  describe("formatFileSize", () => {
    it("should return 0 Bytes for 0", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
    });

    it("should format bytes correctly", () => {
      expect(formatFileSize(500)).toContain("Bytes");
    });

    it("should format kilobytes correctly", () => {
      expect(formatFileSize(1024)).toContain("KB");
      expect(formatFileSize(2048)).toContain("KB");
    });

    it("should format megabytes correctly", () => {
      expect(formatFileSize(1024 * 1024)).toContain("MB");
    });

    it("should format gigabytes correctly", () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toContain("GB");
    });
  });

  describe("generateUniqueFileName", () => {
    it("should generate unique file names", () => {
      const name1 = generateUniqueFileName("jpg");
      const name2 = generateUniqueFileName("jpg");
      expect(name1).not.toBe(name2);
    });

    it("should include extension when provided", () => {
      const name = generateUniqueFileName("png");
      expect(name).toContain(".png");
    });

    it("should work without extension", () => {
      const name = generateUniqueFileName();
      expect(name).toBeTruthy();
      expect(name).not.toContain(".");
    });

    it("should handle extension with leading dot", () => {
      const name = generateUniqueFileName(".jpg");
      expect(name).toContain(".jpg");
      expect(name).not.toContain("..jpg");
    });
  });

  describe("getImageExtension", () => {
    it("should extract jpg extension", () => {
      expect(getImageExtension("file:///path/to/image.jpg")).toBe("jpg");
    });

    it("should extract png extension", () => {
      expect(getImageExtension("https://example.com/photo.png")).toBe("png");
    });

    it("should handle query parameters", () => {
      expect(getImageExtension("https://example.com/photo.gif?token=123")).toBe("gif");
    });

    it("should return jpg as default for unknown extensions", () => {
      expect(getImageExtension("https://example.com/file")).toBe("jpg");
    });

    it("should handle uppercase extensions", () => {
      expect(getImageExtension("file:///photo.PNG").toLowerCase()).toBe("png");
    });
  });

  describe("buildStoragePath", () => {
    it("should build path with folder", () => {
      const path = buildStoragePath("user123", "profile");
      expect(path).toBe("users/user123/profile");
    });

    it("should build path with filename", () => {
      const path = buildStoragePath("user123", "photos", "image.jpg");
      expect(path).toBe("users/user123/photos/image.jpg");
    });

    it("should handle different folder types", () => {
      expect(buildStoragePath("u1", "profile")).toContain("profile");
      expect(buildStoragePath("u1", "photos")).toContain("photos");
      expect(buildStoragePath("u1", "temp")).toContain("temp");
    });
  });

  describe("calculateAspectRatio", () => {
    it("should return original dimensions if within maxSize", () => {
      const result = calculateAspectRatio(100, 100, 500);
      expect(result.width).toBe(100);
      expect(result.height).toBe(100);
    });

    it("should scale down landscape image", () => {
      const result = calculateAspectRatio(1920, 1080, 500);
      expect(result.width).toBe(500);
      expect(result.height).toBeLessThan(500);
    });

    it("should scale down portrait image", () => {
      const result = calculateAspectRatio(1080, 1920, 500);
      expect(result.height).toBe(500);
      expect(result.width).toBeLessThan(500);
    });

    it("should maintain aspect ratio", () => {
      const originalRatio = 1920 / 1080;
      const result = calculateAspectRatio(1920, 1080, 500);
      const newRatio = result.width / result.height;
      expect(Math.abs(originalRatio - newRatio)).toBeLessThan(0.01);
    });
  });

  describe("isLocalImageUri", () => {
    it("should return true for file:// URIs", () => {
      expect(isLocalImageUri("file:///path/to/image.jpg")).toBe(true);
    });

    it("should return true for content:// URIs", () => {
      expect(isLocalImageUri("content://media/image")).toBe(true);
    });

    it("should return true for ph:// URIs", () => {
      expect(isLocalImageUri("ph://asset-id")).toBe(true);
    });

    it("should return false for http URIs", () => {
      expect(isLocalImageUri("http://example.com/image.jpg")).toBe(false);
    });

    it("should return false for https URIs", () => {
      expect(isLocalImageUri("https://example.com/image.jpg")).toBe(false);
    });
  });

  describe("isRemoteImageUri", () => {
    it("should return true for http URIs", () => {
      expect(isRemoteImageUri("http://example.com/image.jpg")).toBe(true);
    });

    it("should return true for https URIs", () => {
      expect(isRemoteImageUri("https://example.com/image.jpg")).toBe(true);
    });

    it("should return false for file URIs", () => {
      expect(isRemoteImageUri("file:///path/to/image.jpg")).toBe(false);
    });
  });

  describe("isFirebaseStorageUrl", () => {
    it("should return true for firebasestorage.googleapis.com URLs", () => {
      expect(
        isFirebaseStorageUrl("https://firebasestorage.googleapis.com/v0/b/bucket/o/file")
      ).toBe(true);
    });

    it("should return true for storage.googleapis.com URLs", () => {
      expect(
        isFirebaseStorageUrl("https://storage.googleapis.com/bucket/file")
      ).toBe(true);
    });

    it("should return false for other URLs", () => {
      expect(isFirebaseStorageUrl("https://example.com/image.jpg")).toBe(false);
    });
  });
});
