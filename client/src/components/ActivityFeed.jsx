import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import api from '../utils/api';
import { Card } from './ui';
import { SkeletonList } from './ui/Skeleton';

export default function ActivityFeed() {
  const { data, isLoading, isError } = useQuery(['activities'], async () => {
    const res = await api.request('/activities?limit=10&skip=0');
    return res.data;
  });

  if (isLoading) return <SkeletonList count={5} />;
  if (isError) return <div className="p-4 text-red-600">Error loading activities</div>;

  return (
    <Card variant="glass" padding="lg">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={20} className="text-primary-600" />
        <h3 className="font-bold text-lg">Recent Activity</h3>
      </div>

      <div className="space-y-3">
        {data && data.length > 0 ? (
          data.map((activity, idx) => (
            <div key={idx} className="p-3 bg-white/30 rounded-lg border border-white/20 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {activity.actorId?.name || 'System'}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">{activity.message}</p>
                  {activity.meta && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {JSON.stringify(activity.meta).slice(0, 50)}...
                    </p>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-600 dark:text-slate-400">No recent activity</p>
        )}
      </div>
    </Card>
  );
}
