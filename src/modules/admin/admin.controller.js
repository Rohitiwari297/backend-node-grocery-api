import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import Admin from "../../models/admin/admin.model.js";
import bcrypt from 'bcrypt'
import { ApiError } from "../../shared/utils/ApiError.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { setAuthCookie } from '../../shared/utils/cookies.js'


// CREATE ADMIN
export const createAdmin = asyncHandler(async (req, res) => {
    const {userId, password, role} =  req.body

    if (!userId || !password || !role){
        throw new ApiError(400, "Failed! All fields are required")
    }
    const existingUser = await Admin.findOne({userId})
    if(existingUser) throw new ApiError(400, 'Failed! This admin already registed');

    try {
        const hashedPassword = await bcrypt.hash(password, Number(process.env.PASSWORD_ENCRYPT_CODE) || 10)
        const admin = await Admin.create({
            userId: userId,
            password: hashedPassword,
            role: role.toUpperCase()
        })

        const resObj = {
            userId: admin.userId,
            role: admin.role
        }

        if(!admin) throw new ApiError(500, 'Error while creating the Admin');
        const AdminObj = admin.toObject()
        return  res.status(201).json(new ApiResponse(201, resObj, 'Admin create successfully', true))
    } catch (error) {
        throw new ApiError(500, error.message)
    }






});

// LOGIN ADMIN
export const loginAdmin = asyncHandler(async (req, res) => {
    const { userId, password } = req.body;
    if( !userId ) throw new ApiError(400, "Failed! userId can't be empty");
    if( !password ) throw new ApiError(400, "Failed! password can't be empty");

    const admin = await Admin.findOne({userId}).select('+password')
    if( !admin ) throw new ApiError(401, "Invalid userId, Please contact Super Admin!");

    const validatePassword = await bcrypt.compare(password, admin.password)
    if ( !validatePassword ) throw new ApiError(401, "Invalid password! Please try again");

    //generate toke with cookie
    const token = admin.generateAdminToken();
     // set cookie (reusable util)
    setAuthCookie(res, token);

    const resObj = {
        userId: admin.userId,
        role: admin.role
    }

    return res.status(200)
        .json(new ApiResponse(200, resObj, 'Admin logged in successfully', true)
    )

})