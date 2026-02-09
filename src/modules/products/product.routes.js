import { Router } from 'express';
import { upload } from '../../shared/middlewares/multer.middlewares.js';
import { addProduct, getProducts, getProductById, getRelatedProducts, updateProduct, deleteProduct } from './product.controller.js';
import { isAdminLoggedIn, isSuperAdmin } from '../../shared/middlewares/admin/auth.middleware.js'

const router = Router();

router.route('/')
    .get(getProducts)
    .post(isAdminLoggedIn, isSuperAdmin, upload.array('images', 5), addProduct);

router.route('/related/:productid')
    .get(getRelatedProducts);

router.route('/:productId')
    .get(getProductById)
    .patch(isAdminLoggedIn, isSuperAdmin, upload.array('images', 5), updateProduct)
    .delete(isAdminLoggedIn, isSuperAdmin, deleteProduct);

export default router;
