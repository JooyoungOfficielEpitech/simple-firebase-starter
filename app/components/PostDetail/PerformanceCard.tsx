import { View } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { PerformanceInfo } from "@/types/post" // PerformanceInfo
import {
  $section,
  $sectionTitle,
  $performanceCard,
  $performanceInfoRow,
  $infoIcon,
  $performanceDetails,
  $performanceLabel,
  $performanceDate,
  $performanceText,
} from "@/screens/PostDetailScreen.styles"

interface PerformanceCardProps {
  performance: PerformanceInfo | undefined
}

export const PerformanceCard = ({ performance }: PerformanceCardProps) => {
  const { themed } = useAppTheme()

  if (!performance) return null

  return (
    <View style={themed($section)}>
      <Text preset="subheading" text="공연 정보" style={themed($sectionTitle)} />
      <View style={themed($performanceCard)}>
        {performance.dates && performance.dates.length > 0 && (
          <View style={themed($performanceInfoRow)}>
            <Text text="🎭" style={themed($infoIcon)} />
            <View style={themed($performanceDetails)}>
              <Text text="공연 일정" style={themed($performanceLabel)} />
              {performance.dates.map((date, index) => (
                <Text key={index} text={`• ${date}`} style={themed($performanceDate)} />
              ))}
            </View>
          </View>
        )}
        {performance.venue && (
          <View style={themed($performanceInfoRow)}>
            <Text text="🏛️" style={themed($infoIcon)} />
            <View style={themed($performanceDetails)}>
              <Text text="공연 장소" style={themed($performanceLabel)} />
              <Text text={performance.venue} style={themed($performanceText)} />
            </View>
          </View>
        )}
        {performance.ticketPrice && (
          <View style={themed($performanceInfoRow)}>
            <Text text="🎫" style={themed($infoIcon)} />
            <View style={themed($performanceDetails)}>
              <Text text="티켓 가격" style={themed($performanceLabel)} />
              <Text text={performance.ticketPrice} style={themed($performanceText)} />
            </View>
          </View>
        )}
        {performance.targetAudience && (
          <View style={themed($performanceInfoRow)}>
            <Text text="👥" style={themed($infoIcon)} />
            <View style={themed($performanceDetails)}>
              <Text text="관객 대상" style={themed($performanceLabel)} />
              <Text text={performance.targetAudience} style={themed($performanceText)} />
            </View>
          </View>
        )}
        {performance.genre && (
          <View style={themed($performanceInfoRow)}>
            <Text text="🎨" style={themed($infoIcon)} />
            <View style={themed($performanceDetails)}>
              <Text text="장르" style={themed($performanceLabel)} />
              <Text text={performance.genre} style={themed($performanceText)} />
            </View>
          </View>
        )}
      </View>
    </View>
  )
}
