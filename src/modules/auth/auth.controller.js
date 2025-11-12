import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { User } from '../../models/user.model.js';

// Helper to generate OTP
const genOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

export const sendOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ message: 'Mobile required' });

  const otp = genOtp();
  const otpExpires = new Date(
    Date.now() + parseInt(process.env.OTP_TTL_MINUTES || '5') * 60 * 1000,
  );

  let user = await User.findOne({ mobile });
  if (!user) {
    user = new User({ mobile });
  }

  // Save OTP in DB (select:false prevents casual queries showing it)
  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  // DEV: log OTP to console
  console.log(`OTP for ${mobile}: ${otp}`);

  return res.json(new ApiResponse(200, { mobile, otp, otpExpires }, 'OTP sent successfully'));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    throw new ApiError(400, 'mobile and otp required');
  }

  const user = await User.findOne({ mobile }).select('+otp +otpExpires');
  if (!user) {
    throw new ApiError(400, 'User not found');
  }

  if (!user.otp || user.otp !== otp) {
    throw new ApiError(400, 'Invalid OTP');
  }

  if (!user.otpExpires || user.otpExpires < new Date()) {
    throw new ApiError(400, 'OTP expired');
  }

  // Clear OTP fields (so it cannot be reused)
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  // Generate stateless JWT (not stored in DB)
  const token = user.generateAuthToken();

  // Hide sensitive fields before sending
  const userSafe = {
    _id: user._id,
    mobile: user.mobile,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };

  return res.json(new ApiResponse(200, { message: 'Login successful', user: userSafe, token }));
});
