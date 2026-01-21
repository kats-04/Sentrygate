/* 
 * Notifications Page
 */
import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SkeletonList } from '../components/ui/Skeleton';
import DashboardShell from '../components/layout/DashboardShell';
import api from '../utils/api';
import { subscribeToPushNotifications } from '../utils/pushNotifications';
import { useNotification } from '../context/NotificationContext';

export default function Notifications() {
  const {
    notifications,
    loading: notificationsLoading,
    markAsRead,
    deleteNotification
  } = useNotification();

  const [preferences, setPreferences] = useState(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  useEffect(() => {
    fetchPreferences();

    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      checkPushSubscription();
    }
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoadingPreferences(true);
      const res = await api.notifications.getPreferences();
      setPreferences(res.data);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const checkPushSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const handlePushSubscription = async () => {
    if (pushSubscribed) {
      // Unsubscribe
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await api.notifications.unsubscribePush();
          setPushSubscribed(false);
        }
      } catch (error) {
        console.error('Error unsubscribing from push:', error);
      }
    } else {
      // Subscribe
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        setPushSubscribed(true);
      }
    }
  };

  const updatePreferences = async (newPrefs) => {
    try {
      setUpdating(true);
      // Optimistic update
      setPreferences(newPrefs);

      await api.notifications.updatePreferences(newPrefs);
    } catch (err) {
      console.error('Failed to update preferences:', err);
      // Revert on error if needed, or just let the next fetch fix it
      fetchPreferences();
    } finally {
      setUpdating(false);
    }
  };

  if (notificationsLoading || loadingPreferences) return <SkeletonList count={5} />;

  const typeColors = {
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    alert: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your alerts and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Recent Notifications</h2>
            {notifications.length === 0 ? (
              <Card className="glass-effect p-6 text-center">
                <p className="text-slate-600 dark:text-slate-400">No notifications</p>
              </Card>
            ) : (
              notifications.map(notif => (
                <Card key={notif._id} className={`glass-effect p-4 cursor-pointer hover:shadow-lg transition ${!notif.read ? 'border-l-4 border-blue-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${typeColors[notif.type]}`}>
                        {notif.type.toUpperCase()}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-2">
                        {notif.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!notif.read && (
                        <Button
                          size="sm"
                          onClick={() => markAsRead(notif._id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notif._id)}
                        className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">Preferences</h2>
            {preferences && (
              <Card className="glass-effect p-6 space-y-4">
                {/* Email Notifications */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications?.enabled}
                      onChange={(e) => updatePreferences({
                        ...preferences,
                        emailNotifications: { ...preferences.emailNotifications, enabled: e.target.checked }
                      })}
                      disabled={updating}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-900 dark:text-slate-50 font-semibold">Email Notifications</span>
                  </label>
                  {preferences.emailNotifications?.enabled && (
                    <select
                      value={preferences.emailNotifications?.frequency || 'daily'}
                      onChange={(e) => updatePreferences({
                        ...preferences,
                        emailNotifications: { ...preferences.emailNotifications, frequency: e.target.value }
                      })}
                      disabled={updating}
                      className="mt-2 w-full p-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="instant">Instant</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                    </select>
                  )}
                </div>

                {/* Push Notifications */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={preferences.pushNotifications?.enabled}
                      onChange={(e) => updatePreferences({
                        ...preferences,
                        pushNotifications: { ...preferences.pushNotifications, enabled: e.target.checked }
                      })}
                      disabled={updating}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-900 dark:text-slate-50 font-semibold">Push Notifications</span>
                  </label>
                  {preferences.pushNotifications?.enabled && (
                    <>
                      <label className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          checked={preferences.pushNotifications?.soundEnabled}
                          onChange={(e) => updatePreferences({
                            ...preferences,
                            pushNotifications: { ...preferences.pushNotifications, soundEnabled: e.target.checked }
                          })}
                          disabled={updating}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-700 dark:text-slate-300 text-sm">Enable Sound</span>
                      </label>
                      {pushSupported && (
                        <Button
                          size="sm"
                          onClick={handlePushSubscription}
                          className="mt-2 w-full"
                          variant={pushSubscribed ? "destructive" : "default"}
                        >
                          {pushSubscribed ? 'Unsubscribe from Push' : 'Subscribe to Push'}
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Notification Types */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-2">Notification Types</h3>
                  <div className="space-y-2">
                    {Object.entries(preferences.notificationTypes || {}).map(([key, enabled]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => updatePreferences({
                            ...preferences,
                            notificationTypes: {
                              ...preferences.notificationTypes,
                              [key]: e.target.checked
                            }
                          })}
                          disabled={updating}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-700 dark:text-slate-300 text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
