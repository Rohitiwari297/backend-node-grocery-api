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

// UPDATE CATEGORY
export const updateCategory = asyncHandler(async (req, res) => {
  console.log("requested data:", req.body)
  console.log(req.headers['content-type']);

  const { id } = req.params;
  const { name, position, type } = req.body;
  const thumbnail = req.file?.path;

  const category = await Category.findById(id);
  const catType = type.toUpperCase();
  if (category) {
    category.name = name !== undefined ? name : category.name;
    category.position = position !== undefined ? position : category.position;
    category.type = catType !== undefined ? catType : category.type;
    category.image = thumbnail !== undefined ? thumbnail : category.image;
  } else {
    throw new ApiError(404, 'Invalid category id');
  }

  const updatedCategory = await category.save();

  res.status(200).json(new ApiResponse(200, updatedCategory, 'Category updated successfully', true))
})

// DELETE CATEGORY
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, 'Category id is missing!');

  const delCat = await Category.findByIdAndDelete(id)
  if (!delCat) throw new ApiError(500, 'Invalid category id!');

  return res.status(200).json(new ApiResponse(200, delCat, 'Category deleted successfully'));

})

// Add Sub Category
export const addSubCategory = asyncHandler(async (req, res) => {
  const { category_id, name } = req.body;
  if (!category_id || !name) throw new ApiError(400, 'Failed! All required fields are mandatory');

  const image = req.file?.path ?? '';
  // if(!image) throw new ApiError(400, 'Failed! Thumbnail of sub-category is mandatory');

  const newSubCategory = await SubCategory.create({ category: category_id, name, image });
  if (!newSubCategory) throw new ApiError(500, 'Failed to create new sub-category! Please try again');

  return res.status(201).json(new ApiResponse(201, newSubCategory, 'Sub Category added successfully.'));
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

// UPDATE SUB CATEGORY
export const updateSubCategory = asyncHandler(async (req, res) => {
  const { categoryId, name } = req.body;
  const { id } = req.params;
  const image = req.file?.path;

  if (!id) throw new ApiError(404, 'Sub-category id is missing!')

  const updatedDataObj = {};
  if (categoryId !== undefined) updatedDataObj.category = categoryId;
  if (name !== undefined) updatedDataObj.name = name;
  if (image !== undefined) updatedDataObj.image = image;

  if (Object.keys(updatedDataObj).length === 0) throw new ApiError(400, 'No fields provided for update');

  const updatedSubCategory = await SubCategory.findByIdAndUpdate(
    id,
    updatedDataObj,
    { new: true }
  )
  if (!updatedSubCategory) throw new ApiError(500, 'Invalid Sub-category id!');

  return res.status(200).json(new ApiResponse(200, updatedSubCategory, 'Sub-category updated successfully!', true))
})

// DELETE SUB CATEGORY
export const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) throw new ApiError(404, 'Sub-category id is missing!');

  const subCategory = await SubCategory.findByIdAndDelete(id);
  if (!subCategory) throw new ApiError(400, 'Invalid sub-category id!');

  next(res.status(200).json(new ApiResponse(200, subCategory, 'Sub-category deleted successfully', true)))

})