import express from 'express'
import { createAdmin, loginAdmin, logOutAdmin } from './admin.controller.js';
import { isAdminLoggedIn, isSuperAdmin } from '../../shared/middlewares/admin/auth.middleware.js';

const router = express.Router()


router.post('/create', isAdminLoggedIn, isSuperAdmin, createAdmin)
router.post('/login', loginAdmin)
router.post('/logout', isAdminLoggedIn, logOutAdmin)

export default router;