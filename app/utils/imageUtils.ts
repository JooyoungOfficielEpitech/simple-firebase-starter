/**
 * 이미지 관련 유틸리티 함수
 */

/**
 * 파일 크기 포맷팅 (bytes -> KB/MB)
 * @param bytes 바이트 크기
 * @returns 포맷팅된 문자열
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * 고유 파일명 생성
 * @param extension 파일 확장자 (예: 'jpg', 'png')
 * @returns 고유한 파일명
 */
export function generateUniqueFileName(extension?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const ext = extension ? `.${extension.replace(/^\./, "")}` : "";

  return `${timestamp}_${randomString}${ext}`;
}

/**
 * 이미지 URI에서 확장자 추출
 * @param uri 이미지 URI
 * @returns 확장자 (기본값: 'jpg')
 */
export function getImageExtension(uri: string): string {
  // URI에서 파일명 부분 추출
  const fileName = uri.split("/").pop() || "";

  // 확장자 추출
  const match = fileName.match(/\.(\w+)(?:\?.*)?$/);

  if (match) {
    const ext = match[1].toLowerCase();
    // 지원되는 이미지 확장자 확인
    if (["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"].includes(ext)) {
      return ext;
    }
  }

  // 기본값
  return "jpg";
}

/**
 * Storage 경로 생성
 * @param userId 사용자 ID
 * @param folder 폴더 타입
 * @param fileName 파일명 (선택)
 * @returns Storage 경로
 */
export function buildStoragePath(
  userId: string,
  folder: "profile" | "photos" | "temp",
  fileName?: string,
): string {
  const basePath = `users/${userId}/${folder}`;

  if (fileName) {
    return `${basePath}/${fileName}`;
  }

  return basePath;
}

/**
 * 이미지 비율 계산 (리사이즈용)
 * @param width 원본 너비
 * @param height 원본 높이
 * @param maxSize 최대 크기
 * @returns 계산된 너비와 높이
 */
export function calculateAspectRatio(
  width: number,
  height: number,
  maxSize: number,
): { width: number; height: number } {
  if (width <= maxSize && height <= maxSize) {
    return { width, height };
  }

  const aspectRatio = width / height;

  if (width > height) {
    return {
      width: maxSize,
      height: Math.round(maxSize / aspectRatio),
    };
  } else {
    return {
      width: Math.round(maxSize * aspectRatio),
      height: maxSize,
    };
  }
}

/**
 * 이미지 URI가 로컬 파일인지 확인
 * @param uri 이미지 URI
 * @returns 로컬 파일 여부
 */
export function isLocalImageUri(uri: string): boolean {
  return (
    uri.startsWith("file://") ||
    uri.startsWith("content://") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library://")
  );
}

/**
 * 이미지 URI가 원격 URL인지 확인
 * @param uri 이미지 URI
 * @returns 원격 URL 여부
 */
export function isRemoteImageUri(uri: string): boolean {
  return uri.startsWith("http://") || uri.startsWith("https://");
}

/**
 * Firebase Storage URL인지 확인
 * @param url URL 문자열
 * @returns Firebase Storage URL 여부
 */
export function isFirebaseStorageUrl(url: string): boolean {
  return (
    url.includes("firebasestorage.googleapis.com") ||
    url.includes("storage.googleapis.com")
  );
}
