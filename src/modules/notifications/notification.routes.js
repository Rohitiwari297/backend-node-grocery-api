import express from 'express';
import { auth } from '../../shared/middlewares/auth.middlewares.js';
import {
  addNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  sendNotification,
} from './notification.controller.js';

const router = express.Router();


// public routes
router.post('/send', sendNotification);

// All routes require authentication
router.use(auth);

// POST endpoints
router.post('/', addNotification);

// GET endpoints
router.get('/', getUserNotifications);
router.get('/unread/count', getUnreadCount);

// PUT endpoints
router.put('/:notificationId/read', markAsRead);
router.put('/mark-all/read', markAllAsRead);

// DELETE endpoints
router.delete('/:notificationId', deleteNotification);
router.delete('/clear/all', clearAllNotifications);

export default router;