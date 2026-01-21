import { type FC, useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  type ImageStyle,
  Pressable,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";
import auth from "@react-native-firebase/auth";

import { Button } from "@/components/Button";
import { ImageGallery } from "@/components/ImageGallery";
import { ImagePickerButton } from "@/components/ImagePickerButton";
import { ImageUploadProgress } from "@/components/ImageUploadProgress";
import { Screen } from "@/components/Screen";
import { Text } from "@/components/Text";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/firestore";
import { imageService } from "@/services/storage/imageService";
import type {
  UploadProgress,
  UploadResult,
} from "@/services/storage/storageTypes";
import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";
import type { UserProfile, MIN_PROFILE_PHOTOS } from "@/types/user";

/**
 * Profile edit screen for updating user profile including profile photo and media.
 * Uses Avatar component pattern and integrates with imageService for Firebase Storage.
 */
export const ProfileEditScreen: FC = function ProfileEditScreen() {
  const { themed, theme } = useAppTheme();
  const { user } = useAuth();

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Profile photo state (main avatar)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadProgress, setPhotoUploadProgress] = useState(0);

  // Media gallery state
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);

  /**
   * Load user profile on mount
   */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const userProfile = await userService.getUserProfile();
        if (userProfile) {
          setProfile(userProfile);
          setDisplayName(userProfile.name || "");
          setMediaUrls(userProfile.media || []);
          // First media image as profile photo (or could use a separate profilePhotoUrl field)
          if (userProfile.media && userProfile.media.length > 0) {
            setProfilePhotoUrl(userProfile.media[0]);
          }
        }
      } catch (error) {
        console.error("[ProfileEdit] Failed to load profile:", error);
        Alert.alert("오류", "프로필을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  /**
   * Handle profile photo selection
   */
  const handleProfilePhotoSelect = useCallback(
    async (source: "camera" | "gallery") => {
      try {
        const result = await imageService.pickImage(source, {
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result) return;

        setIsUploadingPhoto(true);
        setPhotoUploadProgress(0);

        // Compress the image
        const compressedUri = await imageService.compressImage(result.uri, {
          maxWidth: 500,
          maxHeight: 500,
          quality: 0.85,
        });

        // Upload to Firebase Storage
        const currentUser = auth().currentUser;
        if (!currentUser) {
          throw new Error("사용자가 로그인되어 있지 않습니다.");
        }

        const uploadResult: UploadResult = await imageService.uploadImage(
          compressedUri,
          {
            path: `users/${currentUser.uid}/profile`,
            onProgress: (progress: UploadProgress) => {
              setPhotoUploadProgress(progress.progress);
            },
          },
        );

        // Update local state
        setProfilePhotoUrl(uploadResult.downloadUrl);

        // Update media array (profile photo is first item)
        const newMediaUrls = [
          uploadResult.downloadUrl,
          ...mediaUrls.filter((url) => url !== uploadResult.downloadUrl),
        ];
        setMediaUrls(newMediaUrls);

        // Update Firestore
        await userService.updateUserProfile({
          media: newMediaUrls,
        });

        setPhotoUploadProgress(100);
        Alert.alert("완료", "프로필 사진이 업데이트되었습니다.");
      } catch (error) {
        console.error("[ProfileEdit] Profile photo upload error:", error);
        Alert.alert("오류", "프로필 사진 업로드 중 오류가 발생했습니다.");
      } finally {
        setIsUploadingPhoto(false);
        setTimeout(() => setPhotoUploadProgress(0), 1500);
      }
    },
    [mediaUrls],
  );

  /**
   * Handle media gallery image addition
   */
  const handleAddMedia = useCallback(
    async (source: "camera" | "gallery") => {
      try {
        const result = await imageService.pickImage(source, {
          allowsEditing: true,
          aspect: [4, 5],
          quality: 0.8,
        });

        if (!result) return;

        setIsUploadingMedia(true);
        setMediaUploadProgress(0);

        // Compress the image
        const compressedUri = await imageService.compressImage(result.uri, {
          maxWidth: 1080,
          maxHeight: 1350,
          quality: 0.8,
        });

        // Upload to Firebase Storage
        const currentUser = auth().currentUser;
        if (!currentUser) {
          throw new Error("사용자가 로그인되어 있지 않습니다.");
        }

        const uploadResult: UploadResult = await imageService.uploadImage(
          compressedUri,
          {
            path: `users/${currentUser.uid}/media`,
            onProgress: (progress: UploadProgress) => {
              setMediaUploadProgress(progress.progress);
            },
          },
        );

        // Update local state
        const newMediaUrls = [...mediaUrls, uploadResult.downloadUrl];
        setMediaUrls(newMediaUrls);

        // Update profile photo if this is the first image
        if (!profilePhotoUrl) {
          setProfilePhotoUrl(uploadResult.downloadUrl);
        }

        // Update Firestore
        await userService.updateUserProfile({
          media: newMediaUrls,
        });

        setMediaUploadProgress(100);
        Alert.alert("완료", "이미지가 추가되었습니다.");
      } catch (error) {
        console.error("[ProfileEdit] Media upload error:", error);
        Alert.alert("오류", "이미지 업로드 중 오류가 발생했습니다.");
      } finally {
        setIsUploadingMedia(false);
        setTimeout(() => setMediaUploadProgress(0), 1500);
      }
    },
    [mediaUrls, profilePhotoUrl],
  );

  /**
   * Handle media deletion
   */
  const handleDeleteMedia = useCallback(
    async (index: number) => {
      Alert.alert("이미지 삭제", "이 이미지를 삭제하시겠습니까?", [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const newMediaUrls = mediaUrls.filter((_, i) => i !== index);
              setMediaUrls(newMediaUrls);

              // Update profile photo if deleted image was the profile photo
              if (mediaUrls[index] === profilePhotoUrl) {
                setProfilePhotoUrl(
                  newMediaUrls.length > 0 ? newMediaUrls[0] : null,
                );
              }

              // Update Firestore
              await userService.updateUserProfile({
                media: newMediaUrls,
              });

              Alert.alert("완료", "이미지가 삭제되었습니다.");
            } catch (error) {
              console.error("[ProfileEdit] Delete media error:", error);
              Alert.alert("오류", "이미지 삭제 중 오류가 발생했습니다.");
            }
          },
        },
      ]);
    },
    [mediaUrls, profilePhotoUrl],
  );

  /**
   * Handle image press in gallery (set as profile photo)
   */
  const handleImagePress = useCallback(
    (index: number) => {
      const selectedUrl = mediaUrls[index];
      Alert.alert(
        "프로필 사진 설정",
        "이 사진을 프로필 사진으로 설정하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          {
            text: "설정",
            onPress: async () => {
              try {
                setProfilePhotoUrl(selectedUrl);

                // Reorder media array to put selected image first
                const newMediaUrls = [
                  selectedUrl,
                  ...mediaUrls.filter((url) => url !== selectedUrl),
                ];
                setMediaUrls(newMediaUrls);

                // Update Firestore
                await userService.updateUserProfile({
                  media: newMediaUrls,
                });

                Alert.alert("완료", "프로필 사진이 변경되었습니다.");
              } catch (error) {
                console.error("[ProfileEdit] Set profile photo error:", error);
                Alert.alert("오류", "프로필 사진 설정 중 오류가 발생했습니다.");
              }
            },
          },
        ],
      );
    },
    [mediaUrls],
  );

  /**
   * Handle save profile
   */
  const handleSaveProfile = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert("알림", "이름을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);

      await userService.updateUserProfile({
        name: displayName.trim(),
      });

      Alert.alert("완료", "프로필이 저장되었습니다.");
    } catch (error) {
      console.error("[ProfileEdit] Save profile error:", error);
      Alert.alert("오류", "프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [displayName]);

  /**
   * Render profile photo avatar section
   */
  const renderProfilePhoto = () => {
    const avatarSize = 120;

    return (
      <View style={themed($avatarSection)}>
        <View style={themed($avatarContainer)}>
          {profilePhotoUrl ? (
            <Image
              source={{ uri: profilePhotoUrl }}
              style={[
                themed($avatar),
                { width: avatarSize, height: avatarSize },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                themed($avatarPlaceholder),
                { width: avatarSize, height: avatarSize },
              ]}
            >
              <Text style={themed($avatarInitial)}>
                {displayName ? displayName.charAt(0).toUpperCase() : "?"}
              </Text>
            </View>
          )}

          {/* Edit button overlay */}
          <Pressable
            style={({ pressed }) => [
              themed($editAvatarButton),
              pressed && themed($editAvatarButtonPressed),
            ]}
            onPress={() => {
              // Show source selection
              Alert.alert("프로필 사진 변경", "사진을 어디서 가져올까요?", [
                {
                  text: "카메라",
                  onPress: () => handleProfilePhotoSelect("camera"),
                },
                {
                  text: "갤러리",
                  onPress: () => handleProfilePhotoSelect("gallery"),
                },
                { text: "취소", style: "cancel" },
              ]);
            }}
            disabled={isUploadingPhoto}
            accessibilityRole="button"
            accessibilityLabel="프로필 사진 변경"
          >
            <Text style={themed($editAvatarButtonText)}>편집</Text>
          </Pressable>
        </View>

        {/* Upload progress for profile photo */}
        {(isUploadingPhoto || photoUploadProgress > 0) && (
          <ImageUploadProgress
            progress={photoUploadProgress}
            isUploading={isUploadingPhoto}
            variant="linear"
            style={themed($avatarProgressContainer)}
          />
        )}
      </View>
    );
  };

  if (isLoadingProfile) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($loadingContainer)}>
        <Text text="프로필 로딩 중..." style={themed($loadingText)} />
      </Screen>
    );
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={themed($screenContent)}
      safeAreaEdges={["top"]}
    >
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($title)} preset="heading">
          프로필 편집
        </Text>
      </View>

      {/* Profile Photo Section */}
      {renderProfilePhoto()}

      {/* Name Section */}
      <View style={themed($section)}>
        <Text style={themed($sectionTitle)}>기본 정보</Text>
        <TextField
          label="이름"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="이름을 입력하세요"
          autoCapitalize="words"
          autoCorrect={false}
        />
        <Button
          text="저장"
          preset="cta"
          onPress={handleSaveProfile}
          isLoading={isSaving}
          disabled={isSaving || !displayName.trim()}
          style={themed($saveButton)}
        />
      </View>

      {/* Media Gallery Section */}
      <View style={themed($section)}>
        <Text style={themed($sectionTitle)}>사진 갤러리</Text>
        <Text style={themed($sectionDescription)}>
          최소 3장의 사진이 필요합니다. 첫 번째 사진이 프로필 사진으로
          사용됩니다.
        </Text>

        {/* Upload progress for gallery */}
        {(isUploadingMedia || mediaUploadProgress > 0) && (
          <ImageUploadProgress
            progress={mediaUploadProgress}
            isUploading={isUploadingMedia}
            variant="linear"
            style={themed($galleryProgressContainer)}
          />
        )}

        <ImageGallery
          images={mediaUrls}
          numColumns={3}
          onImagePress={handleImagePress}
          onAddPress={() => {
            Alert.alert("사진 추가", "사진을 어디서 가져올까요?", [
              { text: "카메라", onPress: () => handleAddMedia("camera") },
              { text: "갤러리", onPress: () => handleAddMedia("gallery") },
              { text: "취소", style: "cancel" },
            ]);
          }}
          showAddButton={!isUploadingMedia}
          maxImages={9}
          showDeleteButton
          onDeletePress={handleDeleteMedia}
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

