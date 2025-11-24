import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, index: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    images: [ImageSchema],
    category: { type: String, default: 'general' },
    stock: { type: Number, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 }, // Stock reserved during checkout
    lowStockThreshold: { type: Number, default: 10 }, // Alert threshold
    featured: { type: Boolean, default: false },
    metadata: { type: Object, default: {} },
  },
  {
    timestamps: true,
    optimisticConcurrency: true, // Enable versioning for optimistic locking
  }
);

// Index for efficient inventory queries
productSchema.index({ stock: 1, reservedStock: 1 });

// Virtual property for available stock
productSchema.virtual('availableStock').get(function () {
  return Math.max(0, this.stock - this.reservedStock);
});

// Virtual property to check if product is in stock
productSchema.virtual('inStock').get(function () {
  return this.availableStock > 0;
});

// Virtual property to check if stock is low
productSchema.virtual('isLowStock').get(function () {
  return this.availableStock <= this.lowStockThreshold && this.availableStock > 0;
});

// Instance Methods

/**
 * Check if requested quantity is available
 */
productSchema.methods.isQuantityAvailable = function (quantity) {
  return this.availableStock >= quantity;
};

/**
 * Reserve stock for checkout (optimistic locking)
 */
productSchema.methods.reserveStock = async function (quantity) {
  if (!this.isQuantityAvailable(quantity)) {
    throw new Error(`Insufficient stock. Only ${this.availableStock} available`);
  }

  this.reservedStock += quantity;

  // Save with version check (optimistic locking)
  try {
    await this.save();
    return true;
  } catch (error) {
    if (error.name === 'VersionError') {
      throw new Error('Stock was modified by another transaction. Please retry.');
    }
    throw error;
  }
};

/**
 * Release reserved stock (e.g., on checkout timeout or cancellation)
 */
productSchema.methods.releaseReservedStock = async function (quantity) {
  this.reservedStock = Math.max(0, this.reservedStock - quantity);

  try {
    await this.save();
    return true;
  } catch (error) {
    if (error.name === 'VersionError') {
      throw new Error('Stock was modified by another transaction. Please retry.');
    }
    throw error;
  }
};

/**
 * Deduct stock after successful payment
 */
productSchema.methods.deductStock = async function (quantity) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock to deduct');
  }

  this.stock -= quantity;
  this.reservedStock = Math.max(0, this.reservedStock - quantity);

  try {
    await this.save();
    return true;
  } catch (error) {
    if (error.name === 'VersionError') {
      throw new Error('Stock was modified by another transaction. Please retry.');
    }
    throw error;
  }
};

/**
 * Restore stock (e.g., on order cancellation after payment)
 */
productSchema.methods.restoreStock = async function (quantity) {
  this.stock += quantity;

  try {
    await this.save();
    return true;
  } catch (error) {
    if (error.name === 'VersionError') {
      throw new Error('Stock was modified by another transaction. Please retry.');
    }
    throw error;
  }
};

// Simple slug generation from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Ensure reserved stock doesn't exceed total stock
  if (this.reservedStock > this.stock) {
    this.reservedStock = this.stock;
  }

  next();
});

// Enable virtuals in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
