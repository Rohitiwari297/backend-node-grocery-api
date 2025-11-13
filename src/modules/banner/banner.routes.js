import { Router } from 'express';
import { upload } from '../../shared/middlewares/multer.middlewares.js';
import { getBanners, addBanner } from './banner.controller.js';

const router = Router();

router.route('/').get(getBanners)
    .post(upload.single('image'), addBanner);

export default router;
