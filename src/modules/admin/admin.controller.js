import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import Admin from "../../models/admin/admin.model.js";
import bcrypt from 'bcrypt'
import { ApiError } from "../../shared/utils/ApiError.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { clearAuthCookie, setAuthCookie } from '../../shared/utils/cookies.js'
import Delivery from "../../models/delievery.model.js";
import { Order } from '../../models/order.model.js';


// CREATE ADMIN
export const createAdmin = asyncHandler(async (req, res) => {
    const { username, password, role } = req.body

    if (!username || !password || !role) {
        throw new ApiError(400, "Failed! All fields are required")
    }
    const existingUser = await Admin.findOne({ username })
    if (existingUser) throw new ApiError(400, 'Failed! This admin already registed');

    try {
        const hashedPassword = await bcrypt.hash(password, Number(process.env.PASSWORD_ENCRYPT_CODE) || 10)
        const admin = await Admin.create({
            username: username,
            password: hashedPassword,
            role: role.toUpperCase()
        })

        const resObj = {
            username: admin.username,
            role: admin.role
        }

        if (!admin) throw new ApiError(500, 'Error while creating the Admin');
        const AdminObj = admin.toObject()
        return res.status(201).json(new ApiResponse(201, resObj, 'Admin create successfully', true))
    } catch (error) {
        throw new ApiError(500, error.message)
    }






});

// LOGIN ADMIN
export const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username) throw new ApiError(400, "Failed! username can't be empty");
    if (!password) throw new ApiError(400, "Failed! password can't be empty");

    const admin = await Admin.findOne({ username }).select('+password')
    if (!admin) throw new ApiError(401, "Invalid username, Please contact Super Admin!");

    const validatePassword = await bcrypt.compare(password, admin.password)
    if (!validatePassword) throw new ApiError(401, "Invalid password! Please try again");

    //generate toke with cookie
    const token = admin.generateAdminToken();
    // set cookie (reusable util)
    setAuthCookie(res, token);

    const resObj = {
        username: admin.username,
        role: admin.role
    }

    return res.status(200)
        .json(new ApiResponse(200, resObj, 'Admin logged in successfully', true)
        )

})

// LOG OUT ADMIN
export const logOutAdmin = asyncHandler(async (req, res) => {
    clearAuthCookie(res, "adminToken")
    res.status(200).json(
        new ApiResponse(200, {}, "Admin log out successfully", true)
    )
})

//GET PROFILE DETAILS (FOR ADMIN AND SUPER ADMIN)
export const getProfile = asyncHandler(async (req, res) => {

    const profile = await Admin.findById(req.user._id);

    if (!profile) throw new ApiError(404, 'Admin not found!');

    return res.status(200).json(
        new ApiResponse(200, profile, 'Details fetched successfully!', true)
    );
});


//GET ADMINS DETAILS (ONLY FOR THE SUPER ADMIN)
export const fetchedAdminsList = asyncHandler(async (req, res) => {
    const { id } = req.query;
    const queryObj = {}

    if (id) { queryObj._id = id; }

    // console.log('queryObj:', queryObj)

    //EXCLUDE SUPER ADMIN IF QUERY OBJ === EMPTY
    queryObj.role = { $ne: 'SUPER_ADMIN' }

    const data = await Admin.find(queryObj)
    if (data.length === 0) throw new ApiError(404, 'Data Not found!');

    return res.status(200).json(new ApiResponse(200, data, 'Details fetched successfully!', true))

})

//FETCHED ALL DRIVERS LIST
export const fetchedDriversList = asyncHandler(async (req, res) => {
    const { id } = req.query;
    const queryObj = {}
    if (id) { queryObj._id = id; }
    console.log('queryObj:', queryObj)
    const drivers = await Delivery.find(queryObj);
    if (drivers.length === 0) throw new ApiError(404, 'No Admin found!');

    return res.status(200).json(new ApiResponse(200, drivers, 'Details fetched successfully!', true))

})

//VERIFY ADMIN TO THE DRIVER 
export const verifyDriver = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw new ApiError(404, 'Driver id missing!');

    const driver = await Delivery.findById(id)
    if (!driver) throw new ApiError(400, 'Invalid driver id or driver not present!');

    if (driver.isVerified) throw new ApiError(400, 'Driver is already verified!');

    driver.isVerified = true;
    driver.verifiedAt = new Date();
    await driver.save();

    return res.status(200).json(new ApiResponse(200, driver, 'Driver verified successfully!', true))

})

// ASSIGN ORDER TO THE DRIVER
export const assignOrder = asyncHandler(async (req, res) => {
    const { assignedDriverId, orderId } = req.body;
    if (!assignedDriverId || !orderId) throw new ApiError(400, 'All fields are required!');

    /**
     * CHECK DRIVER AND ORDER ID IS VALID OR NOT
     */
    const order = await Order.findOne({ orderId: orderId });
    if (!order) throw new ApiError(404, 'Order not found!');

    /**
    * CHECK ORDER ALREADY ASSIGNED 
    */
    if (order.status !== "pending") {
        throw new ApiError(400, 'Order already assigned!');
    }

    /**
     * Agar 2 admins ek hi time pe same driver assign karne ki try karein:
        Flow hoga:
            Admin 1 → driver available true
            Admin 2 → driver available true
            Dono assign kar denge 
     */
    const driver = await Delivery.findOneAndUpdate(
        { _id: assignedDriverId, isAvailable: true, isVerified: true }, //finding criteria
        { isAvailable: false }, // update instanly -> // DRIVER IS NOT AWAILABLE UNTIL THE DELIVERED THE ASSIGNED ORDER
        { new: true }
    );
    if (!driver) throw new ApiError(400, 'Driver not available or not verified!');

    order.assignedDriverId = driver._id
    order.status = "assigned";
    order.assignedAt = new Date();
    await order.save();

    return res.status(200).json(new ApiResponse(200, { OrderDetails: order, DriverInformation: driver }, `Order assigned to the ${driver.name}`, true))

})



