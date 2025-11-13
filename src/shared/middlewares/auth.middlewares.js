// src/shared/middlewares/auth.middlewares.js
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../../models/user.model.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Missing Authorization header
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 2️⃣ Must begin with *exactly* "Bearer" (case-sensitive)
    if (!authHeader.startsWith('Bearer')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 3️⃣ Extract token after Bearer (allow extra spaces)
    const token = authHeader.slice(6).trim();

    // "Bearer" but no token value → invalid
    if (!token) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // 4️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // 5️⃣ Validate payload
    if (!decoded || !decoded._id) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // 6️⃣ Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(decoded._id)) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 7️⃣ Find user safely
    let user;
    try {
      const found = await User.findById(decoded._id);
      if (found && typeof found.select === 'function') {
        user = await found.select('-otp -otpExpires');
      } else {
        user = found;
      }
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // 8️⃣ No user found
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 9️⃣ Attach user and continue
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
