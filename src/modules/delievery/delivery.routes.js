import express from 'express'
import { isLoggedIn } from '../../shared/middlewares/delivery/delivery.middlewares.js';
import { generateOtp, getAssignedOrder, getProfile, logInWithCredantials, markAsDelivered, markAsPickedUpOrder, registerDelivery, respondToOrder,  updateProfile, verifyOtp } from './delivery.controller.js';
import { upload } from '../../shared/middlewares/multer.middlewares.js';

const delivery = express.Router();

// delivery.use(isLoggedIn);

delivery.route('/registration')
    .post(upload.fields([
        { name: "profile", maxCount: 1 },
        { name: "aadharImage", maxCount: 1 },
        { name: "panImage", maxCount: 1 },
        { name: "licenseImage", maxCount: 1 }
    ]), registerDelivery)
delivery.route('/login')
    .post(logInWithCredantials)

delivery.route('/send-otp')
    .post(generateOtp);

delivery.route('/verify-otp')
    .post(verifyOtp);

delivery.route('/')
    .get(isLoggedIn, getProfile)
    .patch(isLoggedIn, upload.fields([
        { name: "profile", maxCount: 1 },
        { name: "aadharImage", maxCount: 1 },
        { name: "panImage", maxCount: 1 },
        { name: "licenseImage", maxCount: 1 }
    ]), updateProfile);


//DELIVERIES ACTIONS AND STATUS
delivery.use(isLoggedIn)

delivery.route('/orders')
    .get(getAssignedOrder);
    
delivery.route('/order/:id')
    .post(respondToOrder);

delivery.route('/order/:id/picked-up')
    .post(markAsPickedUpOrder);

delivery.route('/order/:id/out-for-delivery')
    .post(markAsDelivered);

delivery.route('/order/:id/verify-otp')
    .post(markAsDelivered);

export default delivery;