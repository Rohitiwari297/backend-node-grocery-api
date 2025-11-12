import { Router } from 'express';
import { upload } from '../../shared/middlewares/multer.middlewares.js';
import { getBanners } from './banner.controller.js';

const router = Router();

router.route('/').get(getBanners);

export default router;
