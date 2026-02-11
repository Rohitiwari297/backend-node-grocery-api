

import delivery from "../../../modules/delievery/delivery.routes";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import jwt from 'jsonwebtoken'

export const isLoggedIn = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    console.log("Token", token)

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Un-authorized!, No token provided",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_DELIVERY_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        throw ApiError(401, `Un-authorized! Invalid token, Error: ${error}`)
    }



})