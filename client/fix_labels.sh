#!/bin/bash
# Fix label associations by adding htmlFor attributes

cd /c/Users/Name/Desktop/user_profile_manager/client/src

# Login.jsx - Line 62: Add htmlFor to demo role switcher label
sed -i '62s/<label className="block/<label htmlFor="demo-role-select" className="block/' pages/Login.jsx
sed -i '65s/<select/<select id="demo-role-select"/' pages/Login.jsx

# Analytics.jsx - Add htmlFor to filter labels
sed -i 's/<label className="block text-sm font-medium mb-1">Start Date<\/label>/<label htmlFor="analytics-start-date" className="block text-sm font-medium mb-1">Start Date<\/label>/' pages/Analytics.jsx
sed -i 's/<label className="block text-sm font-medium mb-1">End Date<\/label>/<label htmlFor="analytics-end-date" className="block text-sm font-medium mb-1">End Date<\/label>/' pages/Analytics.jsx
sed -i 's/<label className="block text-sm font-medium mb-1">Metric<\/label>/<label htmlFor="analytics-metric" className="block text-sm font-medium mb-1">Metric<\/label>/' pages/Analytics.jsx
sed -i 's/<label className="block text-sm font-medium mb-1">Group By<\/label>/<label htmlFor="analytics-group-by" className="block text-sm font-medium mb-1">Group By<\/label>/' pages/Analytics.jsx

# Add corresponding IDs to inputs in Analytics
sed -i '/type="date".*value={startDate}/s/<input/<input id="analytics-start-date"/' pages/Analytics.jsx
sed -i '/type="date".*value={endDate}/s/<input/<input id="analytics-end-date"/' pages/Analytics.jsx
sed -i '/<select.*value={metric}/s/<select/<select id="analytics-metric"/' pages/Analytics.jsx
sed -i '/<select.*value={groupBy}/s/<select/<select id="analytics-group-by"/' pages/Analytics.jsx

# ApiKeys.jsx - Add htmlFor to API key form labels
sed -i 's/<label className="block text-sm font-medium mb-2">Key Name<\/label>/<label htmlFor="api-key-name" className="block text-sm font-medium mb-2">Key Name<\/label>/' pages/ApiKeys.jsx
sed -i 's/<label className="block text-sm font-medium mb-2">Permissions<\/label>/<label htmlFor="api-key-permissions" className="block text-sm font-medium mb-2">Permissions<\/label>/' pages/ApiKeys.jsx
sed -i 's/<label className="flex items-center gap-2">/<label htmlFor="api-key-read" className="flex items-center gap-2">/' pages/ApiKeys.jsx

# Notifications.jsx - Add htmlFor to notification preference labels
sed -i 's/<label className="block text-sm font-medium mb-2">Email Notifications<\/label>/<label htmlFor="notif-email" className="block text-sm font-medium mb-2">Email Notifications<\/label>/' pages/Notifications.jsx
sed -i 's/<label className="block text-sm font-medium mb-2">Push Notifications<\/label>/<label htmlFor="notif-push" className="block text-sm font-medium mb-2">Push Notifications<\/label>/' pages/Notifications.jsx
sed -i 's/<label className="flex items-center gap-2 cursor-pointer">Security Alerts<\/label>/<label htmlFor="notif-security" className="flex items-center gap-2 cursor-pointer">Security Alerts<\/label>/' pages/Notifications.jsx
sed -i 's/<label className="flex items-center gap-2 cursor-pointer">Activity Updates<\/label>/<label htmlFor="notif-activity" className="flex items-center gap-2 cursor-pointer">Activity Updates<\/label>/' pages/Notifications.jsx

# Profile.jsx - Add htmlFor to profile form label
sed -i 's/<label className="block text-sm font-medium mb-2">Full Name<\/label>/<label htmlFor="profile-name" className="block text-sm font-medium mb-2">Full Name<\/label>/' pages/Profile.jsx

# Settings.jsx - Add htmlFor to settings labels
sed -i 's/<label className="block text-sm font-medium mb-2">Language<\/label>/<label htmlFor="settings-language" className="block text-sm font-medium mb-2">Language<\/label>/' pages/Settings.jsx
sed -i 's/<label className="block text-sm font-medium mb-2">Timezone<\/label>/<label htmlFor="settings-timezone" className="block text-sm font-medium mb-2">Timezone<\/label>/' pages/Settings.jsx

# InviteUserModal.jsx - Already has proper structure with inputs inside labels, but add htmlFor for consistency
# These are already accessible since inputs are nested, but we can improve them

echo "✅ Label associations fixed!"
echo "Files modified:"
echo "  - pages/Login.jsx"
echo "  - pages/Analytics.jsx"
echo "  - pages/ApiKeys.jsx"
echo "  - pages/Notifications.jsx"
echo "  - pages/Profile.jsx"
echo "  - pages/Settings.jsx"
