# Quick fixes for common unused imports based on lint output

cd /c/Users/Name/Desktop/user_profile_manager/client/src

# Analytics.jsx - Remove Edit, queryClient
sed -i "s/, Edit//" pages/Analytics.jsx
sed -i "/const queryClient = useQueryClient();/d" pages/Analytics.jsx

# ApiKeys.jsx - Remove Eye, EyeOff, AlertCircle  
sed -i "s/, Eye, EyeOff, AlertCircle//" pages/ApiKeys.jsx

# AuditTrail.jsx - Remove useEffect, Download
sed -i "s/useEffect, //" pages/AuditTrail.jsx
sed -i "s/, Download//" pages/AuditTrail.jsx

# Dashboard.jsx - Remove BarChart2, Clock
sed -i "s/, BarChart2, Clock//" pages/Dashboard.jsx

# Notifications.jsx - Remove setLoading
sed -i "/const \[loading, setLoading\]/s/setLoading//" pages/Notifications.jsx

# Profile.jsx - Remove MapPin, Badge, isLoading
sed -i "s/, MapPin//" pages/Profile.jsx
sed -i "s/, Badge//" pages/Profile.jsx
sed -i "/const { data, isLoading }/s/isLoading, //" pages/Profile.jsx

# SecurityCenter.jsx - Remove useEffect, LogOut
sed -i "s/useEffect, //" pages/SecurityCenter.jsx  
sed -i "s/, LogOut//" pages/SecurityCenter.jsx

# Settings.jsx - Remove Badge
sed -i "s/, Badge//" pages/Settings.jsx

# Teams.jsx - Remove useEffect, api, setLoading
sed -i "s/useEffect, //" pages/Teams.jsx
sed -i "/import api from/d" pages/Teams.jsx
sed -i "/const \[loading, setLoading\]/s/setLoading//" pages/Teams.jsx

# AdminDashboard.jsx - Remove loading, setFilter
sed -i "/const \[loading\] = useState/d" pages/admin/AdminDashboard.jsx
sed -i "/const \[filter, setFilter\]/s/setFilter//" pages/admin/AdminDashboard.jsx

# UserList.jsx - Remove _key
sed -i "/const { _key, /s/_key, //" components/UserList.jsx

echo "Unused imports cleaned up!"
