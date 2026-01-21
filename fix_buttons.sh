#!/bin/bash
# Script to add type="button" to buttons missing it

# Files with button type errors (from lint output)
files=(
  "client/src/components/GrowthTrendChart.jsx"
  "client/src/components/InviteUserModal.jsx"
  "client/src/components/ui/Button.jsx"
  "client/src/components/ui/CommandPalette.jsx"
  "client/src/components/ui/ThemeToggle.jsx"
  "client/src/components/ui/Toast.jsx"
  "client/src/pages/Analytics.jsx"
  "client/src/pages/ApiKeys.jsx"
  "client/src/pages/Login.jsx"
  "client/src/pages/NotFound.jsx"
  "client/src/pages/Notifications.jsx"
  "client/src/pages/SecurityCenter.jsx"
  "client/src/pages/SignUp.jsx"
  "client/src/pages/Teams.jsx"
  "client/src/pages/admin/AdminDashboard.jsx"
)

cd /c/Users/Name/Desktop/user_profile_manager

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # Add type="button" to buttons that don't have type attribute
    # This uses sed to find <button without type= and add it
    sed -i 's/<button\([^>]*\)\(>\)/<button type="button"\1\2/g' "$file"
    # Fix cases where type was added twice
    sed -i 's/type="button" type="button"/type="button"/g' "$file"
    # Fix cases where button already had type=
    sed -i 's/<button type="button"\([^>]*\)type=/<button\1type=/g' "$file"
  fi
done

echo "Done! Run npm run lint --workspace=client to verify."
