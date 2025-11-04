import React from "react"
import { View, TouchableOpacity } from "react-native"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import { translate } from "@/i18n"

interface TabBarProps {
  activeTab: 'announcements' | 'organizations'
  onTabChange: (tab: 'announcements' | 'organizations') => void
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { themed } = useAppTheme()

  return (
    <View style={themed($tabContainer)}>
      <TouchableOpacity
        style={themed(activeTab === 'announcements' ? $activeTabButton : $tabButton)}
        onPress={() => onTabChange('announcements')}
      >
        <Text 
          text={translate("bulletinBoard:tabs.announcements")} 
          style={themed(activeTab === 'announcements' ? $activeTabText : $tabText)} 
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={themed(activeTab === 'organizations' ? $activeTabButton : $tabButton)}
        onPress={() => onTabChange('organizations')}
      >
        <Text 
          text={translate("bulletinBoard:tabs.organizations")} 
          style={themed(activeTab === 'organizations' ? $activeTabText : $tabText)} 
        />
      </TouchableOpacity>
    </View>
  )
}

const $tabContainer = ({ colors, spacing }) => ({
  flexDirection: "row" as const,
  backgroundColor: colors.palette.neutral100,
  borderRadius: 8,
  padding: 4,
  marginBottom: spacing?.lg || 16,
})

const $tabButton = ({ spacing }) => ({
  flex: 1,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 4,
  alignItems: "center" as const,
})

const $activeTabButton = ({ colors, spacing }) => ({
  flex: 1,
  paddingVertical: spacing?.sm || 8,
  paddingHorizontal: spacing?.md || 12,
  borderRadius: 4,
  alignItems: "center" as const,
  backgroundColor: colors.background,
})

const $tabText = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 14,
  fontWeight: "500" as const,
})

const $activeTabText = ({ colors }) => ({
  color: colors.text,
  fontSize: 14,
  fontWeight: "500" as const,
})
