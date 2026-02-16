import express from 'express'
import { assignOrder, createAdmin, fetchedAdminsList, fetchedDriversList, getProfile, loginAdmin, logOutAdmin, verifyDriver } from './admin.controller.js';
import { isAdminLoggedIn, isSuperAdmin } from '../../shared/middlewares/admin/auth.middleware.js';

const router = express.Router()

router.get('/', isAdminLoggedIn, getProfile)
router.post('/create', isAdminLoggedIn, isSuperAdmin, createAdmin)
router.post('/login', loginAdmin)
router.post('/logout', isAdminLoggedIn, logOutAdmin)
router.get('/admins', isAdminLoggedIn, isSuperAdmin, fetchedAdminsList)
router.get('/driver', isAdminLoggedIn, isSuperAdmin, fetchedDriversList)
router.post('/driver/:id', isAdminLoggedIn, isSuperAdmin, verifyDriver)
router.post('/order', isAdminLoggedIn, isSuperAdmin, assignOrder)

export default router;