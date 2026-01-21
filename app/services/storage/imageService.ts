import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import storage from "@react-native-firebase/storage";
import auth from "@react-native-firebase/auth";
import {
  ImageSource,
  ImagePickerResult,
  ImagePickerOptions,
  CompressionOptions,
  UploadOptions,
  UploadResult,
  UploadProgress,
} from "./storageTypes";
import {
  generateUniqueFileName,
  getImageExtension,
} from "../../utils/imageUtils";

/**
 * 이미지 업로드 서비스
 */
export class ImageService {
  private defaultCompressionOptions: CompressionOptions = {
    maxWidth: 1080,
    maxHeight: 1080,
    quality: 0.8,
    format: "jpeg",
  };

  /**
   * 이미지 선택 (카메라 또는 갤러리)
   */
  async pickImage(
    source: ImageSource,
    options?: ImagePickerOptions,
  ): Promise<ImagePickerResult | null> {
    try {
      // 권한 요청
      const permissionResult = await this.requestPermission(source);
      if (!permissionResult) {
        console.warn("[ImageService] 이미지 접근 권한이 거부되었습니다.");
        return null;
      }

      // 이미지 선택 옵션
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: this.mapMediaTypes(options?.mediaTypes),
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [1, 1],
        quality: options?.quality ?? 0.8,
        base64: options?.base64 ?? false,
      };

      // 이미지 선택
      let result: ImagePicker.ImagePickerResult;

      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync(pickerOptions);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      }

