import mongoose from 'mongoose';
import crypto from 'crypto';

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
    },
    lastFourCharacters: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      default: ['read:users', 'read:teams', 'read:analytics'],
      enum: [
        'read:users',
        'write:users',
        'read:teams',
        'write:teams',
        'read:analytics',
        'read:notifications',
        'write:notifications',
        'admin:all',
      ],
    },
    rateLimit: {
      requestsPerMinute: {
        type: Number,
        default: 60,
      },
      requestsPerDay: {
        type: Number,
        default: 10000,
      },
    },
    ipWhitelist: {
      type: [String],
      default: [],
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Generate and hash API key before saving
apiKeySchema.pre('save', function (next) {
  if (this.isNew && this.keyHash) {
    return next();
  }
  next();
});

apiKeySchema.statics.generateKey = function () {
  return crypto.randomBytes(32).toString('hex');
};

apiKeySchema.statics.hashKey = function (key) {
  return crypto.createHash('sha256').update(key).digest('hex');
};

export default mongoose.model('ApiKey', apiKeySchema);
