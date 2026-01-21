import { type FC, useCallback, useState } from "react";
import { Alert, type TextStyle, View, type ViewStyle } from "react-native";

import { Button } from "@/components/Button";
import { ImageGallery } from "@/components/ImageGallery";
import { ImagePickerButton } from "@/components/ImagePickerButton";
import { ImageUploadProgress } from "@/components/ImageUploadProgress";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { imageService } from "@/services/storage/imageService";
import type {
  ImagePickerResult,
  UploadProgress,
  UploadResult,
} from "@/services/storage/storageTypes";
import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";

/**
 * Demo screen for image upload functionality.
 * Demonstrates ImagePickerButton, ImageUploadProgress, and ImageGallery components.
 */
export const ImageUploadDemoScreen: FC = function ImageUploadDemoScreen() {
  const { themed } = useAppTheme();

  // State for uploaded images
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // State for upload progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // State for selected image (before upload)
  const [selectedImage, setSelectedImage] = useState<ImagePickerResult | null>(
    null,
  );

  /**
   * Handle image source selection from ImagePickerButton
   */
  const handleSourceSelected = useCallback(
    async (source: "camera" | "gallery") => {
      try {
        const result = await imageService.pickImage(source);
        if (result) {
          setSelectedImage(result);
        }
      } catch (error) {
        console.error("[ImageUploadDemo] Image pick error:", error);
        Alert.alert("오류", "이미지를 선택하는 중 오류가 발생했습니다.");
      }
    },
    [],
  );

  /**
   * Handle image upload
   */
  const handleUpload = useCallback(async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Compress the image
      const compressedUri = await imageService.compressImage(
        selectedImage.uri,
        {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8,
        },
      );

      // Upload to Firebase Storage
      const result: UploadResult = await imageService.uploadImage(
        compressedUri,
        {
          path: "demo/images",
          onProgress: (progress: UploadProgress) => {
            setUploadProgress(progress.progress);
          },
        },
      );

      // Add to uploaded images
      setUploadedImages((prev) => [...prev, result.downloadUrl]);

      // Clear selected image
      setSelectedImage(null);
      setUploadProgress(100);

      // Show success message
      Alert.alert("완료", "이미지가 성공적으로 업로드되었습니다.");
    } catch (error) {
      console.error("[ImageUploadDemo] Upload error:", error);
      Alert.alert("오류", "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1500);
    }
  }, [selectedImage]);

  /**
   * Handle upload cancellation
   */
  const handleCancelUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    Alert.alert("취소됨", "업로드가 취소되었습니다.");
  }, []);

  /**
   * Handle image press in gallery
   */
  const handleImagePress = useCallback((index: number) => {
    Alert.alert("이미지 선택", `${index + 1}번 이미지가 선택되었습니다.`);
  }, []);

  /**
   * Handle add press in gallery
   */
  const handleGalleryAddPress = useCallback(async () => {
    // Use gallery as default for adding from gallery view
    await handleSourceSelected("gallery");
  }, [handleSourceSelected]);

  /**
   * Handle image deletion
   */
  const handleDeleteImage = useCallback((index: number) => {
    Alert.alert("이미지 삭제", "이 이미지를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setUploadedImages((prev) => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  }, []);

  /**
   * Clear all images
   */
  const handleClearAll = useCallback(() => {
    Alert.alert("전체 삭제", "모든 이미지를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => setUploadedImages([]),
      },
    ]);
  }, []);

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={themed($screenContent)}
      safeAreaEdges={["top"]}
    >
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($title)} preset="heading">
          이미지 업로드 데모
        </Text>
        <Text style={themed($subtitle)}>
          이미지 선택, 업로드, 갤러리 컴포넌트 테스트
        </Text>
      </View>

      {/* Image Picker Section */}
      <View style={themed($section)}>
        <Text style={themed($sectionTitle)}>이미지 선택</Text>
        <View style={themed($pickerRow)}>
          <ImagePickerButton
            source="camera"
            onSourceSelected={handleSourceSelected}
            label="카메라"
            disabled={isUploading}
            style={themed($pickerButton)}
          />
          <ImagePickerButton
            source="gallery"
            onSourceSelected={handleSourceSelected}
            label="갤러리"
            disabled={isUploading}
            style={themed($pickerButton)}
          />
          <ImagePickerButton
            source="both"
            onSourceSelected={handleSourceSelected}
            label="선택"
            disabled={isUploading}
            style={themed($pickerButton)}
          />
        </View>

        {/* Selected Image Preview */}
        {selectedImage && (
          <View style={themed($previewContainer)}>
            <Text style={themed($previewLabel)}>선택된 이미지:</Text>
            <Text style={themed($previewInfo)}>
              크기: {selectedImage.width} x {selectedImage.height}
            </Text>
            {selectedImage.fileSize && (
              <Text style={themed($previewInfo)}>
                파일 크기: {Math.round(selectedImage.fileSize / 1024)} KB
              </Text>
            )}
            <Button
              text="업로드"
              preset="cta"
              onPress={handleUpload}
              disabled={isUploading}
              isLoading={isUploading}
              style={themed($uploadButton)}
            />
          </View>
        )}
      </View>

      {/* Upload Progress Section */}
      {(isUploading || uploadProgress > 0) && (
        <View style={themed($section)}>
          <Text style={themed($sectionTitle)}>업로드 진행률</Text>
          <ImageUploadProgress
            progress={uploadProgress}
            isUploading={isUploading}
            onCancel={handleCancelUpload}
            variant="linear"
          />
          <View style={themed($progressVariantContainer)}>
            <ImageUploadProgress
              progress={uploadProgress}
              isUploading={isUploading}
              variant="circular"
            />
          </View>
        </View>
      )}

      {/* Gallery Section */}
      <View style={themed($section)}>
        <View style={themed($sectionHeader)}>
          <Text style={themed($sectionTitle)}>업로드된 이미지</Text>
          {uploadedImages.length > 0 && (
            <Button
              text="전체 삭제"
              preset="default"
              onPress={handleClearAll}
              style={themed($clearButton)}
              textStyle={themed($clearButtonText)}
            />
          )}
        </View>
        <ImageGallery
          images={uploadedImages}
          numColumns={3}
          onImagePress={handleImagePress}
          onAddPress={handleGalleryAddPress}
          showAddButton
          maxImages={9}
          showDeleteButton
          onDeletePress={handleDeleteImage}
          gap={8}
        />
      </View>
    </Screen>
  );
};

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  paddingBottom: spacing.xl,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
});

const $title: ThemedStyle<TextStyle> = () => ({
  fontSize: 24,
});

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginTop: spacing.xxs,
});

const $section: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  backgroundColor: colors.palette.neutral100,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: colors.separator,
});

const $sectionHeader: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
});

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.textDim,
  textTransform: "uppercase",
  marginBottom: spacing.md,
  letterSpacing: 0.5,
});

const $pickerRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-around",
  gap: spacing.sm,
});

const $pickerButton: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  minWidth: 90,
  minHeight: 90,
});

const $previewContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  marginTop: spacing.md,
  padding: spacing.md,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 8,
});

const $previewLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
});

const $previewInfo: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
});

const $uploadButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
});

const $progressVariantContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  alignItems: "center",
});

const $clearButton: ThemedStyle<ViewStyle> = () => ({
  minHeight: 32,
  paddingVertical: 4,
  paddingHorizontal: 12,
});

const $clearButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.error,
});
