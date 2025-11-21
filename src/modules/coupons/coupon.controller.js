
import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { Coupon } from '../../models/coupon.model.js';


// Get Coupons
export const getCoupons = asyncHandler(async (req, res) => {

    const { isExpired } = req.query;

    let filter = {};

    if (isExpired == 'true') {
        filter.expiryDate = { $lt: new Date() };
    } else {
        filter.expiryDate = { $gt: new Date() };
    }

    const coupons = await Coupon.find(filter);

    return res.status(200).json(new ApiResponse(200, coupons, 'Coupons fetched successfully'));
});

// Add Coupon
export const addCoupon = asyncHandler(async (req, res) => {
    const { title, description, code, discountType, discountValue, minimumOrderAmount, expiryDate, isFirstOrderOnly } = req.body;

    const coupon = await Coupon.create({ title, description, code, discountType, discountValue, minimumOrderAmount, expiryDate, isFirstOrderOnly });


    return res.status(200).json(new ApiResponse(200, coupon, 'Coupon added successfully'));
});
