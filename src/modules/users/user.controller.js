import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { User } from '../../models/user.model.js';

// User registration
export const addUser = asyncHandler(async (req, res) => {
  const { name, mobile, email } = req.body;

  const avatar = req.file?.path ?? '';

  if (!mobile) {
    throw new ApiError(400, 'Missing required fields');
  }

  // Check if a user with the provided email or number already exists
  const existingUser = await User.findOne({ mobile });

  if (existingUser) {
    // Remove uploaded avatar (if any) to avoid leaving orphan files
    if (req.file) {
      try {
        const { promises: fsPromises } = await import('fs');
        const { join } = await import('path');

        // Multer may provide either `path` (full path) or `filename`
        const uploadedPath =
          req.file.path ??
          (req.file.filename ? join(process.cwd(), 'uploads', req.file.filename) : null);

        if (uploadedPath) {
          await fsPromises.unlink(uploadedPath).catch(() => {});
        }
      } catch (err) {
        // ignore errors when trying to remove the file
      }
    }

    // If user with provided mobile already exists, throw an error
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

// Update User Details
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, location } = req.body;

  const avatar = req.file?.path ?? '';

  let updateFields = {};

  if (name) {
    updateFields.name = name;
  }
  if (email) {
    updateFields.email = email;
  }
  if (location) {
    updateFields.location = location;
  }

  if (avatar) {
    // If a new avatar is uploaded, try to remove the old one (if any)
    const existingUser = await User.findById(userId, { avatar: 1 });
    console.log(existingUser);

    if (existingUser && existingUser.avatar) {
      try {
        const { promises: fsPromises } = await import('fs');
        const { resolve } = await import('path');
        // Resolve the stored avatar path (may already include 'uploads/...') to an absolute path
        const oldPath = resolve(process.cwd(), existingUser.avatar);
        // Try to unlink and ignore errors (e.g., file not found)
        await fsPromises.unlink(oldPath).catch(() => {});
      } catch (err) {
        // ignore
      }
    }
    updateFields.avatar = avatar;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

  return res.send(new ApiResponse(200, updatedUser, 'User updated successfully.'));
});
