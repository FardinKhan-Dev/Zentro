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
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

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
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
