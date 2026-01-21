import express from 'express';
import { protect } from '../middleware/auth.js';
import * as webhookController from '../controllers/webhookController.js';
import { strictLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All webhook routes require authentication
router.use(protect);
router.use(strictLimiter);

// Get all webhooks
router.get('/', webhookController.getWebhooks);

// Get single webhook
router.get('/:id', webhookController.getWebhook);

// Create webhook
router.post('/', webhookController.createWebhook);

// Update webhook
router.put('/:id', webhookController.updateWebhook);

// Delete webhook
router.delete('/:id', webhookController.deleteWebhook);

// Test webhook
router.post('/:id/test', webhookController.testWebhook);

// Get webhook secret
router.get('/:id/secret', webhookController.getWebhookSecret);

// Rotate webhook secret
router.post('/:id/rotate-secret', webhookController.rotateWebhookSecret);

export default router;
