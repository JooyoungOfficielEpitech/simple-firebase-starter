#!/bin/bash

# 중복된 AlertModal import 제거
SCREENS_DIR="/Users/mmecoco/Desktop/simple-firebase-starter/app/screens"

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
    echo "Cleaning up $file..."
    
    # 중복된 AlertModal import 제거
    sed -i '' '/import { AlertModal }/,/import.*AlertModal.*/{
      /import { AlertModal }/b keep
      /import.*AlertModal.*/d
      :keep
    }' "$filepath"
    
    # 중복된 useAlert import 제거  
    sed -i '' '/import.*useAlert.*import/s/import { useAlert } from "@\/hooks\/useAlert"//g' "$filepath"
    
    # 연속된 중복 import 라인 제거
    awk '!seen[$0]++' "$filepath" > "$filepath.tmp" && mv "$filepath.tmp" "$filepath"
    
    echo "✅ Cleaned $file"
  fi
done

echo "🎉 Import 정리 완료!"