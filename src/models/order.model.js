import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    totalItems: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'cash' },
    shippingAddress: { type: String, default: '' },

    subTotal: {
      type: Number,
      required: true
    },

    shippingCharge: {
      type: Number,
      required: true
    },
  },
  { timestamps: true },
);

orderSchema.pre('save', function (next) {
  this.totalItems = this.items.reduce((s, it) => s + it.quantity, 0);
  // this.totalPrice = this.items.reduce((s, it) => s + it.price * it.quantity, 0);
  next();
});

export const Order = mongoose.model('Order', orderSchema);
