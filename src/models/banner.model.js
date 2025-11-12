import { Schema } from 'mongoose';
import mongoose from 'mongoose';

const bennerSchema = new Schema(
  {
    image: {
      type: String,
    },
    redirectUrl: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true },
);

export const Banner = mongoose.model('Banner', bennerSchema);
