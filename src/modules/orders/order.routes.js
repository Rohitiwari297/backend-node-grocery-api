import { Router } from 'express';
import { auth } from '../../shared/middlewares/auth.middlewares.js';
import { placeOrder, getUserOrders, getOrderById, updateOrderStatus, getAllOrder } from './order.controller.js';
import { isAdminLoggedIn, isSuperAdmin } from '../../shared/middlewares/admin/auth.middleware.js';

const router = Router();

router.get('/all', isAdminLoggedIn, isSuperAdmin, getAllOrder);

router.use(auth);

router.post('/place', placeOrder);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/status', updateOrderStatus);

export default router;
