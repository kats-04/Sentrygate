import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: String,
    ipAddress: String,
    userAgent: String,
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    success: {
      type: Boolean,
      default: true,
    },
    failureReason: String,
    // Security monitoring fields
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    isHighRisk: {
      type: Boolean,
      default: false
    },
    alertType: String, // 'brute_force', 'privilege_escalation', 'impossible_travel'
  },
  { timestamps: true }
);

export default mongoose.model('LoginHistory', loginHistorySchema);
