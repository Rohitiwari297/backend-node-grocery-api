import { Router } from 'express';
import { upload } from '../../shared/middlewares/multer.middlewares.js';
import { getCategories, addCategory, getSubCategories, addSubCategory, updateCategory, deleteCategory, updateSubCategory, deleteSubCategory } from './category.controller.js';
import { isAdminLoggedIn, isSuperAdmin } from '../../shared/middlewares/admin/auth.middleware.js';

const router = Router();

router.route('/')
    .get(getCategories)
    .post(upload.single('image'), isAdminLoggedIn, isSuperAdmin, addCategory)

router.route('/:id')
    .patch(upload.single('image'), isAdminLoggedIn, isSuperAdmin, updateCategory)
    .delete(isAdminLoggedIn, isSuperAdmin, deleteCategory)

router.route('/sub')
    .get(getSubCategories)
    .post(upload.single('image'), isAdminLoggedIn, isSuperAdmin, addSubCategory)

router.route('/sub/:id')
    .patch(upload.single('image'), isAdminLoggedIn, isSuperAdmin, updateSubCategory)
    .delete(isAdminLoggedIn, isSuperAdmin, deleteSubCategory)

export default router;
