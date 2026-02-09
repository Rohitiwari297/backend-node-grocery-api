import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema({
  shippingCharge: {
    type: Number,
    required: true,
    min: 0
  },
  freeShippingAbove: {
    type: Number,
    required: true,
    min: 0
  },
}, { timestamps: true });

const Shipping = mongoose.model('Shipping', shippingSchema);
export default Shipping;
