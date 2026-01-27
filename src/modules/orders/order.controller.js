import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { Order } from '../../models/order.model.js';
import { Cart } from '../../models/cart.model.js';
import { Product } from '../../models/product.model.js';
import { Notification } from '../../models/notification.model.js';
import { logger } from '../../core/logger/index.js';
import mongoose from 'mongoose';

// Place order using user's cart
export const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch user's cart
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart || !cart.items.length) {
    throw new ApiError(400, 'Cart is empty');
  }

  // Build order items using product currentPrice
  const orderItems = cart.items.map((it) => {
    const prod = it.productId;
    const price = prod?.currentPrice ?? it.price ?? 0;
    return {
      productId: it.productId._id ? it.productId._id : it.productId,
      quantity: it.quantity,
      price,
    };
  });

  // Generate simple orderId
  const orderId = `ORD${Date.now()}`;

  const order = new Order({
    orderId,
    userId,
    items: orderItems,
    paymentMethod: req.body.paymentMethod || 'cash',
    shippingAddress: req.body.shippingAddress || req.user.location || '',
  });

  await order.save();

  // Clear cart
  cart.items = [];
  await cart.save();

  // Create notification for user
  try {
    await Notification.create({
      userId,
      title: 'Order placed',
      message: `Your order ${order.orderId} has been placed successfully.`,
      type: 'order',
      relatedId: order._id.toString(),
    });
  } catch (err) {
    logger.error('Failed to create order notification', err);
  }

  logger.info(`Order ${order.orderId} placed by user ${userId}`);

  return res.json(new ApiResponse(200, order, 'Order placed successfully'));
});

// Get all orders for user
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { orderId, status } = req.query;
  // const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  const orders = await Order.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        ...(orderId && { orderId: orderId }),
        ...(status && { status: status }),
      },
    },
    {
      $unwind: '$items',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product',
        pipeline: [
          {
            $project: {
              name: 1,
              description: 1,
              currentPrice: 1,
              originalPrice: 1,
              unit: 1,
              images: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$product',
    },
    {
      $group: {
        _id: "$_id",
        orderId: { $first: "$orderId" },
        userId: { $first: "$userId" },
        totalItems: { $first: "$totalItems" },
        totalPrice: { $first: "$totalPrice" },
        status: { $first: "$status" },
        paymentMethod: { $first: "$paymentMethod" },
        shippingAddress: { $first: "$shippingAddress" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },

        items: {
          $push: {
            _id: "$items._id",
            productId: "$items.productId",
            quantity: "$items.quantity",
            price: "$items.price",
            product: "$product",
          },
        },
      },
    },
    { $sort: { createdAt: -1 } },

  ]);

  return res.json(new ApiResponse(200, orders, 'Orders fetched successfully'));
});

// Get order by id (orderId param is Mongo _id)
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to view this order');
  }
  return res.json(new ApiResponse(200, order, 'Order fetched successfully'));
});

// Update order status (basic rules: owner can cancel if pending)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Invalid status. Allowed: ${allowed.join(', ')}`);
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  // If user is owner, allow only cancel when pending
  if (order.userId.toString() === req.user._id.toString()) {
    if (status === 'cancelled') {
      if (order.status !== 'pending') {
        throw new ApiError(400, 'Cannot cancel non-pending order');
      }
      order.status = 'cancelled';
    } else {
      // Owner cannot set arbitrary statuses
      throw new ApiError(403, 'Not authorized to change status');
    }
  } else {
    // Non-owner (admin) - but we don't have roles; allow change for now
    order.status = status;
  }

  await order.save();

  // Notify user
  try {
    await Notification.create({
      userId: order.userId,
      title: 'Order status updated',
      message: `Your order ${order.orderId} status changed to ${order.status}`,
      type: 'order',
      relatedId: order._id.toString(),
    });
  } catch (err) {
    logger.error('Failed to create status notification', err);
  }

  return res.json(new ApiResponse(200, order, 'Order status updated'));
});