import Notification from '../models/Notification.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { User } from '../models/User.js';
import { io } from '../../server.js';
import logger from '../utils/logger.js';

/**
 * Send a notification to a specific user
 * Saves to DB and emits via Socket.io
 * 
 * @param {string} userId - User ID to send to
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {string} type - 'info' | 'order' | 'promo' | 'alert'
 * @param {string|null} relatedId - Optional related entity ID (e.g. Order ID)
 */
export const sendNotification = async (userId, title, message, type = 'info', relatedId = null) => {
    try {
        // 1. Save to Database
        const notification = await Notification.create({
            user: userId,
            title,
            message,
            type,
            relatedId,
            isRead: false
        });

        // 2. Emit Real-Time Event
        if (io) {
            // Clients must join room `user:{userId}`
            io.to(`user:${userId}`).emit('notification:new', notification);
            logger.info(`🔔 Notification sent to user ${userId}: ${title}`);
        }

        return notification;
    } catch (error) {
        logger.error(`Failed to send notification to user ${userId}:`, error);
        // Don't throw, just log error so main flow (e.g. order creation) doesn't fail
    }
};

/**
 * Send notification to ALL admins if the setting is enabled
 * 
 * @param {string} settingKey - Key in PlatformSettings.notifications (e.g. 'newOrder')
 * @param {string} title 
 * @param {string} message 
 * @param {string} type 
 * @param {string|null} relatedId 
 */
export const sendAdminNotification = async (settingKey, title, message, type = 'info', relatedId = null) => {
    try {
        // 1. Check if notification is enabled in settings
        const settings = await PlatformSettings.getSettings();

        // If specific settingKey is provided and disabled, skip
        if (settingKey && settings.notifications && settings.notifications[settingKey] === false) {
            logger.info(`🔕 Skipped admin notification (${settingKey}): Setting disabled`);
            return;
        }

        // 2. Find all admins
        const admins = await User.find({ role: 'admin' }).select('_id');

        if (!admins.length) return;

        // 3. Send to each admin
        const promises = admins.map(admin =>
            sendNotification(admin._id, title, message, type, relatedId)
        );

        await Promise.all(promises);
        logger.info(`📢 Sent admin notification (${settingKey}) to ${admins.length} admins`);

    } catch (error) {
        logger.error(`Failed to send admin notification (${settingKey}):`, error);
    }
};

export default {
    sendNotification,
    sendAdminNotification
};
