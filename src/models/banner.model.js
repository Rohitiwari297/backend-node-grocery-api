import { Schema } from 'mongoose';
import mongoose from 'mongoose';

const bannerSchema = new Schema(
  {
    image: {
      type: String,
    },
    redirectUrl: {
      type: String,
      unique: true,
      required: true,
    },
    position: {
      type: String,
      enum: ["top", "middle", "bottom"],
      default: "top",
    },
  },
  { timestamps: true },
);

export const Banner = mongoose.model('Banner', bannerSchema);
