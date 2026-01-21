import { type FC, useCallback } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  type ImageStyle,
  Pressable,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/theme/context";
import { type ThemedStyle } from "@/theme/types";

import { Icon } from "./Icon";
import { Text } from "./Text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface ImageGalleryProps {
  /**
   * Array of image URLs
   */
  images: string[];
  /**
   * Number of columns in the grid
   */
  numColumns?: number;
  /**
   * Callback when an image is pressed
   */
  onImagePress?: (index: number) => void;
  /**
   * Callback when add button is pressed
   */
  onAddPress?: () => void;
  /**
   * Whether to show the add button
   */
  showAddButton?: boolean;
  /**
   * Maximum number of images allowed
   */
  maxImages?: number;
  /**
   * Optional style override for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Gap between images
   */
  gap?: number;
  /**
   * Whether to show delete button on images
   */
  showDeleteButton?: boolean;
  /**
   * Callback when delete button is pressed
   */
  onDeletePress?: (index: number) => void;
}

interface GalleryItem {
  type: "image" | "add";
  uri?: string;
  index?: number;
}

/**
 * A grid component for displaying images with optional add functionality.
 * @param {ImageGalleryProps} props - The props for the `ImageGallery` component.
 * @returns {JSX.Element} The rendered `ImageGallery` component.
 * @example
 * <ImageGallery
 *   images={['https://example.com/1.jpg', 'https://example.com/2.jpg']}
 *   numColumns={3}
 *   onImagePress={(index) => viewImage(index)}
 *   onAddPress={() => pickImage()}
 *   showAddButton
 *   maxImages={9}
 * />
 */
export const ImageGallery: FC<ImageGalleryProps> = function ImageGallery(
  props,
) {
  const {
    images,
    numColumns = 3,
    onImagePress,
    onAddPress,
    showAddButton = false,
    maxImages = 9,
    style: $styleOverride,
    gap = 4,
    showDeleteButton = false,
    onDeletePress,
  } = props;

  const { themed, theme } = useAppTheme();

  // Calculate item size based on screen width, columns, and gap
  const containerPadding = 16; // Default padding
  const totalGapWidth = (numColumns - 1) * gap;
  const availableWidth = SCREEN_WIDTH - containerPadding * 2 - totalGapWidth;
  const itemSize = Math.floor(availableWidth / numColumns);

  /**
   * Prepare data for FlatList including add button if needed
   */
  const getData = useCallback((): GalleryItem[] => {
    const items: GalleryItem[] = images.map((uri, index) => ({
      type: "image",
      uri,
      index,
    }));

    // Add the "add" button if conditions are met
    if (showAddButton && images.length < maxImages) {
      items.push({ type: "add" });
    }

    return items;
  }, [images, showAddButton, maxImages]);

  /**
   * Render individual gallery item
   */
  const renderItem = useCallback(
    ({ item, index }: { item: GalleryItem; index: number }) => {
      if (item.type === "add") {
        return (
          <Pressable
            style={({ pressed }) => [
              themed($addButton),
              { width: itemSize, height: itemSize },
              pressed && themed($addButtonPressed),
            ]}
            onPress={onAddPress}
            accessibilityRole="button"
            accessibilityLabel={`이미지 추가 (${images.length}/${maxImages})`}
            accessibilityHint="눌러서 새 이미지를 추가합니다"
          >
            <Icon
              icon="more"
              size={28}
              color={theme.colors.palette.neutral500}
            />
            <Text text="추가" style={themed($addButtonText)} />
          </Pressable>
        );
      }

      return (
        <Pressable
          style={({ pressed }) => [
            { width: itemSize, height: itemSize },
            pressed && themed($imagePressed),
          ]}
          onPress={() => onImagePress?.(item.index!)}
          accessibilityRole="image"
          accessibilityLabel={`이미지 ${(item.index ?? 0) + 1}`}
          accessibilityHint={
            onImagePress ? "눌러서 이미지를 확대합니다" : undefined
          }
        >
          <Image
            source={{ uri: item.uri }}
            style={[themed($image), { width: itemSize, height: itemSize }]}
            resizeMode="cover"
          />
          {showDeleteButton && onDeletePress && (
            <Pressable
              style={({ pressed }) => [
                themed($deleteButton),
                pressed && themed($deleteButtonPressed),
              ]}
              onPress={() => onDeletePress(item.index!)}
              accessibilityRole="button"
              accessibilityLabel={`이미지 ${(item.index ?? 0) + 1} 삭제`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon
                icon="x"
                size={14}
                color={theme.colors.palette.neutral100}
              />
            </Pressable>
          )}
        </Pressable>
      );
    },
    [
      themed,
      itemSize,
      onAddPress,
      images.length,
      maxImages,
      theme.colors,
      onImagePress,
      showDeleteButton,
      onDeletePress,
    ],
  );

  /**
   * Key extractor for FlatList
   */
  const keyExtractor = useCallback(
    (item: GalleryItem, index: number) =>
      item.type === "add" ? "add-button" : `image-${item.index}-${item.uri}`,
    [],
  );

  /**
   * Item separator component
   */
  const ItemSeparator = useCallback(
    () => <View style={{ width: gap, height: gap }} />,
    [gap],
  );

  const data = getData();

  if (data.length === 0 && !showAddButton) {
    return (
      <View style={[themed($emptyContainer), $styleOverride]}>
        <Icon icon="more" size={48} color={theme.colors.palette.neutral400} />
        <Text text="이미지가 없습니다" style={themed($emptyText)} />
      </View>
    );
  }

  return (
    <View style={[themed($container), $styleOverride]}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        contentContainerStyle={themed($listContent)}
        columnWrapperStyle={numColumns > 1 ? { gap } : undefined}
        ItemSeparatorComponent={ItemSeparator}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        accessibilityRole="list"
        accessibilityLabel={`이미지 갤러리 (${images.length}개)`}
      />
      {maxImages && showAddButton && (
        <Text
          text={`${images.length} / ${maxImages}`}
          style={themed($countText)}
          accessibilityLabel={`${maxImages}개 중 ${images.length}개 이미지`}
        />
      )}
    </View>
  );
};

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
});

const $listContent: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-start",
});

const $image: ThemedStyle<ImageStyle> = ({ colors }) => ({
  borderRadius: 8,
  backgroundColor: colors.palette.neutral200,
});

const $imagePressed: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.8,
});

const $addButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
  borderWidth: 2,
  borderStyle: "dashed",
  borderColor: colors.palette.neutral300,
  backgroundColor: colors.palette.neutral100,
});

const $addButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.primary500,
});

const $addButtonText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.xxs,
  fontSize: 12,
  fontWeight: "500",
  color: colors.palette.neutral500,
});

const $deleteButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 4,
  right: 4,
  width: 22,
  height: 22,
  borderRadius: 11,
  backgroundColor: colors.error,
  justifyContent: "center",
  alignItems: "center",
});

const $deleteButtonPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.palette.angry500,
});

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xl,
});

const $emptyText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.sm,
  fontSize: 14,
  color: colors.textDim,
});

const $countText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  marginTop: spacing.sm,
  fontSize: 12,
  color: colors.textDim,
  textAlign: "right",
});
