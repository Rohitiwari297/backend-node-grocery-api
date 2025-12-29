import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { Product } from '../../models/product.model.js';
import mongoose from 'mongoose';

// Get Products
export const getProducts = asyncHandler(async (req, res) => {
  const { category, subCategory, page = 1, limit = 10, search, sort = 'newest', } = req.query;

  const matchStage = {};

  // Add filters if provided
  if (category) {
    matchStage.category = new mongoose.Types.ObjectId(category);
  }

  if (subCategory) {
    matchStage.subCategory = new mongoose.Types.ObjectId(subCategory);
  }

  let sortStage = {};

  switch (sort) {
    case 'price_asc':
      sortStage = { currentPrice: 1 };
      break;

    case 'price_desc':
      sortStage = { currentPrice: -1 };
      break;

    case 'popular':
      // change "popularity" to views / orders / ratingCount as per your schema
      sortStage = { popularity: -1 };
      break;

    case 'newest':
    default:
      sortStage = { createdAt: -1 };
      break;
  }


  const skip = (page - 1) * limit;

  // console.log(sortStage);



  const products = await Product.aggregate([
    { $match: matchStage },
    { $sort: sortStage },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
        pipeline: [{ $project: { name: 1, image: 1 } }],
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategory',
        foreignField: '_id',
        as: 'subCategory',
        pipeline: [{ $project: { name: 1, image: 1 } }],
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$subCategory', preserveNullAndEmptyArrays: true } },

    // PAGINATION WITH FACET
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: skip }, { $limit: parseInt(limit) }],
      },
    },
  ]);

  const total = products[0]?.metadata?.[0]?.total || 0;

  return res.send(
    new ApiResponse(
      200,
      {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        products: products[0].data,
      },
      'Products fetched successfully.',
    ),
  );
});
// GET Related Products
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { category, subCategory } = req.query;

  const matchStage = {};

  // Add filters if provided
  if (category) {
    matchStage.category = new mongoose.Types.ObjectId(category);
  }

  if (subCategory) {
    matchStage.subCategory = new mongoose.Types.ObjectId(subCategory);
  }

  const products = await Product.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
        pipeline: [{ $project: { name: 1, image: 1 } }],
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategory',
        foreignField: '_id',
        as: 'subCategory',
        pipeline: [{ $project: { name: 1, image: 1 } }],
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$subCategory', preserveNullAndEmptyArrays: true } },
    { $limit: 5 },
  ]);

  return res.send(new ApiResponse(200, products, 'Products fetched successfully.'));
});

export const getProductById = asyncHandler(async (req, res) => {
  const { productid } = req.params;

  const matchStage = {};

  // Add filters if provided
  if (productid) {
    matchStage._id = new mongoose.Types.ObjectId(productid);
  }

  const product = await Product.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
        pipeline: [{ $project: { name: 1, image: 1 } }],
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'subCategory',
        foreignField: '_id',
        as: 'subCategory',
        pipeline: [{ $project: { name: 1, image: 1 } }],
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$subCategory', preserveNullAndEmptyArrays: true } },
  ]);

  return res.send(new ApiResponse(200, product[0], 'Product fetched successfully.'));
});

// Add Product
export const addProduct = asyncHandler(async (req, res) => {
  const { name, category, subCategory, description, currentPrice, originalPrice, unit } = req.body;

  // Extract image paths from multer
  const images = req.files ? req.files.map((file) => file.path) : [];

  console.log(req.body);

  if (!images.length) {
    // If validation fails, remove any uploaded files to avoid orphaned files
    if (req.files && req.files.length) {
      try {
        const fs = await import('fs/promises');
        await Promise.all(req.files.map((file) => fs.unlink(file.path).catch(() => { })));
      } catch (err) {
        console.error('Failed to remove uploaded files:', err);
      }
    }
    throw new ApiError(400, 'At least one image is required');
  }

  const product = await Product.create({
    name,
    category,
    subCategory,
    description,
    currentPrice,
    originalPrice,
    unit,
    images,
  });

  return res.send(new ApiResponse(201, product, 'Product added successfully.'));
});