      // 취소된 경우
      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("[ImageService] 이미지 선택이 취소되었습니다.");
        return null;
      }

      const asset = result.assets[0];

      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.mimeType,
        fileName: asset.fileName ?? undefined,
        fileSize: asset.fileSize ?? undefined,
      };
    } catch (error) {
      console.error("[ImageService] 이미지 선택 오류:", error);
      throw error;
    }
  }

  /**
   * 권한 요청
   */
  private async requestPermission(source: ImageSource): Promise<boolean> {
    try {
      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === "granted";
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === "granted";
      }
    } catch (error) {
      console.error("[ImageService] 권한 요청 오류:", error);
      return false;
    }
  }

  /**
   * 미디어 타입 매핑
   */
  private mapMediaTypes(
    mediaTypes?: "images" | "videos" | "all",
  ): ImagePicker.MediaType[] {
    switch (mediaTypes) {
      case "videos":
        return ["videos"];
      case "all":
        return ["images", "videos"];
      case "images":
      default:
        return ["images"];
    }
  }

  /**
   * 이미지 압축
   */
  async compressImage(
    uri: string,
    options?: CompressionOptions,
  ): Promise<string> {
    try {
      const compressionOptions = {
        ...this.defaultCompressionOptions,
        ...options,
      };

      const actions: ImageManipulator.Action[] = [];

      // 리사이즈 액션 추가
      if (compressionOptions.maxWidth || compressionOptions.maxHeight) {
        actions.push({
          resize: {
            width: compressionOptions.maxWidth,
            height: compressionOptions.maxHeight,
          },
        });
      }

      // 이미지 조작 실행
      const result = await ImageManipulator.manipulateAsync(uri, actions, {
        compress: compressionOptions.quality ?? 0.8,
        format:
          compressionOptions.format === "png"
            ? ImageManipulator.SaveFormat.PNG
            : ImageManipulator.SaveFormat.JPEG,
      });

      console.log("[ImageService] 이미지 압축 완료:", result.uri);
      return result.uri;
    } catch (error) {
      console.error("[ImageService] 이미지 압축 오류:", error);
      throw error;
    }
  }

  /**
   * Firebase Storage 업로드
   */
  async uploadImage(
    uri: string,
    options: UploadOptions,
  ): Promise<UploadResult> {
    try {
      // 현재 사용자 확인
      const user = auth().currentUser;
      if (!user) {
        throw new Error("사용자가 로그인되어 있지 않습니다.");
      }

      // 파일명 생성
      const extension = getImageExtension(uri);
      const fileName = options.fileName ?? generateUniqueFileName(extension);

      // Storage 경로 생성
      const storagePath = `${options.path}/${fileName}`;

      // Storage 참조 생성
      const storageRef = storage().ref(storagePath);

      // 메타데이터 설정 (customMetadata는 string 값만 허용)
      const settableMetadata = options.metadata
        ? { customMetadata: options.metadata }
        : undefined;

      // 업로드 태스크 생성
      const uploadTask = storageRef.putFile(uri, settableMetadata);

      // 진행 상태 모니터링
      if (options.onProgress) {
        uploadTask.on("state_changed", (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options.onProgress?.({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress: Math.round(progress),
          });
        });
      }

      // 업로드 완료 대기
      await uploadTask;

      // 다운로드 URL 가져오기
      const downloadUrl = await storageRef.getDownloadURL();

      // 메타데이터 가져오기
      const metadata = await storageRef.getMetadata();

      console.log("[ImageService] 이미지 업로드 완료:", storagePath);

      return {
        downloadUrl,
        path: storagePath,
        fileName,
        size: metadata.size,
      };
    } catch (error) {
      console.error("[ImageService] 이미지 업로드 오류:", error);
      throw error;
    }
  }

  /**
   * 이미지 다운로드 URL 가져오기
   */
  async getDownloadUrl(path: string): Promise<string> {
    try {
      const storageRef = storage().ref(path);
      const downloadUrl = await storageRef.getDownloadURL();
      return downloadUrl;
    } catch (error) {
      console.error("[ImageService] 다운로드 URL 가져오기 오류:", error);
      throw error;
    }
  }

  /**
   * 이미지 삭제
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const storageRef = storage().ref(path);
      await storageRef.delete();
      console.log("[ImageService] 이미지 삭제 완료:", path);
    } catch (error) {
      console.error("[ImageService] 이미지 삭제 오류:", error);
      throw error;
    }
  }

  /**
   * 다중 이미지 업로드
   */
  async uploadMultipleImages(
    uris: string[],
    basePath: string,
    onProgress?: (index: number, progress: UploadProgress) => void,
  ): Promise<UploadResult[]> {
    try {
      const results: UploadResult[] = [];

      for (let i = 0; i < uris.length; i++) {
        const uri = uris[i];

        const result = await this.uploadImage(uri, {
          path: basePath,
          onProgress: onProgress
            ? (progress) => onProgress(i, progress)
            : undefined,
        });

        results.push(result);
        console.log(
          `[ImageService] 이미지 업로드 ${i + 1}/${uris.length} 완료`,
        );
      }

      console.log("[ImageService] 다중 이미지 업로드 완료:", results.length);
      return results;
    } catch (error) {
      console.error("[ImageService] 다중 이미지 업로드 오류:", error);
      throw error;
    }
  }

  /**
   * 이미지 선택 및 업로드 (편의 메서드)
   */
  async pickAndUploadImage(
    source: ImageSource,
    uploadPath: string,
    options?: {
      pickerOptions?: ImagePickerOptions;
      compressionOptions?: CompressionOptions;
      onProgress?: (progress: UploadProgress) => void;
    },
  ): Promise<UploadResult | null> {
    try {
      // 이미지 선택
      const pickedImage = await this.pickImage(source, options?.pickerOptions);
      if (!pickedImage) {
        return null;
      }

      // 이미지 압축
      const compressedUri = await this.compressImage(
        pickedImage.uri,
        options?.compressionOptions,
      );

      // 이미지 업로드
      const uploadResult = await this.uploadImage(compressedUri, {
        path: uploadPath,
        onProgress: options?.onProgress,
      });

      return uploadResult;
    } catch (error) {
      console.error("[ImageService] 이미지 선택 및 업로드 오류:", error);
      throw error;
    }
  }
}

// Singleton 패턴
export const imageService = new ImageService();
