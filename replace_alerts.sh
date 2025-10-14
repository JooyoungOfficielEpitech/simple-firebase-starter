#!/bin/bash

# 모든 Alert.alert를 새로운 AlertModal 시스템으로 교체하는 스크립트

SCREENS_DIR="/Users/mmecoco/Desktop/simple-firebase-starter/app/screens"

# Alert를 사용하는 파일들 목록
ALERT_FILES=(
  "CreateOrganizationScreen.tsx"
  "ApplicationManagementScreen.tsx"
  "SettingsScreen.tsx"
  "EditProfileScreen.tsx"
  "SignUpScreen.tsx"
  "SignInScreen.tsx"
  "ForgotPasswordScreen.tsx"
  "BulletinBoardScreen.tsx"
  "WelcomeScreen.tsx"
)

for file in "${ALERT_FILES[@]}"; do
  filepath="$SCREENS_DIR/$file"
  
  if [ -f "$filepath" ]; then
    echo "Processing $file..."
    
    # 1. Alert import 제거 및 AlertModal import 추가
    sed -i '' 's/import { \([^}]*\), Alert\([^}]*\) }/import { \1\2 }/g' "$filepath"
    sed -i '' 's/Alert, //g' "$filepath"
    sed -i '' 's/, Alert//g' "$filepath"
    sed -i '' '/import.*react-native/a\
import { AlertModal } from "@/components/AlertModal"' "$filepath"
    sed -i '' '/import.*@\/theme\/context/a\
import { useAlert } from "@/hooks/useAlert"' "$filepath"
    
    # 2. useAlert hook 추가
    sed -i '' '/const.*useAppTheme/a\
  const { alertState, alert, confirm, confirmDestructive, hideAlert } = useAlert()' "$filepath"
    
    # 3. Alert.alert를 alert로 교체
    sed -i '' 's/Alert\.alert(/alert(/g' "$filepath"
    
    # 4. </Screen> 앞에 AlertModal 추가
    sed -i '' '/<\/Screen>$/i\
\
      {/* Alert Modal */}\
      <AlertModal\
        visible={alertState.visible}\
        title={alertState.title}\
        message={alertState.message}\
        buttons={alertState.buttons}\
        onDismiss={hideAlert}\
        dismissable={alertState.dismissable}\
      />
' "$filepath"
    
    echo "✅ Completed $file"
  else
    echo "❌ File not found: $filepath"
  fi
done

echo "🎉 모든 Alert를 AlertModal로 교체 완료!"