import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { Category, SubCategory } from '../../models/category.model.js';

// Get Categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  return res.send(new ApiResponse(200, categories, 'Categories fetched successfully.'));
});

// Add Category
export const addCategory = asyncHandler(async (req, res) => {
  const { name, position } = req.body;
  const image = req.file?.path ?? '';
  const category = await Category.create({ name, position, image });

  return res.send(new ApiResponse(201, category, 'Category added successfully.'));
});

// Get Sub Categories
export const getSubCategories = asyncHandler(async (req, res) => {
  const { category } = req.query;

  let filter = {};

  if (category) {
    filter.category = category;
  }

  const subCategories = await SubCategory.find(filter).populate('category', 'name image');

  return res.send(new ApiResponse(200, subCategories, 'Sub Categories fetched successfully.'));
});

// Add Sub Category
export const addSubCategory = asyncHandler(async (req, res) => {
  const { category, name } = req.body;
  const image = req.file?.path ?? '';
  const newSubCategory = await SubCategory.create({ category, name, image });

  return res.send(new ApiResponse(201, newSubCategory, 'Sub Category added successfully.'));
});
