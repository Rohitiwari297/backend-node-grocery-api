import { Schema } from 'mongoose';
import mongoose from 'mongoose';

export const productSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
    },
    images: {
      type: [String],
      required: true,
    },
    tags: {
      type: [String],//Grocery Exclusive, Grocery at great Value, Best Seller, New Arrival, Deal of the day
    },
  },
  { timestamps: true },
);

export const Product = mongoose.model('Product', productSchema);
