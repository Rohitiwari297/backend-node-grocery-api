import { Router } from 'express';
import { upload } from '../../shared/middlewares/multer.middlewares.js';
import { getCategories } from './category.controller.js';

const router = Router();
router.route('/').get(getCategories);

export default router;
