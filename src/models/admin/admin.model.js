import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { adminRole } from "../../shared/constants.js";

const adminSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        role: {
            type: String,
            required: true,
            enum: [adminRole.sub_admin]
        },
    },
    { timestamps: true }
);

adminSchema.methods.generateAdminToken = function () {
    return jwt.sign(
        { _id: this._id, role: this.role },
        process.env.JWT_ADMIN_SECRET,
        { expiresIn: process.env.JWT_ADMIN_EXPIRES || "1d" }
    );
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
