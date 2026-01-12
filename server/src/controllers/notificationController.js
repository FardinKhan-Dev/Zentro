import Notification from '../models/Notification.js';
import { catchAsync } from '../utils/errorHandler.js';
import { customResponse } from '../utils/response.js';

/**
 * GET /api/notifications
 * Get user's notifications (paginated)
 */
export const getNotifications = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Notification.countDocuments({ user: req.user.id });
    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    return customResponse(res, {
        status: 200,
        success: true,
        data: {
            notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            unreadCount,
        },
    });
});

/**
 * GET /api/notifications/unread-count
 * Get only unread count (lighter weight)
 */
export const getUnreadCount = catchAsync(async (req, res) => {
    const count = await Notification.countDocuments({ user: req.user.id, isRead: false });

    return customResponse(res, {
        status: 200,
        success: true,
        data: { count },
    });
});

/**
 * PATCH /api/notifications/:id/read
 * Mark single notification as read
 */
export const markAsRead = catchAsync(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        return customResponse(res, {
            status: 404,
            success: false,
            message: 'Notification not found',
        });
    }

    return customResponse(res, {
        status: 200,
        success: true,
        data: { notification },
    });
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
export const markAllAsRead = catchAsync(async (req, res) => {
    await Notification.updateMany(
        { user: req.user.id, isRead: false },
        { isRead: true }
    );

    return customResponse(res, {
        status: 200,
        success: true,
        message: 'All notifications marked as read',
    });
});

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
};
