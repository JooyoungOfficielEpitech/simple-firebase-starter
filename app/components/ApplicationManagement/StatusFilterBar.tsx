import React from "react"
import { View, TouchableOpacity } from "react-native"
import { Text } from "@/components/Text"
import { ApplicationStatus } from "@/services/firestore/applicationService"
import { useAppTheme } from "@/theme/context"
import { statusFilterBarStyles } from "./StatusFilterBar.styles"

export interface FilterTab {
  key: ApplicationStatus | "all"
  label: string
  count: number
}

interface StatusFilterBarProps {
  filterTabs: FilterTab[]
  selectedFilter: ApplicationStatus | "all"
  onFilterChange: (filter: ApplicationStatus | "all") => void
}

export const StatusFilterBar: React.FC<StatusFilterBarProps> = ({
  filterTabs,
  selectedFilter,
  onFilterChange,
}) => {
  const { themed } = useAppTheme()
  const styles = statusFilterBarStyles()

  return (
    <View style={themed(styles.$container)}>
      {filterTabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={themed(selectedFilter === tab.key ? styles.$activeTab : styles.$tab)}
          onPress={() => onFilterChange(tab.key)}
          accessibilityRole="button"
          accessibilityLabel={`${tab.label} ${tab.count}개 필터`}
          accessibilityState={{ selected: selectedFilter === tab.key }}
        >
          <Text 
            text={`${tab.label} (${tab.count})`} 
            style={themed(selectedFilter === tab.key ? styles.$activeTabText : styles.$tabText)} 
          />
        </TouchableOpacity>
      ))}
    </View>
  )
}
