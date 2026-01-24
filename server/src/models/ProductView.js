import mongoose from 'mongoose';

/**
 * ProductView Model
 * Fallback for tracking product views when Redis is unavailable
 * Stores aggregated daily view counts
 */
const productViewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
productViewSchema.index({ product: 1, date: 1 }, { unique: true });

// Index for getting top viewed products
productViewSchema.index({ views: -1 });

const ProductView = mongoose.model('ProductView', productViewSchema);

export default ProductView;
