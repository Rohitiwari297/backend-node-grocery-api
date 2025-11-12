import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { Banner } from '../../models/banner.model.js';

// Get Banners
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find();
  return res.send(new ApiResponse(200, banners, 'Banners fetched successfully.'));
});
