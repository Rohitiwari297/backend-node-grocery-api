import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import { validate } from "uuid";

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
      trim: true,
      lowercase: true,
      //sparse: true, // email optional ho to error na aaye
      validate: {
        validator: function (value) {
          // TODO: Implement email validation
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        message: "Please enter a valid email address",
      }
    },

    password: {
      type: String,
      required: true,
      select: false,
      minlength: [6, "Password must be at least 6 characters long"],
      validate: {
        validator: function (value) {
          return /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/.test(value);
        },
        message: "Password must contain at least one uppercase letter and one number",
      },
    },

    profile: {
      type: String
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
      unique: true
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true
    },

    licenseImage: {
      type: String,
      required: true,
    },
    aadharNumber: {
      type: String,
      required: true,
      unique: true
    },

    aadharImage: {
      type: String,
      required: true,
    },
    panNumber: {
      type: String,
      required: true,
      unique: true
    },

    panImage: {
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
      default: false, // admin can be verify
    },

    isActive: {
      type: Boolean,
      default: false, // admin can be change 
    },
  },
  {
    timestamps: true, // ye automatically createdAt & updatedAt add karega
  }
);

deliverySchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id.toString(), mobile: this.mobile, isVerified: this.isVerified, role: this.role },
    process.env.JWT_DELIVERY_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '365d', }
  )
}

const Delivery = mongoose.model('Driver', deliverySchema);
export default Delivery;
