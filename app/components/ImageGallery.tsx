import { useState } from "react"
import { View, ScrollView, Image, Dimensions } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"

const { width: screenWidth } = Dimensions.get('window')

interface ImageGalleryProps {
  images: string[]
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffsetX / screenWidth)
    setCurrentIndex(index)
  }

  return (
    <View style={themed($imageGalleryContainer)}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={themed($imageScrollView)}
        contentContainerStyle={{ alignItems: 'flex-start' }}
        bounces={false}
      >
        {images.map((imageUrl, index) => (
          <View key={index} style={themed($imageContainer)}>
            <Image
              source={{ uri: imageUrl }}
              style={themed($galleryImage)}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
      
      {images.length > 1 && (
        <View style={themed($indicatorContainer)}>
          {images.map((_, index) => (
            <View
              key={index}
              style={themed(
                index === currentIndex ? $activeIndicator : $inactiveIndicator
              )}
            />
          ))}
        </View>
      )}
      
      {images.length > 1 && (
        <View style={themed($counterContainer)}>
          <Text
            text={`${currentIndex + 1} / ${images.length}`}
            style={themed($counterText)}
          />
        </View>
      )}
    </View>
  )
}

const $imageGalleryContainer = {
  position: "relative" as const,
  width: screenWidth,
  height: screenWidth,
}

const $imageScrollView = {
  flex: 1,
}

const $imageContainer = {
  width: screenWidth,
  height: screenWidth,
  overflow: "hidden" as const,
}

const $galleryImage = {
  width: screenWidth,
  height: screenWidth,
  resizeMode: "cover" as const,
}

const $indicatorContainer = () => ({
  flexDirection: "row" as const,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  position: "absolute" as const,
  bottom: 16,
  left: 0,
  right: 0,
  zIndex: 10,
})

const $activeIndicator = () => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  marginHorizontal: 3,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
})

const $inactiveIndicator = () => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "rgba(255, 255, 255, 0.4)",
  marginHorizontal: 3,
})

const $counterContainer = () => ({
  position: "absolute" as const,
  top: 16,
  right: 16,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 16,
  zIndex: 10,
})

const $counterText = ({ colors, typography }) => ({
  color: colors.palette.neutral100,
  fontSize: 12,
  fontFamily: typography.primary.medium,
})
