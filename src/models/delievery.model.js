import mongoose from "mongoose";
import jwt from 'jsonwebtoken'

const deliverySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true, // email optional ho to error na aaye
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      required: true,
      default: 'driver'
    },

    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
    },

    licenseNumber: {
      type: String,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: false, // driver login kare tab true kare
    },

    currentLocation: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },

    isVerified: {
      type: Boolean,
      default: false, // admin verify karega
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // ye automatically createdAt & updatedAt add karega
  }
);

deliverySchema.method.generateAuthToken = function () {
  return jwt.sign(
    {  id: this._id.toString(), mobile: this.mobile, isVerified: this.isVerified, role: this.role },
    process.env.JWT_DELIVERY_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '365d', }
  )
}

const Delivery = mongoose.model('Driver', deliverySchema);
export default Delivery;
