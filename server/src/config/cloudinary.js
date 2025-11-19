import { v2 as cloudinaryLib } from 'cloudinary';

const cloudinaryStub = {
  uploader: {
    upload_stream: (opts, cb) => ({
      end: (buf) => process.nextTick(() => cb(null, {
        secure_url: 'https://res.cloudinary.test/fake.jpg',
        public_id: `test_${Date.now()}`,
      })),
    }),
    destroy: async (public_id) => ({ result: 'ok', public_id }),
  },
};

const isTest = process.env.NODE_ENV === 'test';

const cloudinary = isTest ? cloudinaryStub : cloudinaryLib;

export const initializeCloudinary = () => {
  if (!isTest) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.warn('⚠ Cloudinary is not fully configured - image uploads will be disabled');
    }
  }

  return cloudinary;
};

export default cloudinary;
