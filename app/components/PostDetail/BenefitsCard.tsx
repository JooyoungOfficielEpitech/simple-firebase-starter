import { View } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { Benefits } from "@/types/post"
import {
  $section,
  $sectionTitle,
  $benefitsCard,
  $benefitRow,
  $benefitIcon,
  $benefitContent,
  $benefitLabel,
  $benefitValue,
  $providedBenefits,
  $benefitSectionTitle,
  $benefitsList,
  $benefitItem,
  $benefitItemText,
  $otherBenefits,
  $bulletPoint,
  $otherBenefitText,
} from "@/screens/PostDetailScreen.styles"

interface BenefitsCardProps {
  benefits: Benefits | undefined
}

export const BenefitsCard = ({ benefits }: BenefitsCardProps) => {
  const { themed } = useAppTheme()

  if (!benefits) return null

  return (
    <View style={themed($section)}>
      <Text preset="subheading" text="혜택 정보" style={themed($sectionTitle)} />
      <View style={themed($benefitsCard)}>
        {benefits.fee && (
          <View style={themed($benefitRow)}>
            <Text text="💰" style={themed($benefitIcon)} />
            <View style={themed($benefitContent)}>
              <Text text="출연료/활동비" style={themed($benefitLabel)} />
              <Text text={benefits.fee} style={themed($benefitValue)} />
            </View>
          </View>
        )}
        
        <View style={themed($providedBenefits)}>
          <Text text="🎁 제공 혜택" style={themed($benefitSectionTitle)} />
          <View style={themed($benefitsList)}>
            {benefits.transportation && (
              <View style={themed($benefitItem)}>
                <Text text="✅ 🚗 교통비 지원" style={themed($benefitItemText)} />
              </View>
            )}
            {benefits.costume && (
              <View style={themed($benefitItem)}>
                <Text text="✅ 👗 의상 제공" style={themed($benefitItemText)} />
              </View>
            )}
            {benefits.portfolio && (
              <View style={themed($benefitItem)}>
                <Text text="✅ 📸 포트폴리오 제공" style={themed($benefitItemText)} />
              </View>
            )}
            {benefits.photography && (
              <View style={themed($benefitItem)}>
                <Text text="✅ 📷 프로필 촬영" style={themed($benefitItemText)} />
              </View>
            )}
            {benefits.meals && (
              <View style={themed($benefitItem)}>
                <Text text="✅ 🍽️ 식사 제공" style={themed($benefitItemText)} />
              </View>
            )}
          </View>
        </View>

        {benefits.other && benefits.other.length > 0 && (
          <View style={themed($otherBenefits)}>
            <Text text="🌟 기타 혜택" style={themed($benefitSectionTitle)} />
            {benefits.other.map((benefit, index) => (
              <View key={index} style={themed($benefitItem)}>
                <Text text="•" style={themed($bulletPoint)} />
                <Text text={benefit} style={themed($otherBenefitText)} />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}
