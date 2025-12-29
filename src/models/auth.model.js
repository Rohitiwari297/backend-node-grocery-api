import mongoose, { Schema } from 'mongoose';

const otpSchema = new Schema(
  {
    mobile: { type: String, required: true },
    otp: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid 4-digit OTP!`,
      },
    },
    otpExpires: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Otp = mongoose.model('Otp', otpSchema);
