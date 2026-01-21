import crypto from 'crypto';
import { z } from 'zod';
import Webhook from '../models/Webhook.js';

const webhookSchema = z.object({
  url: z.string().url('Invalid URL'),
  events: z.array(z.enum([
    'user.created',
    'user.updated',
    'user.deleted',
    'team.created',
    'team.updated',
    'team.deleted',
    'activity.logged',
    'notification.sent',
    'security.alert',
  ])),
  headers: z.record(z.string()).optional(),
  retries: z.number().min(0).max(10).optional(),
  retryDelay: z.number().min(1000).optional(),
});

// Get all webhooks for user
export const getWebhooks = async (req, res) => {
  try {
    const webhooks = await Webhook.find({ userId: req.user._id }).select('-secret');
    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single webhook
export const getWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const webhook = await Webhook.findOne({
      _id: id,
      userId: req.user._id,
    }).select('-secret');

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json(webhook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create webhook
export const createWebhook = async (req, res) => {
  try {
    const data = webhookSchema.parse(req.body);

    const webhook = new Webhook({
      userId: req.user._id,
      url: data.url,
      events: data.events,
      headers: data.headers || {},
      secret: crypto.randomBytes(32).toString('hex'),
      retries: data.retries || 3,
      retryDelay: data.retryDelay || 5000,
    });

    await webhook.save();

    // Return webhook without secret
    const { secret, ...webhookData } = webhook.toObject();
    res.status(201).json(webhookData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update webhook
export const updateWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const data = webhookSchema.partial().parse(req.body);

    const webhook = await Webhook.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      data,
      { new: true }
    ).select('-secret');

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json(webhook);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete webhook
export const deleteWebhook = async (req, res) => {
  try {
    const { id } = req.params;

    const webhook = await Webhook.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Test webhook
export const testWebhook = async (req, res) => {
  try {
    const { id } = req.params;

    const webhook = await Webhook.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook' },
    };

    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(testPayload))
      .digest('hex');

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': 'test',
          ...Object.fromEntries(webhook.headers || []),
        },
        body: JSON.stringify(testPayload),
        timeout: 10000,
      });

      res.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
      });
    } catch (fetchError) {
      res.status(400).json({
        success: false,
        error: fetchError.message,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get webhook secret
export const getWebhookSecret = async (req, res) => {
  try {
    const { id } = req.params;

    const webhook = await Webhook.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json({ secret: webhook.secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rotate webhook secret
export const rotateWebhookSecret = async (req, res) => {
  try {
    const { id } = req.params;

    const webhook = await Webhook.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { secret: crypto.randomBytes(32).toString('hex') },
      { new: true }
    ).select('-secret');

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json(webhook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getWebhooks,
  getWebhook,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookSecret,
  rotateWebhookSecret,
};
