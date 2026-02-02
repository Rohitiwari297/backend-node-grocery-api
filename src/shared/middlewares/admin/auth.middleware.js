import { adminRole } from "../../constants.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'


export const isAdminLoggedIn = asyncHandler(async (req, res, next) => {
    const { adminToken } = req.cookies;
    if (!adminToken) throw new ApiError(401, 'Un-authenticated! No token provided!');

    console.log('Token received in middleware:', adminToken);

    const decoded = jwt.verify(adminToken, process.env.JWT_ADMIN_SECRET)
    req.user = decoded; // { id, username, role } -> after decoded

    console.log("Decoded User:", decoded)


    next();
})

export const isSuperAdmin = asyncHandler(async (req, res, next) => {
    const { role } = req.user;

    if (!role) throw new ApiError(401, 'Role is required');

    if (role !== adminRole.super_admin) {
        throw new ApiError(403, 'Unauthorized! Super admin only');
    }

    next();
});
