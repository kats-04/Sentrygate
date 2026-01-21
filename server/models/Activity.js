import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const activitySchema = new Schema(
  {
    // Actor information
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actor: {
      name: String,
      email: String,
      role: String,
    },

    // Target resource
    targetId: { type: Schema.Types.ObjectId, refPath: 'targetModel' },
    targetModel: { type: String, enum: ['User', 'Activity'] },
    targetInfo: Schema.Types.Mixed,

    // Action details
    actionType: {
      type: String,
      enum: ['LOGIN', 'LOGOUT', 'REGISTER', 'PROFILE_UPDATE', 'ROLE_CHANGE', 'USER_DELETE', 'USER_CREATE', 'EXPORT', 'SEARCH'],
      required: true,
    },
    message: { type: String, required: true },
    description: String,

    // Request metadata
    ipAddress: { type: String, sparse: true },
    userAgent: { type: String, sparse: true },
    location: {
      country: String,
      city: String,
      region: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    device: {
      type: String,
      enum: ['Desktop', 'Tablet', 'Mobile', 'Unknown'],
      default: 'Unknown',
    },
    browser: String,
    os: String,
    endpoint: String,
    method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },

    // Result tracking
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'PARTIAL'], default: 'SUCCESS' },
    errorMessage: String,
    duration: Number, // milliseconds

    // Additional context
    metadata: {
      changes: Schema.Types.Mixed, // What was changed
      previousValues: Schema.Types.Mixed, // Original values
      newValues: Schema.Types.Mixed, // Updated values
    },

    // Audit trail
    severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' },
    tags: [String], // For categorization and filtering
  },
  { timestamps: true }
);

// Indexes for performance
activitySchema.index({ createdAt: -1 }); // Most recent activities
activitySchema.index({ actorId: 1, createdAt: -1 }); // User activities
activitySchema.index({ actionType: 1, createdAt: -1 }); // Activity type trends
activitySchema.index({ targetId: 1 }); // Activities on specific resources
activitySchema.index({ status: 1 }); // Failed activities
activitySchema.index({ severity: 1 }); // Critical events
activitySchema.index({ 'metadata.tags': 1 }); // Search by tags

const Activity = model('Activity', activitySchema);
export default Activity;
