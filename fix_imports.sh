#!/bin/bash

echo "🔧 Fixing import formatting issues..."

# Function to fix imports in a single file
fix_file_imports() {
    local file="$1"
    echo "Fixing $file..."
    
    # Fix concatenated imports by adding newlines after missing semicolons
    sed -i '' -E 's/import \{ AlertModal \} from "@\/components\/AlertModal"import/import { AlertModal } from "@\/components\/AlertModal"\
import/g' "$file"
    
    # Remove duplicate AlertModal imports
    awk '
    /^import.*AlertModal.*from.*AlertModal/ { 
        if (!seen) { 
            print; 
            seen=1 
        } 
        next 
    } 
    { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    
    echo "✅ Fixed $file"
}

# Fix all affected screen files
SCREEN_FILES=(
    "app/screens/CreateOrganizationScreen.tsx"
    "app/screens/ApplicationManagementScreen.tsx" 
    "app/screens/SettingsScreen.tsx"
    "app/screens/EditProfileScreen.tsx"
    "app/screens/SignUpScreen.tsx"
    "app/screens/SignInScreen.tsx"
    "app/screens/ForgotPasswordScreen.tsx"
    "app/screens/BulletinBoardScreen.tsx"
    "app/screens/WelcomeScreen.tsx"
)

for file in "${SCREEN_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        fix_file_imports "$file"
    fi
done

echo "🎉 Import formatting fixed!"