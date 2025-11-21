import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        totalPrice: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalItems: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

// Pre-save hook to calculate totals
cartSchema.pre('save', async function (next) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalPrice = this.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    next();
});

export const Cart = mongoose.model('Cart', cartSchema);
