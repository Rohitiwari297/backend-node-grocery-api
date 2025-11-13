import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { User } from '../../models/user.model.js';
import { Otp } from '../../models/auth.model.js';

// Helper to generate OTP
const genOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

export const sendOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) throw new ApiError(400, 'Mobile required');

  const otp = genOtp();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min default

  // Delete old OTP if exists for same mobile
  await Otp.deleteMany({ mobile });

  // Save new OTP
  await Otp.create({ mobile, otp, otpExpires });

  // DEV: show OTP in console (for testing)
  console.log(`OTP for ${mobile}: ${otp}`);

  return res.json(new ApiResponse(200, { mobile, otp, otpExpires }, 'OTP sent successfully'));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) throw new ApiError(400, 'mobile and otp required');

  const otpRecord = await Otp.findOne({ mobile });
  if (!otpRecord) throw new ApiError(400, 'OTP not found');
  if (otpRecord.otp !== otp) throw new ApiError(400, 'Invalid OTP');
  if (otpRecord.otpExpires < new Date()) throw new ApiError(400, 'OTP expired');

  // Delete OTP after verification (security)
  await Otp.deleteMany({ mobile });

  // Check if user exists, else create
  let user = await User.findOne({ mobile });
  if (!user) {
    user = await User.create({ mobile });
  }

  // Generate JWT (stateless)
  const token = user.generateAuthToken();

  const userSafe = {
    _id: user._id,
    mobile: user.mobile,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  };

  return res.json(new ApiResponse(200, { user: userSafe, token }, 'Login successful'));
});
