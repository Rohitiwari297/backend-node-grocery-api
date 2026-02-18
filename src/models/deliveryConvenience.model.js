import { Timestamp } from "firebase-admin/firestore";
import mongoose from "mongoose";

const deliveryConvenienceSchema = mongoose.Schema({

    baseDriverFare: {
        type: Number,
        min: 0,
        default: 10,
        required: true

    },

    perKmRate: {   // CURRENTLY NOT REQUIRED
        type: Number,
        default: 0
    },

    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },

},{Timestamp: true})

const Convenience = mongoose.model('Convenience', deliveryConvenienceSchema)
export default Convenience;