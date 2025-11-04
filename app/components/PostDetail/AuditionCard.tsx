import { View } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { AuditionInfo } from "@/types/post" // AuditionInfo
import {
  $section,
  $sectionTitle,
  $auditionCard,
  $auditionInfoRow,
  $infoIcon,
  $infoText,
  $preparationSection,
  $preparationTitle,
  $preparationItem,
  $bulletPoint,
  $preparationText,
} from "@/screens/PostDetailScreen.styles"

interface AuditionCardProps {
  audition: AuditionInfo | undefined
}

export const AuditionCard = ({ audition }: AuditionCardProps) => {
  const { themed } = useAppTheme()

  if (!audition) return null

  return (
    <View style={themed($section)}>
      <Text preset="subheading" text="오디션 정보" style={themed($sectionTitle)} />
      <View style={themed($auditionCard)}>
        <View style={themed($auditionInfoRow)}>
          <Text text="📅" style={themed($infoIcon)} />
          <Text text={`일정: ${audition.date}`} style={themed($infoText)} />
        </View>
        <View style={themed($auditionInfoRow)}>
          <Text text="📍" style={themed($infoIcon)} />
          <Text text={`장소: ${audition.location}`} style={themed($infoText)} />
        </View>
        <View style={themed($auditionInfoRow)}>
          <Text text="💻" style={themed($infoIcon)} />
          <Text text={`방식: ${audition.method}`} style={themed($infoText)} />
        </View>
        {audition.resultDate && (
          <View style={themed($auditionInfoRow)}>
            <Text text="🗓️" style={themed($infoIcon)} />
            <Text text={`결과 발표: ${audition.resultDate}`} style={themed($infoText)} />
          </View>
        )}
        {audition.requirements && audition.requirements.length > 0 && (
          <View style={themed($preparationSection)}>
            <Text text="📋 준비사항" style={themed($preparationTitle)} />
            {audition.requirements.map((requirement, index) => (
              <View key={index} style={themed($preparationItem)}>
                <Text text="•" style={themed($bulletPoint)} />
                <Text text={requirement} style={themed($preparationText)} />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}
