import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { Category } from '../../models/category.model.js';

// Get User
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  return res.send(new ApiResponse(200, categories, 'Categories fetched successfully.'));
});
