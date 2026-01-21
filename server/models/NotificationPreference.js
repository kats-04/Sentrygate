import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    emailNotifications: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['instant', 'daily', 'weekly'],
        default: 'daily',
      },
    },
    pushNotifications: {
      enabled: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true },
      subscription: mongoose.Schema.Types.Mixed,
    },
    inAppNotifications: {
      enabled: { type: Boolean, default: true },
    },
    notificationTypes: {
      userActivity: { type: Boolean, default: true },
      teamUpdates: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      systemNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('NotificationPreference', notificationPreferenceSchema);
