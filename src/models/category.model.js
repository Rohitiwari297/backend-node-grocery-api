import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    image: {
      type: String,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const subCategorySchema = new Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      unique: true,
      required: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

export const Category = mongoose.model('Category', categorySchema);

export const SubCategory = mongoose.model('SubCategory', subCategorySchema);
