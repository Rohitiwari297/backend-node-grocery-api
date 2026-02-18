import Delivery from '../../models/delievery.model.js'
import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js'
import bcrypt from 'bcrypt'
import { Otp } from '../../models/auth.model.js';
import fs from 'fs/promises'
import { Order } from '../../models/order.model.js';
import crypto from 'crypto'
import Convenience from '../../models/deliveryConvenience.model.js';

/**
 *  WE USED HERE NAMING CONVENTION DELIVERY FOR DELIVERY BOY
 */

// Helper
const genOtp = () => Math.floor(1000 + Math.random() * 9000).toString()

export const registerDelivery = asyncHandler(async (req, res) => {

    try {

        const { name, phone, email, password, vehicleNumber, licenseNumber, panNumber, aadharNumber, currentLocation } = req.body;

        const licenseImage = req.files?.licenseImage?.[0];
        const panImage = req.files?.panImage?.[0];
        const profile = req.files?.profile?.[0];
        const aadharImage = req.files?.aadharImage?.[0];

        //  Validation
        if (!name || !phone || !password || !licenseNumber || !vehicleNumber || !licenseImage || !panNumber || !panImage || !aadharNumber || !aadharImage) {

            if (req.files) {
                const fs = await import('fs/promises');

                await Promise.all(
                    Object.values(req.files)
                        .flat()
                        .map(file => fs.unlink(file.path).catch(() => { }))
                );
            }

            throw new ApiError(400, 'All fields are mandatory');
        }

        const existingDriver = await Delivery.findOne({ $or: [{ phone }, { email }] });

        if (existingDriver) {

            if (req.files) {
                const fs = await import('fs/promises');

                await Promise.all(
                    Object.values(req.files)
                        .flat()
                        .map(file => fs.unlink(file.path).catch(() => { }))
                );
            }

            throw new ApiError(400, "Driver already registered with this details");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const driver = await Delivery.create({
            name,
            phone,
            password: hashedPassword,
            profile: profile.path,
            panNumber,
            panImage: panImage.path,
            licenseNumber,
            licenseImage: licenseImage.path,
            aadharNumber,
            aadharImage: aadharImage.path,
            email,
            vehicleNumber,
            licenseNumber,
            currentLocation,
        });

        driver.password = undefined;

        return res.status(201).json(
            new ApiResponse(201, driver, 'Registration completed successfully!', true)
        );

    } catch (error) {

        // 🔥 Safety rollback (agar DB error ho jaye)
        if (req.files) {
            const fs = await import('fs/promises');

            await Promise.all(
                Object.values(req.files)
                    .flat()
                    .map(file => fs.unlink(file.path).catch(() => { }))
            );
        }

        throw error;
    }

});

/**
 * DELIVERY BOY CAN LOGIN WITH USER-ID AND PASSWORD
 * WHERE USER-ID CAN BE EMAIL ADDRESS OR MOBILE NUMBER
 */
export const logInWithCredantials = asyncHandler(async (req, res) => {
    console.log('req.body', req.body)
    const { userId, password } = req.body;
    if (!userId || !password) throw new ApiError(400, "User ID and password are required");

    //check whether userId is email or mobile
    const query = userId.includes('@')
        ? { email: userId }
        : { phone: userId };

    const driver = await Delivery.findOne(query).select('+password')
    if (!driver) throw new ApiError(401, 'Invalid credentials!');

    const isMatch = await bcrypt.compare(password, driver.password)
    if (!isMatch) throw new ApiError(401, 'Invalid credentials!');

    const token = driver.generateAuthToken();

    /**
     * CHECK VERIFICATION 
     *  {WORK PENDING IN SUPER ADMIN API}
     */
    // if (!driver.isVerified) {
    //     throw new ApiError(403, "Driver is not verified by admin");      //ENABLE AFTER COMPETING ADMIN SIDE
    // }

    // MARK IS_AVAILABLE TRUE IF DRIVER LOGGED_IN 
    driver.isAvailable = true;
    await driver.save();

    //AND REMOVE PASSWORD 
    driver.password = undefined;

    const responseData = {
        driver,
        token
    }

    return res.status(200).json(new ApiResponse(200, responseData, 'Login successful', true))

})

/**
 * API FOR LOGING WITH PHONE OTP
 */

export const generateOtp = asyncHandler(async (req, res) => {
    const { phone } = req.body
    if (!phone) throw new ApiError(400, 'Mobile numner is required!');

    const driver = await Delivery.findOne({ phone })
    if (!driver) throw new ApiError(401, 'Invalid credential!');

    const otp = genOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min default 

    // Delete old OTP if exists for same mobile
    await Otp.deleteMany({ mobile: phone });

    // Save new opt
    const saveOtp = await Otp.create({
        mobile: phone,
        otp,
        otpExpires
    })

    console.log(`OTP for ${phone}: ${otp}`);

    return res.json(new ApiResponse(200, saveOtp, 'OTP sent successfully', true));
})

//VERIFY OTP
export const verifyOtp = asyncHandler(async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) throw new ApiError(400, 'Mobile numner & otp are mandatory!');

    const otpRecords = await Otp.findOne({ mobile: phone });
    if (!otpRecords) throw new ApiError(400, 'OTP not found');
    if (otpRecords.otp !== otp) throw new ApiError(400, 'Invalid OTP');
    if (Date.now() > otpRecords.otpExpires) throw new ApiError(400, 'OTP expired!');

    // Delete otp after verification
    await Otp.deleteMany({ phone });

    const driver = await Delivery.findOne({ phone })
    const token = driver.generateAuthToken();

    /**
     * VERIFICATION DONE BY THE ADMIN AFTER REGISTRATION  
     *  {WORK PENDING IN SUPER ADMIN API}
     */
    // if (!driver.isVerified) {
    //     throw new ApiError(403, "Driver is not verified by admin");      //ENABLE AFTER COMPETING ADMIN SIDE
    // }

    // MARK IS_AVAILABLE TRUE IF DRIVER LOGGED_IN 
    driver.isAvailable = true;
    await driver.save();

    //AND REMOVE PASSWORD 
    driver.password = undefined;

    const responseData = {
        driver,
        token
    }

    return res.status(200).json(new ApiResponse(200, responseData, 'Login successful', true))


})

