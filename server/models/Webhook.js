import mongoose from 'mongoose';

const webhookSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid HTTP or HTTPS URL'
    }
  },
  events: [{
    type: String,
    enum: ['user.created', 'user.updated', 'user.deleted', 'team.created', 'team.updated', 'notification.sent'],
    required: true
  }],
  secret: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastTriggered: {
    type: Date
  },
  failureCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
webhookSchema.index({ createdBy: 1, isActive: 1 });
webhookSchema.index({ events: 1 });

// Method to trigger webhook
webhookSchema.methods.trigger = async function(event, data) {
  if (!this.isActive) return;

  try {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    // Create signature for verification
    const crypto = await import('crypto');
    const signature = crypto.default
      .createHmac('sha256', this.secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event,
        'User-Agent': 'UserDashboard-Webhook/1.0'
      },
      body: JSON.stringify(payload),
      timeout: 10000 // 10 second timeout
    });

    if (response.ok) {
      this.lastTriggered = new Date();
      this.failureCount = 0;
      await this.save();
      return { success: true };
    } 
      this.failureCount += 1;
      // Deactivate webhook after 5 consecutive failures
      if (this.failureCount >= 5) {
        this.isActive = false;
      }
      await this.save();
      return { success: false, status: response.status, statusText: response.statusText };
    
  } catch (error) {
    this.failureCount += 1;
    if (this.failureCount >= 5) {
      this.isActive = false;
    }
    await this.save();
    return { success: false, error: error.message };
  }
};

const Webhook = mongoose.model('Webhook', webhookSchema);

export default Webhook;
