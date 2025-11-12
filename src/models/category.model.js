import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const categorySchema = new Schema(
  {
    position: {
      type: Number,
      default: 0,
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
