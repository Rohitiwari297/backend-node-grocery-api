import { Schema } from "mongoose";

export const productSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
    },
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
