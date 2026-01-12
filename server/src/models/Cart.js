import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    // Snapshot data to preserve info even if product changes/deleted
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: '',
    },
}, { _id: false });

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
            sparse: true, // Allow null for guest carts
        },
        sessionId: {
            type: String,
            index: true,
            sparse: true, // For guest cart identification
        },
        items: [CartItemSchema],
        totalPrice: {
            type: Number,
            default: 0,
            min: 0,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
    },
    {
        timestamps: true,
    }
);

// TTL index to auto-delete expired carts
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient cart retrieval
cartSchema.index({ user: 1, sessionId: 1 });

// Virtual property for total item count
cartSchema.virtual('itemCount').get(function () {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Instance Methods

/**
 * Add item to cart or update quantity if it already exists
 */
cartSchema.methods.addItem = function (product, quantity = 1) {
    const existingItemIndex = this.items.findIndex(
        (item) => item.product.toString() === product._id.toString()
    );

    if (existingItemIndex > -1) {
        // Item exists, update quantity
        this.items[existingItemIndex].quantity += quantity;
    } else {
        // New item, add to cart
        this.items.push({
            product: product._id,
            quantity,
            price: product.price,
            name: product.name,
            image: product.images?.[0]?.url || '',
        });
    }

    this.calculateTotal();
    return this;
};

/**
 * Update item quantity
 */
cartSchema.methods.updateQuantity = function (productId, quantity) {
    const item = this.items.find(
        (item) => item.product.toString() === productId.toString()
    );

    if (!item) {
        throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        this.removeItem(productId);
    } else {
        item.quantity = quantity;
        this.calculateTotal();
    }

    return this;
};

/**
 * Remove item from cart
 */
cartSchema.methods.removeItem = function (productId) {
    this.items = this.items.filter(
        (item) => item.product.toString() !== productId.toString()
    );
    this.calculateTotal();
    return this;
};

/**
 * Clear all items from cart
 */
cartSchema.methods.clearCart = function () {
    this.items = [];
    this.totalPrice = 0;
    return this;
};

/**
 * Calculate total price
 */
cartSchema.methods.calculateTotal = function () {
    this.totalPrice = this.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
    return this.totalPrice;
};

/**
 * Check if cart is empty
 */
cartSchema.methods.isEmpty = function () {
    return this.items.length === 0;
};

/**
 * Extend cart expiration
 */
cartSchema.methods.extendExpiration = function (days = 7) {
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return this;
};

// Static Methods

/**
 * Find or create cart for user
 */
cartSchema.statics.findOrCreateForUser = async function (userId) {
    let cart = await this.findOne({ user: userId });

    if (!cart) {
        cart = await this.create({ user: userId });
    } else {
        // Extend expiration when cart is accessed
        cart.extendExpiration();
        await cart.save();
    }

    return cart;
};

/**
 * Find or create cart for guest (by session ID)
 */
cartSchema.statics.findOrCreateForGuest = async function (sessionId) {
    let cart = await this.findOne({ sessionId });

    if (!cart) {
        cart = await this.create({ sessionId });
    } else {
        cart.extendExpiration();
        await cart.save();
    }

    return cart;
};

/**
 * Merge guest cart into user cart on login
 */
cartSchema.statics.mergeGuestCart = async function (userId, sessionId) {
    const [userCart, guestCart] = await Promise.all([
        this.findOne({ user: userId }),
        this.findOne({ sessionId }),
    ]);

    if (!guestCart || guestCart.isEmpty()) {
        return userCart;
    }

    if (!userCart) {
        // No user cart exists, convert guest cart to user cart
        guestCart.user = userId;
        guestCart.sessionId = undefined;
        await guestCart.save();
        return guestCart;
    }

    // Merge guest cart items into user cart
    for (const guestItem of guestCart.items) {
        const existingItem = userCart.items.find(
            (item) => item.product.toString() === guestItem.product.toString()
        );

        if (existingItem) {
            existingItem.quantity += guestItem.quantity;
        } else {
            userCart.items.push(guestItem);
        }
    }

    userCart.calculateTotal();
    await userCart.save();

    // Delete guest cart after merge
    await guestCart.deleteOne();

    return userCart;
};

// Pre-save middleware
cartSchema.pre('save', function (next) {
    // Ensure either user or sessionId is set (but not both)
    if (!this.user && !this.sessionId) {
        return next(new Error('Cart must have either user or sessionId'));
    }

    // Calculate total before saving
    this.calculateTotal();
    next();
});

// Enable virtuals in JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
