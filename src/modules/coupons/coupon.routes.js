import { Router } from 'express';
import { addCoupon, getCoupons } from './coupon.controller.js';

const router = Router();

router.route("/")
    .get(getCoupons)
    .post(addCoupon);

export default router;