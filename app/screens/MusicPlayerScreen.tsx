import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Screen } from '@/components'
import { MusicPlayer } from '@/components/MusicPlayer'

export const MusicPlayerScreen = () => {
  console.log('🎵 MusicPlayerScreen 렌더링됨!')

  return (
    <Screen preset="scroll" safeAreaEdges={['top', 'bottom']}>
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          🔴 MusicPlayerScreen 렌더링 확인
        </Text>
        <Text style={styles.debugText}>
          이 빨간 텍스트가 보이면 Screen 컴포넌트까지는 정상
        </Text>
      </View>
      <MusicPlayer />
    </Screen>
  )
}

const styles = StyleSheet.create({
  debugContainer: {
    backgroundColor: '#ff0000',
    padding: 20,
    margin: 10,
    borderWidth: 5,
    borderColor: '#000000',
  },
  debugText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
})