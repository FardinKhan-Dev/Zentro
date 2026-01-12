import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['info', 'order', 'promo', 'alert'],
            default: 'info',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId, // e.g. Order ID
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficiently fetching unread notifications
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 }); // For sorting by newest
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
