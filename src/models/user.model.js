import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    mobile: {
      type: String,
    },
    avatar: {
      type: String,
    },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
  },
  { timestamps: true },
);
// stateless token generation
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id.toString(), mobile: this.mobile }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '365d',
  });
};
export const User = mongoose.model('User', userSchema);
