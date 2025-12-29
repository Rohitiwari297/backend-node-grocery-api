import { Router } from 'express';
import { upload } from '../../shared/middlewares/multer.middlewares.js';
import { getCategories, addCategory, getSubCategories, addSubCategory } from './category.controller.js';

const router = Router();

router.route('/').get(getCategories).post(upload.single('image'), addCategory);

router.route('/sub').get(getSubCategories).post(upload.single('image'), addSubCategory);

export default router;
