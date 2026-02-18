import cors from 'cors';
import express from 'express';
import { ApiError } from './shared/utils/ApiError.js';
import { requestLogger } from './shared/middlewares/requestLogger.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import userRoutes from './modules/users/user.routes.js';
import bannerRoutes from './modules/banner/banner.routes.js';
import categoryRoutes from './modules/category/category.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import couponRoutes from './modules/coupons/coupon.routes.js';
// import notificationRoutes from './modules/notifications/notification.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import adminRouter from './modules/admin/admin.routes.js'
import shippingRouter from './modules/shipping/shipping.routes.js';
import deliveryRouter from './modules/delievery/delivery.routes.js';
import cookieParser from 'cookie-parser';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware sabse upar lagao
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser())

app.get('/', (req, res) => {
  res.send(`Server is running at ${new Date().toLocaleString()}`);
});

app.get('/test-server', (req, res) => {
  res.send('Server Running...');
});

app.get('/test-error', (req, res) => {
  throw new ApiError(404, 'Not Found');
});

app.use('/uploads', express.static('uploads'));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
// app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRouter);
app.use('/api/delivery', deliveryRouter)

// Defining the Admin route
app.use('/api/admin', adminRouter)


app.use(requestLogger);
app.use(errorHandler);

export default app;
