import React from 'react'
import { Screen } from '@/components'
import { MusicPlayer } from '@/components/MusicPlayer'

export const MusicPlayerScreen = () => {
  return (
    <Screen preset="scroll" safeAreaEdges={['top', 'bottom']}>
      <MusicPlayer />
    </Screen>
  )
}