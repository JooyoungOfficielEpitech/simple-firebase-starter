import React from 'react'
import { Screen } from '@/components'
import { DebugInfo } from '@/components/DebugInfo'

export const DebugScreen = () => {
  return (
    <Screen preset="scroll" safeAreaEdges={['top', 'bottom']}>
      <DebugInfo />
    </Screen>
  )
}