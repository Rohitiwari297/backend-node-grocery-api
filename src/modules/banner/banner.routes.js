import { Router } from 'express';
import { upload } from '../../shared/middlewares/multer.middlewares.js';
import { getBanners, addBanner, updatebanner, deleteBanner } from './banner.controller.js';
import { isAdminLoggedIn, isSuperAdmin } from '../../shared/middlewares/admin/auth.middleware.js'

const router = Router();

router.route('/')
    .get(getBanners)
    .post(isAdminLoggedIn, isSuperAdmin, upload.single('image'), addBanner);

router.route('/:id')
    .patch(isAdminLoggedIn, isSuperAdmin, upload.single('image'), updatebanner)
    .delete(isAdminLoggedIn, isSuperAdmin, deleteBanner);

export default router;
