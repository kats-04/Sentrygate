import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
    allowRegistrations: {
        type: Boolean,
        default: true,
    },
    maintenanceMode: {
        type: Boolean,
        default: false,
    },
    sessionTimeout: {
        type: Number,
        default: 60, // minutes
    },
    enforceMFA: {
        type: Boolean,
        default: false,
    },
    defaultUserRole: {
        type: String,
        enum: ['User', 'Auditor'],
        default: 'User',
    },
}, { timestamps: true });

// Singleton pattern: ensure only one settings document exists
systemSettingSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return this.create({});
};

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