// GET PROFILE
export const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(400, 'Unauthorized. Driver must be logged in.');

    const details = await Delivery.findById({ _id: userId });
    if (!details) throw new ApiError(400, 'Driver not found');

    return res.status(200).json(new ApiResponse(200, details, 'Details fetched successfully!'))
})

// UPDATE PROFILE
export const updateProfile = asyncHandler(async (req, res) => {
    // const userId = 
    const { name, phone, email, vehicleNumber, licenseNumber, panNumber, aadharNumber, currentLocation } = req.body;
    const licenseImage = req.files?.licenseImage?.[0];
    const panImage = req.files?.panImage?.[0];
    const profile = req.files?.profile?.[0];
    const aadharImage = req.files?.aadharImage?.[0];

    const driver = await Delivery.findById(req.user?.id);
    if (!driver) throw new ApiError(400, 'Driver not found');

    driver.name = name ?? driver.name;
    driver.phone = phone ?? driver.phone;
    driver.email = email ?? driver.email;
    driver.vehicleNumber = vehicleNumber ?? driver.vehicleNumber;
    driver.licenseNumber = licenseNumber ?? driver.licenseNumber;
    driver.panNumber = panNumber ?? driver.panNumber;
    driver.aadharNumber = aadharNumber ?? driver.aadharNumber;
    driver.currentLocation = currentLocation ?? driver.currentLocation;

    // NOW UPDATE IMAGES
    if (licenseImage) {
        if (driver.licenseImage) {
            await fs.unlink(driver.licenseImage).catch(() => { });
        }
        driver.licenseImage = licenseImage;
    }

    if (panImage) {
        if (driver.panImage) {
            await fs.unlink(driver.panImage).catch(() => { });
        }
        driver.panImage = panImage;
    }

    if (profile) {
        if (driver.profile) {
            fs.unlink(driver.profile).catch(() => { });
        }
        driver.profile = profile;
    }

    if (aadharImage) {
        if (driver.aadharImage) {
            fs.unlink(driver.aadharImage);
        }
        driver.aadharImage = aadharImage;
    }

    await driver.save();

    res.status(200).json(
        new ApiResponse(200, driver, "Profile updated successfully", true)
    );
})

/**
 * API FOR PROCESS OF THE GETTING ASSIGNED ORDER TO COMPLETION OF THE DELIVERY
 * @getOrders
 * @acceptOrder
 * @markAsPickedUpOrder
 * @outOfDelivery
 * @markAsDelivered
 * @getDeliveryHistory
 */

// GET ASSINGED ORDER
export const getAssignedOrder = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { status } = req.query;

    const queryObj = {
        assignedDriverId: userId
    };

    if (status === 'newOrder') {
        queryObj.status = 'assigned';
    }

    if (status === 'ongoing') {
        queryObj.status = { $in: ['accepted', 'picked_up', 'out_for_delivery'] };
    }

    if (status === 'delivered') {
        queryObj.status = 'delivered';
    }

    const orders = await Order.find(queryObj).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                assignedOrders: orders,
                totalAssignedOrders: orders.length
            },
            orders.length > 0
                ? 'Orders fetched successfully!'
                : 'No orders found.',
            true
        )
    );
});

