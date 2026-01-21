/**
 * 이미지 소스 타입
 */
export type ImageSource = "camera" | "gallery";

/**
 * 이미지 선택 결과
 */
export interface ImagePickerResult {
  /** 이미지 URI */
  uri: string;
  /** 이미지 너비 */
  width: number;
  /** 이미지 높이 */
  height: number;
  /** MIME 타입 */
  type?: string;
  /** 파일명 */
  fileName?: string;
  /** 파일 크기 (bytes) */
  fileSize?: number;
}

/**
 * 이미지 압축 옵션
 */
export interface CompressionOptions {
  /** 최대 너비 */
  maxWidth?: number;
  /** 최대 높이 */
  maxHeight?: number;
  /** 압축 품질 (0-1) */
  quality?: number;
  /** 출력 포맷 */
  format?: "jpeg" | "png";
}

/**
 * 업로드 진행 상태
 */
export interface UploadProgress {
  /** 전송된 바이트 */
  bytesTransferred: number;
  /** 전체 바이트 */
  totalBytes: number;
  /** 진행률 (0-100) */
  progress: number;
}

/**
 * 업로드 결과
 */
export interface UploadResult {
  /** 다운로드 URL */
  downloadUrl: string;
  /** Storage 경로 */
  path: string;
  /** 파일명 */
  fileName: string;
  /** 파일 크기 (bytes) */
  size: number;
}

/**
 * 업로드 옵션
 */
export interface UploadOptions {
  /** Storage 경로 (예: 'users/{uid}/profile') */
  path: string;
  /** 파일명 (선택, 자동 생성됨) */
  fileName?: string;
  /** 메타데이터 */
  metadata?: Record<string, string>;
  /** 진행 콜백 */
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * 이미지 선택 옵션
 */
export interface ImagePickerOptions {
  /** 편집 허용 여부 */
  allowsEditing?: boolean;
  /** 가로세로 비율 [x, y] */
  aspect?: [number, number];
  /** 품질 (0-1) */
  quality?: number;
  /** 미디어 타입 */
  mediaTypes?: "images" | "videos" | "all";
  /** base64 인코딩 포함 여부 */
  base64?: boolean;
}
