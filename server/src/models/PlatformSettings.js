import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema({
    storeName: {
        type: String,
        default: 'Zentro Store'
    },
    supportEmail: {
        type: String,
        default: 'support@zentro.com'
    },
    storeDescription: {
        type: String,
        default: 'The best place to find amazing products.'
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP'],
        default: 'USD'
    },
    notifications: {
        newOrder: { type: Boolean, default: true },
        lowStock: { type: Boolean, default: true },
        newSignup: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: true }
    },
    security: {
        sessionTimeout: { type: String, default: '30' }, // minutes
        passwordPolicy: { type: String, enum: ['strong', 'medium', 'weak'], default: 'strong' },
        twoFactorAuth: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Ensure only one document exists
platformSettingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({});
};

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

export default PlatformSettings;
