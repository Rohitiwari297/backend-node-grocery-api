import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { Notification } from '../../models/notification.model.js';
import { logger } from '../../core/logger/index.js';
import { sendFCM } from '../../shared/services/fcm.service.js';

// Send a notification via FCM
export const sendNotification = asyncHandler(async (req, res) => {

  const { token, tokens, topic, title, body, data = {}, imageUrl, silent = false, } = req.body;

  // Validate target
  if (!token && !tokens && !topic) {
    throw new ApiError(400, "At least one target (token, tokens, or topic) is required");
  }

  // Validate visible notification
  if (!silent && (!title || !body)) {
    throw new ApiError(400, "title and body are required for visible notification");
  }

  const result = await sendFCM({
    token: token ?? null,
    tokens: tokens ?? null,
    topic: topic ?? null,
    title,
    body,
    data,
    imageUrl,
    silent,
  });

  return res.status(200).json(new ApiResponse(200, result, "Notification sent successfully"));
});



// Create a new notification
export const addNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type, relatedId } = req.body;

  // Validate required fields
  if (!title || !message) {
    throw new ApiError(400, 'Title and message are required');
  }

  // Validate type if provided
  const validTypes = ['order', 'promotion', 'system', 'delivery'];
  if (type && !validTypes.includes(type)) {
    throw new ApiError(400, `Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Create new notification
  const notification = new Notification({
    userId: userId,
    title,
    message,
    type: type || 'system',
    relatedId: relatedId || null,
  });

  await notification.save();

  logger.info(`Notification created for user {req.user._id}: ${title}`);

  return res.json(new ApiResponse(200, { notification }, 'Notification created successfully'));
});

// Get all notifications for authenticated user
export const getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

  const total = await Notification.countDocuments({ userId: req.user._id });

  logger.info(`Fetched ${notifications.length} notifications for user {req.user._id}`);

  return res.json(
    new ApiResponse(
      200,
      {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
        notifications,
      },
      'Notifications fetched successfully',
    ),
  );
});

// Get unread notifications count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });

  return res.json(new ApiResponse(200, { unreadCount }, 'Unread count fetched successfully'));
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this notification');
  }

  notification.isRead = true;
  await notification.save();

  logger.info(`Notification ${notificationId} marked as read by user ${req.user._id}`);

  return res.json(new ApiResponse(200, notification, 'Notification marked as read'));
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });

  logger.info(`Marked ${result.modifiedCount} notifications as read for user ${req.user._id}`);

  return res.json(new ApiResponse(200, result, 'All notifications marked as read'));
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this notification');
  }

  await Notification.findByIdAndDelete(notificationId);

  logger.info(`Notification ${notificationId} deleted by user ${req.user._id}`);

  return res.json(new ApiResponse(200, {}, 'Notification deleted successfully'));
});

// Clear all notifications for user
export const clearAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({ userId: req.user._id });

  logger.info(`Cleared ${result.deletedCount} notifications for user ${req.user._id}`);

  return res.json(new ApiResponse(200, result, 'All notifications cleared successfully'));
});
