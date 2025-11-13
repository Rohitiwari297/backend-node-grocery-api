import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { Banner } from '../../models/banner.model.js';

// Get Banners
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find();
  return res.send(new ApiResponse(200, banners, 'Banners fetched successfully.'));
});

// Add Banner 
export const addBanner = asyncHandler(async (req, res) => {
  const { redirectUrl, position } = req.body;

  const image = req.file?.path ?? '';

  if (!redirectUrl) {
    throw new ApiError(400, 'Missing required fields');
  }

  // Create a new user instance
  let newBanner = new Banner({
    redirectUrl,
    image,
    position,
  });

  newBanner = await newBanner.save();

  newBanner = await Banner.findByIdAndUpdate(newBanner._id, { new: true });

  return res.json(new ApiResponse(200, newBanner, 'Banner added successfully'));
});
