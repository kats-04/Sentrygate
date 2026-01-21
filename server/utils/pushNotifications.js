// Ensure 'web-push' is installed: npm install web-push
import webpush from 'web-push';
import NotificationPreference from '../models/NotificationPreference.js';

// Configure web-push with VAPID keys (these should be in environment variables)
// Only set VAPID details if keys are available
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:your-email@example.com', // Replace with your email
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Send push notification to a user
export const sendPushNotification = async (userId, title, body, icon = '/icon-192x192.png', badge = '/icon-192x192.png') => {
  try {
    const preferences = await NotificationPreference.findOne({ userId });

    if (!preferences?.pushNotifications?.enabled || !preferences?.pushNotifications?.subscription) {
      return; // User has disabled push notifications or no subscription
    }

    const payload = JSON.stringify({
      title,
      body,
      icon,
      badge,
      data: {
        url: '/', // Default URL, can be customized
      },
    });

    await webpush.sendNotification(preferences.pushNotifications.subscription, payload);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Save push subscription for a user
export const savePushSubscription = async (userId, subscription) => {
  try {
    await NotificationPreference.findOneAndUpdate(
      { userId },
      {
        $set: {
          'pushNotifications.subscription': subscription,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }
};

// Remove push subscription for a user
export const removePushSubscription = async (userId) => {
  try {
    await NotificationPreference.findOneAndUpdate(
      { userId },
      {
        $unset: {
          'pushNotifications.subscription': 1,
        },
      }
    );
  } catch (error) {
    console.error('Error removing push subscription:', error);
    throw error;
  }
};
