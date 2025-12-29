import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
    },

    discountType: {
      type: String,
      enum: ['PERCENT', 'FREE_DELIVERY'],
      required: true,
    },

    discountValue: {
      type: Number, // e.g., 20 for 20%
      default: null,
    },

    minimumOrderAmount: {
      type: Number, // e.g., 500 for Weekend Special
      default: 0,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    isFirstOrderOnly: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Coupon = new mongoose.model('Coupon', couponSchema);
