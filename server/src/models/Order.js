import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    image: {
        type: String,
        default: '',
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
}, { _id: false });

const ShippingAddressSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'US' },
}, { _id: false });

const StatusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    note: {
        type: String,
        default: '',
    },
}, { _id: false });

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: 'Order must contain at least one item',
            },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentIntent: {
            type: String,
            default: '',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
            index: true,
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
            index: true,
        },
        shippingAddress: {
            type: ShippingAddressSchema,
            required: true,
        },
        trackingNumber: {
            type: String,
            default: '',
        },
        statusHistory: {
            type: [StatusHistorySchema],
            default: [],
        },
        notes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
orderSchema.index({ user: 1, createdAt: -1 }); // Get user orders sorted by date
orderSchema.index({ orderStatus: 1, createdAt: -1 }); // Admin queries by status
orderSchema.index({ paymentStatus: 1 }); // Payment queries

// Static method to generate unique order number
orderSchema.statics.generateOrderNumber = async function () {
    const prefix = 'ORD';
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

    // Find the last order number for today
    const lastOrder = await this.findOne({
        orderNumber: new RegExp(`^${prefix}-${dateStr}`),
    }).sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
        const lastSequence = parseInt(lastOrder.orderNumber.split('-').pop());
        sequence = lastSequence + 1;
    }

    const paddedSequence = sequence.toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${paddedSequence}`;
};

// Instance method to update order status with history tracking
orderSchema.methods.updateStatus = function (newStatus, note = '') {
    if (this.orderStatus === newStatus) {
        return this; // No change
    }

    // Validate status transition
    const validTransitions = {
        pending: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: [],
    };

    const allowedStatuses = validTransitions[this.orderStatus] || [];
    if (!allowedStatuses.includes(newStatus)) {
        throw new Error(`Cannot transition from ${this.orderStatus} to ${newStatus}`);
    }

    // Update status
    this.orderStatus = newStatus;

    // Add to status history
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note,
    });

    return this;
};

// Instance method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function () {
    return ['pending', 'processing'].includes(this.orderStatus) &&
        this.paymentStatus !== 'refunded';
};

// Instance method to calculate total from items
orderSchema.methods.calculateTotal = function () {
    this.totalAmount = this.items.reduce(
        (total, item) => total + item.subtotal,
        0
    );
    return this.totalAmount;
};

// Instance method to mark as paid
orderSchema.methods.markAsPaid = function (paymentIntentId) {
    this.paymentStatus = 'paid';
    this.paymentIntent = paymentIntentId;

    // Auto-transition to processing if still pending
    if (this.orderStatus === 'pending') {
        this.updateStatus('processing', 'Payment received');
    }

    return this;
};

// Instance method to add tracking number
orderSchema.methods.addTrackingNumber = function (trackingNumber) {
    this.trackingNumber = trackingNumber;

    // Auto-update to shipped if not already
    if (this.orderStatus === 'processing') {
        this.updateStatus('shipped', `Tracking: ${trackingNumber}`);
    }

    return this;
};

// Virtual for order age
orderSchema.virtual('orderAge').get(function () {
    const ageMs = Date.now() - this.createdAt.getTime();
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    return ageDays;
});

// Virtual for formatted order number
orderSchema.virtual('formattedOrderNumber').get(function () {
    return `#${this.orderNumber}`;
});

// Pre-save middleware
orderSchema.pre('save', function (next) {
    // Initialize status history if empty
    if (this.isNew && this.statusHistory.length === 0) {
        this.statusHistory.push({
            status: this.orderStatus,
            timestamp: this.createdAt || new Date(),
            note: 'Order created',
        });
    }

    // Calculate total if items changed
    if (this.isModified('items')) {
        this.calculateTotal();
    }

    next();
});

// Enable virtuals in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
