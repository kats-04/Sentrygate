// import webpush from 'web-push';
import Notification from '../models/Notification.js';
import NotificationPreference from '../models/NotificationPreference.js';
// import User from '../models/User.js';
import { sendPushNotification } from '../utils/pushNotifications.js';

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;
    const query = { userId: req.user.id };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get notification preferences
export const getPreferences = async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({ userId: req.user.id });

    if (!preferences) {
      preferences = await NotificationPreference.create({ userId: req.user.id });
    }

    res.json(preferences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update notification preferences
export const updatePreferences = async (req, res) => {
  try {
    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, upsert: true }
    );

    res.json(preferences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create notification with real-time Socket.io alerts (Phase 5)
export const createNotification = async (userId, type, title, message, actionUrl = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      actionUrl,
    });

    // Send real-time notification via Socket.io
    if (global.io) {
      global.io.to(`user_${userId}`).emit('new-notification', {
        notification,
        unreadCount: await Notification.countDocuments({ userId, read: false }),
      });
    }

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

// Send bulk notifications
export const sendBulkNotifications = async (req, res) => {
  try {
    const { userIds, type, title, message, actionUrl } = req.body;

    const notifications = await Notification.insertMany(
      userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        actionUrl,
      }))
    );

    // Send push notifications for bulk notifications
    for (const userId of userIds) {
      await sendPushNotification(userId, title, message);
    }

    res.json({ success: true, count: notifications.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Subscribe to push notifications
export const subscribeToPush = async (req, res) => {
  try {
    const { subscription } = req.body;
    await NotificationPreference.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          'pushNotifications.subscription': subscription,
        },
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async (req, res) => {
  try {
    await NotificationPreference.findOneAndUpdate(
      { userId: req.user.id },
      {
        $unset: {
          'pushNotifications.subscription': 1,
        },
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