const $loadingContainer: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
});

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
});

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
});

const $title: ThemedStyle<TextStyle> = () => ({
  fontSize: 24,
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

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.textDim,
  textTransform: "uppercase",
  marginBottom: spacing.sm,
  letterSpacing: 0.5,
});

const $sectionDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginBottom: spacing.md,
  lineHeight: 20,
});

const $avatarSection: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  alignItems: "center",
  paddingVertical: spacing.lg,
  backgroundColor: colors.palette.neutral100,
  borderBottomWidth: 1,
  borderColor: colors.separator,
});

const $avatarContainer: ThemedStyle<ViewStyle> = () => ({
  position: "relative",
});

const $avatar: ThemedStyle<ImageStyle> = ({ colors }) => ({
  borderRadius: 60,
  backgroundColor: colors.palette.neutral200,
});

const $avatarPlaceholder: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 60,
  backgroundColor: colors.palette.neutral300,
  justifyContent: "center",
  alignItems: "center",
});

const $avatarInitial: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 48,
  fontWeight: "700",
  color: colors.palette.neutral100,
});

const $editAvatarButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor: colors.palette.primary500,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 12,
});

const $editAvatarButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.primary600,
});

const $editAvatarButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "600",
  color: colors.palette.neutral100,
});

const $avatarProgressContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "80%",
  marginTop: spacing.sm,
});

const $saveButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
});

const $galleryProgressContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
});
