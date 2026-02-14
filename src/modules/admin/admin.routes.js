import express from 'express'
import { assignOrder, createAdmin, fetchedAdminsList, fetchedDriversList, getProfile, loginAdmin, logOutAdmin } from './admin.controller.js';
import { isAdminLoggedIn, isSuperAdmin } from '../../shared/middlewares/admin/auth.middleware.js';

const router = express.Router()

router.get('/',isAdminLoggedIn, getProfile)
router.post('/create', isAdminLoggedIn, isSuperAdmin, createAdmin)
router.post('/login', loginAdmin)
router.post('/logout', isAdminLoggedIn, logOutAdmin)
router.get('/admins', isAdminLoggedIn, isSuperAdmin, fetchedAdminsList)
router.get('/drivers', isAdminLoggedIn, isSuperAdmin, fetchedDriversList)
router.post('/order', isAdminLoggedIn, isSuperAdmin, assignOrder)

export default router;