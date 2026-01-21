import { z } from 'zod';
import SystemSetting from '../models/SystemSetting.js';

const settingsSchema = z.object({
    allowRegistrations: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
    sessionTimeout: z.number().min(5).max(1440).optional(), // 5 mins to 24 hours
    enforceMFA: z.boolean().optional(),
    defaultUserRole: z.enum(['User', 'Auditor']).optional(),
});

// Get current system settings
export async function getSettings(req, res) {
    try {
        const settings = await SystemSetting.getSettings();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Update system settings (Admin only)
export async function updateSettings(req, res) {
    try {
        const data = settingsSchema.parse(req.body);
        const settings = await SystemSetting.getSettings();

        // Update fields
        Object.assign(settings, data);
        await settings.save();

        res.json(settings);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors });
        }
        res.status(500).json({ message: err.message });
    }
}
