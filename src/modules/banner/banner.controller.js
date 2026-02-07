import { ApiError } from '../../shared/utils/ApiError.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { Banner } from '../../models/banner.model.js';


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

// Get Banners
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find();
  return res.send(new ApiResponse(200, banners, 'Banners fetched successfully.'));
});

// UPDATE BANNER
export const updatebanner = asyncHandler(async (req, res) => {
  console.log('req.body',req.body)
  const { redirectUrl, position } = req.body;
  const { id } = req.params;
  if( !id )throw new ApiError(404, 'Banner id missing in params!');

  const image = req.file?.path ?? ''

  const banner = await Banner.findById(id);
  if ( banner ){
    banner.redirectUrl = redirectUrl !== undefined ? redirectUrl : banner.redirectUrl;
    banner.position = position !== undefined ? position : banner.position;
    banner.image = image !== undefined ? image : banner.image;
  }else{
    throw new ApiError(400, 'Invalid banner id!')
  }

  const updatedBanner = await banner.save();

  return res.status(200).json(new ApiResponse(200, updatedBanner, 'Banner updated successfully!', true));
});

// DELETE BANNER
export const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if( !id )throw new ApiError(404, 'Banner id missing in params!');

  const banner = await Banner.findByIdAndDelete(id);
  if( !banner )throw new ApiError(400, 'Invalid banner id!');

  return res.status(200).json(new ApiResponse(200, banner, 'Banner deleted successfully!', true));
});