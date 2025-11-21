import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
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
  location: {
    type: String,
    default: '',
  },
}, { timestamps: true },);
// stateless token generation
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id.toString(), mobile: this.mobile }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '365d',
  });
};

const addressSchema = new Schema({
  name: {

  },
  email: {

  },
  mobile: {

  },
  city: {

  },
  state: {

  },
  pincode: {

  }


}, { timestamps: true });


export const User = mongoose.model('User', userSchema);


export const Address = mongoose.model('Address', addressSchema);
