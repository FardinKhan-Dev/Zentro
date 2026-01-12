import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';
import { getIO } from '../websocket/socket.js';
import { emitInventoryUpdate } from '../websocket/events/inventoryHandlers.js';
import { trackProductView } from '../services/analyticsService.js';
import cache from '../utils/cache.js';

import { uploadBufferToCloudinary } from '../utils/uploadUtils.js';

export const createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category, stock, featured, metadata, lowStockThreshold } = req.body;

  if (!name || !price) throw new AppError('Name and price are required', 400);

  // Parse tags from JSON string (sent via FormData)
  let tags = [];
  if (req.body.tags) {
    try {
      tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
    } catch (e) {
      tags = [];
    }
  }

  const product = new Product({
    name,
    description,
    price,
    category,
    stock,
    featured: featured === 'true' || featured === true, // FormData sends strings
    metadata,
    lowStockThreshold: lowStockThreshold || 10,
    tags
  });

  // Handle uploaded files (multer memoryStorage)
  if (req.files && req.files.length) {
    const uploads = await Promise.all(
      req.files.map((f) => uploadBufferToCloudinary(f.buffer))
    );
    product.images = uploads;
  }

  await product.save();

  // Invalidate product list cache
  await cache.delPattern('products:*');

  return res.status(201).json({ success: true, status: 'success', data: product });
});

export const getProduct = catchAsync(async (req, res, next) => {
  const cacheKey = `product:${req.params.id}`;

  let prod = await cache.get(cacheKey);

  if (!prod) {
    prod = await Product.findById(req.params.id);
    if (!prod) throw new AppError('Product not found', 404);

    await cache.set(cacheKey, prod, 3600); // 1 hour
  }

  // Track view (async) - don't await this
  trackProductView(req.params.id).catch(err =>
    console.error('Failed to track view:', err)
  );

  return res.json({ success: true, status: 'success', data: prod });
});

export const getProducts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);

  // Create a unique cache key based on query params
  const queryString = JSON.stringify(req.query);
  const cacheKey = `products:${queryString}`;

  let result = await cache.get(cacheKey);

  if (!result) {
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.q) filter.name = { $regex: req.query.q, $options: 'i' };
    if (req.query.category) filter.category = req.query.category;

    // Execute queries in parallel: Items, Total Count (filtered), Global Stats (unfiltered)
    const [items, total, stats] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit),
      Product.countDocuments(filter),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            inStock: { $sum: { $cond: [{ $gt: ["$stock", 0] }, 1, 0] } },
            outOfStock: { $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] } }
          }
        }
      ])
    ]);

    const globalStats = stats.length > 0 ? stats[0] : { totalProducts: 0, inStock: 0, outOfStock: 0 };
    delete globalStats._id;

    result = { items, meta: { page, limit, total }, stats: globalStats };

    // Cache for 5 minutes (shorter TTL for lists as inventory changes)
    await cache.set(cacheKey, result, 300);
  }

  return res.json({ success: true, status: 'success', data: result.items, meta: result.meta, stats: result.stats });
});

export const updateProduct = catchAsync(async (req, res, next) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) throw new AppError('Product not found', 404);

  const oldStock = prod.stock; // Capture old stock
  const updates = ['name', 'description', 'price', 'category', 'stock', 'metadata', 'lowStockThreshold'];
  updates.forEach((k) => {
    if (req.body[k] !== undefined) prod[k] = req.body[k];
  });

  // Handle featured separately (FormData sends as string)
  if (req.body.featured !== undefined) {
    prod.featured = req.body.featured === 'true' || req.body.featured === true;
  }

  // Handle tags (sent as JSON string from FormData)
  if (req.body.tags) {
    try {
      prod.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
    } catch (e) {
      prod.tags = [];
    }
  }

  // Handle existingImages (images user wants to keep)
  if (req.body.existingImages) {
    try {
      const existingImages = typeof req.body.existingImages === 'string'
        ? JSON.parse(req.body.existingImages)
        : req.body.existingImages;
      prod.images = existingImages;
    } catch (e) {
      // Keep current images if parsing fails
    }
  }

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

  // Invalidate specific product cache AND all product lists
  await Promise.all([
    cache.del(`product:${req.params.id}`),
    cache.delPattern('products:*')
  ]);

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

  // Invalidate specific product cache AND all product lists
  await Promise.all([
    cache.del(`product:${req.params.id}`),
    cache.delPattern('products:*')
  ]);

  return res.json({ success: true, status: 'success', message: 'Product deleted' });
});

export default { createProduct, getProduct, getProducts, updateProduct, deleteProduct };
