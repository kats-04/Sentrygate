/* eslint-disable no-param-reassign */
import crypto from 'crypto';
import Webhook from '../models/Webhook.js';

// Generate HMAC signature for webhook payload
export const generateSignature = (payload, secret) => crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex');

// Send webhook request with retry logic
const sendWebhookRequest = async (webhook, event, data, retryCount = 0) => {
  try {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const signature = generateSignature(payload, webhook.secret);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event,
        ...Object.fromEntries(webhook.headers || []),
      },
      body: JSON.stringify(payload),
      timeout: 10000, // 10 second timeout
    });

    if (response.ok) {
      // Update last success
      webhook.lastSuccess = new Date();
      webhook.failureCount = 0;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    webhook.lastTriggered = new Date();
    await webhook.save();
  } catch (error) {
    console.error(`Webhook request failed for ${webhook.url}:`, error);

    webhook.failureCount = (webhook.failureCount || 0) + 1;
    webhook.lastTriggered = new Date();

    // Disable webhook after too many failures
    if (webhook.failureCount > (webhook.retries || 3)) {
      webhook.active = false;
      console.warn(`Webhook ${webhook._id} disabled after ${webhook.failureCount} failures`);
    }

    await webhook.save();

    // Retry with exponential backoff
    if (retryCount < (webhook.retries || 3)) {
      const delay = (webhook.retryDelay || 5000) * 2 ** retryCount;
      setTimeout(
        () => sendWebhookRequest(webhook, event, data, retryCount + 1),
        delay
      );
    }
  }
};

// Trigger webhook events
export const triggerWebhook = async (userId, event, data) => {
  try {
    const webhooks = await Webhook.find({
      userId,
      active: true,
      events: event,
    });

    for (const webhook of webhooks) {
      sendWebhookRequest(webhook, event, data);
    }
  } catch (error) {
    console.error('Error triggering webhooks:', error);
  }
};

// Verify webhook signature (for webhook consumers)
export const verifyWebhookSignature = (payload, signature, secret) => {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

export default {
  triggerWebhook,
  generateSignature,
  verifyWebhookSignature,
};
