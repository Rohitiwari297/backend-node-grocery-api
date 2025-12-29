import { Router } from 'express';
import { auth } from '../../shared/middlewares/auth.middlewares.js';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, getCartCount } from './cart.controller.js';

const router = Router();

// All routes require authentication
router.use(auth);

// GET endpoints
router.get('/', getCart);
router.get('/count', getCartCount);

// POST endpoints
router.post('/add', addToCart);

// PATCH endpoints
router.patch('/update', updateCartItem);

// DELETE endpoints
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
