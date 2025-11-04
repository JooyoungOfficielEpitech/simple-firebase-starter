import React, { FC } from 'react'
import { Text } from 'react-native'
import { SettingSection } from './SettingSection'

interface UsageGuideSectionProps {
  colors: any
  spacing: any
}

export const UsageGuideSection: FC<UsageGuideSectionProps> = ({ colors, spacing }) => {
  return (
    <SettingSection title="사용법" colors={colors} spacing={spacing}>
      <Text style={{
        fontSize: 14,
        color: colors.textDim,
        lineHeight: 20
      }}>
        {`1. FCM 토큰을 복사/공유하세요
2. Firebase Console → Messaging으로 이동
3. "새 캠페인" → "알림" 선택
4. "테스트 메시지 전송"에 토큰 입력
5. 테스트 메시지 전송

📱 모든 기기 토큰: 이 사용자의 모든 기기 조회
🧹 토큰 정리: 30일 이상 미사용 토큰 삭제
🚫 토큰 비활성화: 모든 기기의 알림 중단`}
      </Text>
    </SettingSection>
  )
}
