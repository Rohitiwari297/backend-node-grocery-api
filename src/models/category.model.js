import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { typeConstants } from '../shared/constants.js';

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
    type: {
      type: String,
      enum: [typeConstants.food, typeConstants.other],
      default: typeConstants.other 
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
