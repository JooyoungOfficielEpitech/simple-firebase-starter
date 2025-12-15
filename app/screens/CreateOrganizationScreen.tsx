import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { OrphiHeader, OrphiText, orphiTokens } from '@/design-system'
import { useNavigation } from '@react-navigation/native'

export const CreateOrganizationScreen: React.FC = () => {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <OrphiHeader
        title="단체 생성"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <OrphiText variant="body" color="gray600">
          단체 생성 기능 (구현 예정)
        </OrphiText>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: orphiTokens.colors.background,
  },
  content: {
    flex: 1,
    padding: orphiTokens.spacing.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
