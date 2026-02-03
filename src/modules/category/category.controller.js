import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { Category, SubCategory } from '../../models/category.model.js';
import mongoose from 'mongoose';

// ADD CATEGORIES
export const addCategory = asyncHandler(async (req, res) => {
  const { name, position, type } = req.body;
  if (!name || !type) throw new ApiError(400, 'Failed! All fields are required');

  const thumbail = req.file?.path ?? '';
  if (!thumbail) throw new ApiError(400, 'Failed! Category thumbnail is required');

  const catType = type.toUpperCase();
  const category = await Category.create({ name, position, image: thumbail, type: catType });
  if (!category) throw new ApiError(400, "Failed to create category");

  return res.send(new ApiResponse(201, category, 'Category added successfully.', true));
});

// GET CATEGORIES
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  return res.send(new ApiResponse(200, categories, 'Categories fetched successfully.'));
});

// Add Sub Category
export const addSubCategory = asyncHandler(async (req, res) => {
  const { category, name } = req.body;

  const image = req.file?.path ?? '';
  const newSubCategory = await SubCategory.create({ category, name, image });

  return res.send(new ApiResponse(201, newSubCategory, 'Sub Category added successfully.'));
});

// Get Sub Categories
export const getSubCategories = asyncHandler(async (req, res) => {
  const { category } = req.query;

  let filterObj = {};

  if (category && mongoose.Types.ObjectId.isValid(category)) {
    filterObj.category = new mongoose.Types.ObjectId(category);
  }

  const subCategories = await SubCategory.aggregate([

    {
      $match: filterObj
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },
    { $unwind: "$category" },

    {
      $group: {
        _id: "$category._id",
        categoryName: { $first: "$category.name" },
        categoryImage: { $first: "$category.image" },

        subCategories: {
          $push: {
            _id: "$_id",
            name: "$name",
            image: "$image",
            createdAt: "$createdAt"
          }
        }
      }
    }
  ]);

  return res.send(new ApiResponse(200, subCategories, 'Sub Categories fetched successfully.'));
});
