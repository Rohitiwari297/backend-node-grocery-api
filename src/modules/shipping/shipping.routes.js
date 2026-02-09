import express from 'express'
import { isAdminLoggedIn, isSuperAdmin } from '../../shared/middlewares/admin/auth.middleware.js'
import { shippingCharges } from './shipping.controller.js'

const shipping = express.Router();

shipping.use(isAdminLoggedIn)

shipping.route('/')
    .patch(isSuperAdmin, shippingCharges);



export default shipping