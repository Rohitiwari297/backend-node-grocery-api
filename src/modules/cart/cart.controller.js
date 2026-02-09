import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { Cart } from '../../models/cart.model.js';
import { Product } from '../../models/product.model.js';
import { logger } from '../../core/logger/index.js';
import Shipping from '../../models/shipping.model.js';

// Get user's cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

  if (!cart) {
    cart = new Cart({ userId: req.user._id, items: [] });
    await cart.save();
  }

  // Subtotal calculate
  const subTotal = cart.items.reduce((sum, item) => {
    const price = item.productId?.currentPrice ?? item.price ?? 0;
    return sum + price * item.quantity;
  }, 0)

  const shippingConfig = await Shipping.findOne();

  let shippingCharges = 0;
  if (shippingConfig && subTotal < shippingConfig.freeShippingAbove) {
    shippingCharges = shippingConfig.shippingCharge;
  }

  const totalAmount = subTotal + shippingCharges;

  logger.info(`Cart fetched for user ${req.user._id}`);

  return res.json(new ApiResponse(200, { cart, priceSummary: { subTotal, shippingCharges, totalAmount, freeShippingAbove: shippingConfig?.freeShippingAbove || 0 } }, 'Cart fetched successfully'));
});

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // Validate input
  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }

  if (!quantity || quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check product stock
  if (product.stock < quantity) {
    throw new ApiError(400, `Insufficient stock. Available: ${product.stock}`);
  }

  // Find or create cart
  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = new Cart({ userId: req.user._id, items: [] });
  }

  // Check if product already in cart
  const existingItem = cart.items.find((item) => item.productId.toString() === productId);

  if (existingItem) {
    // Update quantity
    const newQuantity = Number(existingItem.quantity) + Number(quantity);

    if (product.stock < newQuantity) {
      throw new ApiError(400, `Cannot add ${quantity} more. Available: ${product.stock - existingItem.quantity}`);
    }

    existingItem.quantity = newQuantity;
    existingItem.currentPrice = product.currentPrice;
  } else {
    // Add new item
    cart.items.push({
      productId,
      quantity,
      price: product.currentPrice,
    });
  }

  await cart.save();

  logger.info(`Product ${productId} added to cart for user ${req.user._id}. Quantity: ${quantity}`);

  return res.json(new ApiResponse(200, cart, 'Product added to cart successfully'));
});

// Update cart item quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  // Validate input
  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }

  if (!quantity || quantity < 0) {
    throw new ApiError(400, 'Quantity must be 0 or greater');
  }

  // Get cart
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Find item in cart
  const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

  if (itemIndex === -1) {
    throw new ApiError(404, 'Product not in cart');
  }

  // If quantity is 0, remove item
  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
    logger.info(`Product ${productId} removed from cart for user ${req.user._id}`);
  } else {
    // Check stock
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      throw new ApiError(400, `Insufficient stock. Available: ${product.stock}`);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].currentPrice = product.currentPrice;
    logger.info(`Product ${productId} quantity updated to ${quantity} for user ${req.user._id}`);
  }

  await cart.save();

  return res.json(new ApiResponse(200, cart, 'Cart item updated successfully'));
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }

  // Get cart
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Find and remove item
  const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);

  if (itemIndex === -1) {
    throw new ApiError(404, 'Product not in cart');
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  logger.info(`Product ${productId} removed from cart for user ${req.user._id}`);

  return res.json(new ApiResponse(200, cart, 'Product removed from cart successfully'));
});

// Clear entire cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = [];
  await cart.save();

  logger.info(`Cart cleared for user ${req.user._id}`);

  return res.json(new ApiResponse(200, cart, 'Cart cleared successfully'));
});

// Get cart count
export const getCartCount = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });

  const count = cart ? cart.totalItems : 0;

  return res.json(new ApiResponse(200, count, 'Cart count fetched successfully'));
});
