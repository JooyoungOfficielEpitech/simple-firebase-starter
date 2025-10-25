import React, { FC } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

interface DevFloatingButtonProps {}

export const DevFloatingButton: FC<DevFloatingButtonProps> = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  // TestFlight에서도 보이도록 항상 표시
  // if (!__DEV__) {
  //   return null
  // }

  const handlePress = () => {
    // @ts-ignore - DevSettings는 개발 환경에서만 존재
    navigation.navigate('DevSettings')
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        position: 'absolute',
        bottom: insets.bottom + 80,
        right: 20,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FF0000',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 10,
        zIndex: 99999,
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