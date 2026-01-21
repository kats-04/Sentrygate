import React, { useEffect } from 'react';
import { TrendingUp, Users, Activity, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Badge } from '../components/ui';
import { DashboardShell } from '../components/layout';
import { useAnalytics, useAuth } from '../hooks';
import GrowthTrendChart from '../components/GrowthTrendChart';

/**
 * Dashboard Home Page
 */
const Dashboard = () => {
  const { user } = useAuth();
  const { stats, summary, loading, error, fetchStats, fetchDashboardSummary } = useAnalytics();

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchDashboardSummary();
    }
  }, [user, fetchStats, fetchDashboardSummary]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getTimeDifference = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Build analytics cards from real data
  const analyticsCards = stats
    ? [
      {
        id: 1,
        title: 'Total Users',
        value: stats.totalUsers || 0,
        icon: Users,
        change: '+12%',
        isPositive: true,
      },
      {
        id: 2,
        title: 'Active Sessions',
        value: stats.activeSessions || 0,
        icon: Activity,
        change: '+5%',
        isPositive: true,
      },
      {
        id: 3,
        title: 'Admin Users',
        value: stats.roleDistribution?.Admin || 0,
        icon: TrendingUp,
        change: 'No change',
        isPositive: false,
      },
    ]
    : [];

  return (
    <DashboardShell>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-headline-2 mb-2">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-body-small">
          Here's what's happening with your dashboard today
        </p>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Analytics Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {loading
          ? [1, 2, 3].map((i) => (
            <motion.div key={i} variants={cardVariants}>
              <Card variant="glass" padding="md">
                <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </Card>
            </motion.div>
          ))
          : analyticsCards.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={index} variants={cardVariants} className="w-full">
                <Card variant="glass" padding="lg" className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <Badge
                      variant={item.isPositive ? 'success' : 'warning'}
                      size="sm"
                    >
                      {item.change}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    {item.value}
                  </p>
                </Card>
              </motion.div>
            );
          })}
      </motion.div>

      {/* Bottom Section - Chart Placeholder and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <GrowthTrendChart
            data={stats?.growth || []}
            loading={loading}
          />
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7 }}
        >
          <Card variant="glass" padding="lg" className="h-full">
            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="text-slate-500 text-center py-4">Loading...</div>
              ) : summary?.recentActivity?.length ? (
                summary.recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 pb-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex-center flex-shrink-0 font-semibold text-primary-600 dark:text-primary-400">
                      {activity.actor?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">
                        {activity.message}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {activity.actor?.email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {getTimeDifference(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4 text-sm">
                  No recent activity
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardShell>
  );
};

export default Dashboard;