//ACCEPT AND DEJECT ORDER BY THE DRIVER
export const respondToOrder = asyncHandler(async (req, res) => {
    const driverId = req.user?.id;
    const { orderId } = req.params;
    const { action } = req.body;

    //VALIDATE THE RECEIVED ACTION
    if (!['accept', 'reject'].includes(action)) {
        throw new ApiError(400, 'Invalid action!')
    };

    const assignedOrder = await Order.findOne({
        orderId: orderId,
        assignedDriverId: driverId,
        status: 'assigned'
    })

    if (!assignedOrder) {
        throw new ApiError(404, "Order not found or already processed!");
    }

    if (action === 'accept') {
        assignedOrder.status = 'accepted'
        assignedOrder.acceptedAt = Date.now();
    } else {
        assignedOrder.status = 'pending'
        assignedOrder.rejectedAt = Data.now();
        assignedOrder.assignedDriverId = null
    }

    assignedOrder.save();

    return res.status(200).json(new ApiResponse(200, assignedOrder, `Order ${action}ed successfully`, true))


})

// MARK AS PICKED_UP ORDER
export const markAsPickedUpOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
        orderId: orderId,
        assignedDriverId: userId,
        status: 'accepted'
    })
    if (!order) {
        throw new ApiError(404, "Order not found or already processed!");
    }

    order.status = 'picked_up';
    order.pickedUpAt = Date.now();
    await order.save();

    return res.status(200).json(new ApiResponse(200, order, `Order marked as picked up successfully!`, true))
})

// MARK AS DELIVERED
export const markAsDelivered = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
        orderId: orderId,
        assignedDriverId: userId,
        status: 'picked_up'
    })
    if (!order) {
        throw new ApiError(404, "Order not found or already processed!");
    }

    // PROTECT OTP
    const otp = genOtp()
    console.log('Order OTP:', otp)
    const hashedOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    //SEND THE OTP TO THE USER FOR THE VERIFICATION
    order.status = "out_for_delivery";
    order.outForDeliveryAt = new Date();
    order.deliveryOTP = hashedOTP;
    order.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    order.otpAttempts = 0;

    await order.save();

    // TODO: Send OTP to customer via SMS

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Order marked as out for delivery. OTP sent to customer.",
            true
        )
    );



})

// VERIFY OTP FOR CONFIRMED DELIVERY
export const verifyDeliveryOTP = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { otp } = req.body;
    const driverId = req.user.id;

    console.log(orderId)

    if (!otp) {
        throw new ApiError(400, "OTP is required!");
    }

    const order = await Order.findOne({

        orderId: orderId,
        assignedDriverId: driverId,
        status: "out_for_delivery"
    });

    if (!order) {
        throw new ApiError(404, "Order not found or invalid state!");
    }

    // Expiry check
    if (order.otpExpiresAt < new Date()) {
        throw new ApiError(400, "OTP expired!");
    }

    // Attempt limit
    if (order.otpAttempts >= 3) {
        throw new ApiError(400, "Maximum OTP attempts exceeded!");
    }

    // Hash input OTP
    const hashedInputOTP = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    if (order.deliveryOTP !== hashedInputOTP) {
        order.otpAttempts += 1;
        await order.save();
        throw new ApiError(400, "Invalid OTP!");
    }

    // SUCCESS
    order.status = "delivered";
    order.deliveredAt = new Date();
    order.deliveryOTP = undefined;
    order.otpExpiresAt = undefined;
    order.otpAttempts = 0;

    /**
     * ADD THE DEFINED CONVENIENCE CHARGE IN DRIVERS WALLET
     */
    const convenience = await Convenience.findOneAndUpdate(
        {},  // empty filter (first document)
        {},  // no update
        { new: true, upsert: true } // create if not exists
    );

    await order.save();

    // UPDATE THE DRIVER ISAVAILABLE STATUS
    const driver = await Delivery.findByIdAndUpdate(
        driverId,
        {
            $set: { isAvailable: true },
            $inc: { walletBalance: order.driverEarning }
        },
        { new: true }
    )

    // driver.walletBalance = driver.walletBalance + convenience.baseDriverFare
    // driver.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            order,
            "Order delivered successfully!",
            true
        )
    );
})

// GET DELIVERED HISTORY
export const getDeliveryHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const orders = await Order.find({
        assignedDriverId: userId,
        status: 'delivered',
    }).sort({ deliveredAt: -1 })

    return res.status(200).json(
        new ApiResponse(
            200,
            orders,
            orders.length > 0
                ? "Delivered history fetched successfully!"
                : "No delivered orders found!",
            true
        )
    );
})