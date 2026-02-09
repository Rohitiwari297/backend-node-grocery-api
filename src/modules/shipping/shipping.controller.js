import Shipping from "../../models/shipping.model.js"
import { ApiError } from "../../shared/utils/ApiError.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js"


export const shippingCharges = asyncHandler(async (req, res) => {
    const { shippingCharge, freeShippingAbove } = req.body;
    if (!shippingCharge || !freeShippingAbove) throw new ApiError(404, 'All fields are mandatory!');

    const shipping = await Shipping.findOneAndUpdate(
        {},
        { shippingCharge, freeShippingAbove },
        { new: true, upsert: true }
    )
    if (!shipping) throw new ApiError(400, 'Failed to updated shipping details!');

    return res.status(201).json(
        new ApiResponse(201, shipping, 'Shipping data create successfully!', true)
    )
})