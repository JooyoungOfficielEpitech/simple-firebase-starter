import React, { FC } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

interface DevFloatingButtonProps {}

export const DevFloatingButton: FC<DevFloatingButtonProps> = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  if (!__DEV__) {
    return null
  }

  const handlePress = () => {
    // @ts-ignore - DevSettings는 개발 환경에서만 존재
    navigation.navigate('DevSettings')
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        position: 'absolute',
        bottom: insets.bottom + 100,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 9998,
      }}
    >
      <Text style={{ fontSize: 20 }}>🛠️</Text>
      <Text style={{ 
        fontSize: 8, 
        color: '#FFFFFF', 
        fontWeight: 'bold',
        marginTop: 2
      }}>
        DEV
      </Text>
    </TouchableOpacity>
  )
}

export default DevFloatingButton