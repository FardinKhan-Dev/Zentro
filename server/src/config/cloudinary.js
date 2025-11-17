import { v2 as cloudinary } from 'cloudinary';

export const initializeCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.warn('⚠ Cloudinary is not fully configured - image uploads will be disabled');
  }

  return cloudinary;
};

export default cloudinary;
