import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import { getIO } from '../websocket/socket.js';
import { emitInventoryUpdate } from '../websocket/events/inventoryHandlers.js';

const uploadBufferToCloudinary = (buffer, folder = 'zentro/products') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, public_id: result.public_id });
    });
    stream.end(buffer);
  });
};

export const createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category, stock, featured, metadata } = req.body;

  if (!name || !price) throw new AppError('Name and price are required', 400);

  const product = new Product({ name, description, price, category, stock, featured: !!featured, metadata });

  // Handle uploaded files (multer memoryStorage)
  if (req.files && req.files.length) {
    const uploads = await Promise.all(
      req.files.map((f) => uploadBufferToCloudinary(f.buffer))
    );
    product.images = uploads;
  }

  await product.save();

  return res.status(201).json({ success: true, status: 'success', data: product });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) throw new AppError('Product not found', 404);
  return res.json({ success: true, status: 'success', data: prod });
});

export const getProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.q) filter.name = { $regex: req.query.q, $options: 'i' };
  if (req.query.category) filter.category = req.query.category;

  const [items, total] = await Promise.all([Product.find(filter).skip(skip).limit(limit), Product.countDocuments(filter)]);

  return res.json({ success: true, status: 'success', data: items, meta: { page, limit, total } });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) throw new AppError('Product not found', 404);

  const oldStock = prod.stock; // Capture old stock
  const updates = ['name', 'description', 'price', 'category', 'stock', 'featured', 'metadata'];
  updates.forEach((k) => {
    if (req.body[k] !== undefined) prod[k] = req.body[k];
  });

  // If new files uploaded, upload them and append
  if (req.files && req.files.length) {
    const uploads = await Promise.all(req.files.map((f) => uploadBufferToCloudinary(f.buffer)));
    prod.images = prod.images.concat(uploads);
  }

  await prod.save();

  // If stock was updated, emit a socket event
  if (req.body.stock !== undefined && req.body.stock !== oldStock) {
    const io = getIO();
    emitInventoryUpdate(io, prod.id, prod.stock);
  }

  return res.json({ success: true, status: 'success', data: prod });
});

export const deleteProduct = catchAsync(async (req, res, next) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) throw new AppError('Product not found', 404);

  // Remove images from Cloudinary if configured
  if (prod.images && prod.images.length) {
    await Promise.all(
      prod.images.map(async (img) => {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (err) {
          // Log but don't fail deletion
          console.warn('Cloudinary deletion error:', err.message);
        }
      })
    );
  }

  // Use model-level deletion to avoid issues with document.remove in some environments
  await Product.findByIdAndDelete(req.params.id);
  return res.json({ success: true, status: 'success', message: 'Product deleted' });
});

export default { createProduct, getProduct, getProducts, updateProduct, deleteProduct };
