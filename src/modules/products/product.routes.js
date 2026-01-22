import { Router } from 'express';
import { upload } from '../../shared/middlewares/multer.middlewares.js';
import { addProduct, getProducts, getProductById, getRelatedProducts, updateProduct } from './product.controller.js';

const router = Router();

router.route('/').get(getProducts).post(upload.array('images', 5), addProduct);

router.route('/related/:productid').get(getRelatedProducts);

router.route('/:productId').get(getProductById).patch(upload.array('images', 5), updateProduct);

export default router;
