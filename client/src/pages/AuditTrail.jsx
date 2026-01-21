import { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, Badge } from '../components/ui';
import DashboardShell from '../components/layout/DashboardShell';
import api from '../utils/api';

export default function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const res = await api.get('/activities?limit=50');
      console.log('Activities API Response:', res);
      return res;
    },
  });

  // Ensure activities is always an array with proper null checks
  const activities = Array.isArray(data?.data?.data)
    ? data.data.data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  console.log('Extracted activities:', activities);

  const filteredActivities = Array.isArray(activities)
    ? activities.filter(activity =>
      activity.actionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.message?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getSeverityColor = (actionType) => {
    if (actionType?.includes('REGISTER') || actionType?.includes('LOGIN')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
    if (actionType?.includes('LOGOUT') || actionType?.includes('UPDATE')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  };

  const stats = {
    total: Array.isArray(activities) ? activities.length : 0,
    today: Array.isArray(activities) ? activities.filter(a => {
      const today = new Date();
      const actDate = new Date(a.createdAt);
      return actDate.toDateString() === today.toDateString();
    }).length : 0,
  };

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-headline-2 mb-2">Audit Trail</h1>
        <p className="text-body-small">Complete security and activity log</p>
      </div>

      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.total}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.today}</p>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by action or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        </Card>

        {/* Activity Log */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading activities...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No activities found</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredActivities.map(activity => (
                <div
                  key={activity._id}
                  className={`p-6 transition ${activity.isHighRisk || activity.severity === 'critical' || activity.severity === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {activity.severity === 'critical' || activity.severity === 'high' ? (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {activity.actionType}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {activity.message || `${activity.actorId?.name || 'User'} - ${activity.actionType}`}
                        </p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(activity.actionType)}>
                      {activity.actionType}
                    </Badge>
                  </div>

                  {/* Column Prioritization: Hide user details on small screens */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTime(activity.createdAt)}
                    </div>
                    {/* Hide user column on mobile, show on md+ */}
                    <div className="hidden md:block">
                      User: {activity.actorId?.name || activity.actorId?.email || 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
