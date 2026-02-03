import { Router } from 'express';
import { upload } from '../../shared/middlewares/multer.middlewares.js';
import { getCategories, addCategory, getSubCategories, addSubCategory } from './category.controller.js';
import { isAdminLoggedIn, isSuperAdmin } from '../../shared/middlewares/admin/auth.middleware.js';

const router = Router();

router.route('/')
    .get(getCategories)
    .post(upload.single('image'), isAdminLoggedIn, isSuperAdmin, addCategory);

router.route('/sub')
    .get(getSubCategories)
    .post(upload.single('image'), addSubCategory);

export default router;
