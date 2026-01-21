import mongoose from 'mongoose';

const twoFactorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    secret: {
      type: String,
      required: true,
    },
    backupCodes: [{
      type: String,
      required: true,
    }],
    enabled: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    method: {
      type: String,
      enum: ['totp', 'sms', 'email'],
      default: 'totp',
    },
    lastUsed: {
      type: Date,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for performance
// Note: userId index removed because unique: true already creates an index
twoFactorSchema.index({ enabled: 1 });

// Method to check if account is locked
twoFactorSchema.methods.isLocked = function isLocked() {
  return this.lockedUntil && this.lockedUntil > new Date();
};

// Method to increment attempts and lock if necessary
twoFactorSchema.methods.incrementAttempts = function incrementAttempts() {
  this.attempts += 1;
  if (this.attempts >= 5) {
    // Lock for 15 minutes after 5 failed attempts
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  return this.save();
};

// Method to reset attempts on successful verification
twoFactorSchema.methods.resetAttempts = function resetAttempts() {
  this.attempts = 0;
  this.lockedUntil = null;
  this.lastUsed = new Date();
  return this.save();
};

export default mongoose.model('TwoFactor', twoFactorSchema);
