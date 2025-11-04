import { View } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { Role } from "@/types/post"
import {
  $section,
  $sectionTitle,
  $roleCard,
  $roleHeader,
  $roleName,
  $roleCountBadge,
  $roleCountText,
  $roleDetails,
  $roleDetailItem,
  $roleIcon,
  $roleDetailText,
  $roleRequirements,
} from "@/screens/PostDetailScreen.styles"

interface RoleCardProps {
  roles: Role[]
}

export const RoleCard = ({ roles }: RoleCardProps) => {
  const { themed } = useAppTheme()

  if (!roles || roles.length === 0) return null

  return (
    <View style={themed($section)}>
      <Text preset="subheading" text="모집 역할" style={themed($sectionTitle)} />
      {roles.map((role, index) => (
        <View key={index} style={themed($roleCard)}>
          <View style={themed($roleHeader)}>
            <Text text={role.name} style={themed($roleName) as any} />
            <View style={themed($roleCountBadge)}>
              <Text text={`${role.count}명`} style={themed($roleCountText)} />
            </View>
          </View>
          <View style={themed($roleDetails)}>
            <View style={themed($roleDetailItem)}>
              <Text text="👤" style={themed($roleIcon)} />
              <Text text={role.ageRange} style={themed($roleDetailText)} />
            </View>
            <View style={themed($roleDetailItem)}>
              <Text text={role.gender === 'male' ? '♂️' : role.gender === 'female' ? '♀️' : '👥'} style={themed($roleIcon)} />
              <Text text={role.gender === 'male' ? '남성' : role.gender === 'female' ? '여성' : '성별무관'} style={themed($roleDetailText)} />
            </View>
          </View>
          <Text text={role.requirements} style={themed($roleRequirements)} />
        </View>
      ))}
    </View>
  )
}
