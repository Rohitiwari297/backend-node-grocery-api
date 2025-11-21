import { Router } from 'express';
import { auth } from '../../shared/middlewares/auth.middlewares.js';
import {
    placeOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
} from './order.controller.js';

const router = Router();

router.use(auth);

router.post('/place', placeOrder);
router.get('/', getUserOrders);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/status', updateOrderStatus);

export default router;
