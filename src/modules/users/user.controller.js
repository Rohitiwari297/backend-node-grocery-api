import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { User } from '../../models/user.model.js';

// User registration
export const addUser = asyncHandler(async (req, res) => {
  const { name, mobile, email } = req.body;

  const avatar = req.file?.filename ?? '';

  if (!mobile) {
    throw new ApiError(400, 'Missing required fields');
  }

  // Check if a user with the provided email or number already exists
  const existingUser = await User.findOne({ mobile });

  if (existingUser) {
    // If user with provided email or number already exists, throw an error
    throw new ApiError(400, 'User already exists');
  }

  let uid;

  const lastUser = await User.findOne().sort({ uid: -1 });
  if (lastUser && lastUser.uid) {
    const lastNumber = parseInt(lastUser.uid.substring(1));
    uid = 'C' + (lastNumber + 1).toString().padStart(6, '0');
  } else {
    uid = 'C100001';
  }
  // Create a new user instance
  let newUser = new User({
    uid,
    name,
    mobile,
    email,
    avatar,
  });

  newUser = await newUser.save();

  newUser = await User.findByIdAndUpdate(newUser._id, { new: true });

  return res.json(new ApiResponse(200, { user: newUser }, 'User registered successfully'));
});

// Get User
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  return res.send(new ApiResponse(200, users, 'Users fetched successfully.'));
});

// Get User By Id
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  return res.send(new ApiResponse(200, user, 'User fetched successfully.'));
});
