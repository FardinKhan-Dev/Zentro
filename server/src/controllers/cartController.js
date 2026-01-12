import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { AppError, catchAsync } from '../utils/errorHandler.js';
import { customResponse } from '../utils/response.js';
import { getRedisClient } from '../config/redis.js';
import cache from '../utils/cache.js';

/**
 * Get Redis cart key
 */
const getCartCacheKey = (userId, sessionId) => {
    return userId ? `cart:user:${userId}` : `cart:session:${sessionId}`;
};

/**
 * GET /api/cart - Get current user's cart
 */
export const getCart = catchAsync(async (req, res, next) => {
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.cookies.sessionId;

    if (!userId && !sessionId) {
        throw new AppError('User or session required', 400);
    }

    const cacheKey = getCartCacheKey(userId, sessionId);

    // Try to get from cache first
    let cart = await cache.get(cacheKey);

    if (!cart) {
        // Not in cache, get from database
        if (userId) {
            cart = await Cart.findOrCreateForUser(userId)
            await cart.populate('items.product', 'name price images stock');
        } else {
            cart = await Cart.findOrCreateForGuest(sessionId)
            await cart.populate('items.product', 'name price images stock');
        }

        // Cache the cart
        await cache.set(cacheKey, cart, 7 * 24 * 60 * 60); // 7 days
    }

    return customResponse(res, {
        status: 200,
        success: true,
        message: 'Cart retrieved successfully',
        data: {
            cart,
            itemCount: cart.itemCount,
        },
    });
});

/**
 * POST /api/cart/items - Add item to cart
 */
export const addItemToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.cookies.sessionId;

    if (!productId) {
        throw new AppError('Product ID is required', 400);
    }

    if (quantity < 1) {
        throw new AppError('Quantity must be at least 1', 400);
    }

    // Get product and check stock
    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    if (product.stock < quantity) {
        throw new AppError(`Only ${product.stock} items available in stock`, 400);
    }

    // Get or create cart
    let cart;
    if (userId) {
        cart = await Cart.findOrCreateForUser(userId);
    } else {
        if (!sessionId) {
            throw new AppError('Session required for guest cart', 400);
        }
        cart = await Cart.findOrCreateForGuest(sessionId);
    }

    // Check if adding more would exceed stock
    const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
    );
    const totalQuantity = (existingItem?.quantity || 0) + quantity;

    if (totalQuantity > product.stock) {
        throw new AppError(
            `Cannot add ${quantity} more. Only ${product.stock - (existingItem?.quantity || 0)} available`,
            400
        );
    }

    // Add item to cart
    cart.addItem(product, quantity);
    await cart.save();

    const redis = getRedisClient();
    if (redis) redis.zIncrBy('analytics:cart:products', quantity, productId).catch();

    // Populate product details
    await cart.populate('items.product', 'name price images stock');

    // Update cache
    const cacheKey = getCartCacheKey(userId, sessionId);
    await cache.set(cacheKey, cart, 7 * 24 * 60 * 60);

    return customResponse(res, {
        status: 200,
        success: true,
        message: 'Item added to cart',
        data: {
            cart,
            itemCount: cart.itemCount,
        },
    });
});

/**
 * PATCH /api/cart/items/:productId - Update item quantity
 */
export const updateCartItem = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.cookies.sessionId;

    if (quantity === undefined) {
        throw new AppError('Quantity is required', 400);
    }

    if (quantity < 0) {
        throw new AppError('Quantity cannot be negative', 400);
    }

    // Get cart
    let cart;
    if (userId) {
        cart = await Cart.findOne({ user: userId });
    } else {
        cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    // Check stock if increasing quantity
    if (quantity > 0) {
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }

        if (product.stock < quantity) {
            throw new AppError(`Only ${product.stock} items available in stock`, 400);
        }
    }

    // Update quantity (will remove item if quantity is 0)
    cart.updateQuantity(productId, quantity);
    await cart.save();


    const redis = getRedisClient();
    if (redis) redis.zIncrBy('analytics:cart:products', quantity, productId).catch();

    // Populate product details
    await cart.populate('items.product', 'name price images stock');

    // Update cache
    const cacheKey = getCartCacheKey(userId, sessionId);
    await cache.set(cacheKey, cart, 7 * 24 * 60 * 60);

    return customResponse(res, {
        status: 200,
        success: true,
        message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
        data: {
            cart,
            itemCount: cart.itemCount,
        },
    });
});

/**
 * DELETE /api/cart/items/:productId - Remove item from cart
 */
export const removeCartItem = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.cookies.sessionId;

    // Get cart
    let cart;
    if (userId) {
        cart = await Cart.findOne({ user: userId });
    } else {
        cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    // Remove item
    cart.removeItem(productId);
    await cart.save();

    const redis = getRedisClient();
    // if (redis) redis.zIncrBy('analytics:cart:products', quantity, productId).catch(); // quantity not defined here, removed

    // Populate product details
    await cart.populate('items.product', 'name price images stock');

    // Update cache
    const cacheKey = getCartCacheKey(userId, sessionId);
    await cache.set(cacheKey, cart, 7 * 24 * 60 * 60);

    return customResponse(res, {
        status: 200,
        success: true,
        message: 'Item removed from cart',
        data: {
            cart,
            itemCount: cart.itemCount,
        },
    });
});

/**
 * DELETE /api/cart - Clear entire cart
 */
export const clearCart = catchAsync(async (req, res, next) => {
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.cookies.sessionId;

    // Get cart
    let cart;
    if (userId) {
        cart = await Cart.findOne({ user: userId });
    } else {
        cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    // Clear all items
    cart.clearCart();
    await cart.save();

    // const redis = getRedisClient();
    // if (redis) redis.zIncrBy('analytics:cart:products', quantity, productId).catch();

    // Invalidate cache
    const cacheKey = getCartCacheKey(userId, sessionId);
    await cache.del(cacheKey);

    return customResponse(res, {
        status: 200,
        success: true,
        message: 'Cart cleared',
        data: {
            cart,
            itemCount: 0,
        },
    });
});

/**
 * POST /api/cart/merge - Merge guest cart into user cart (called on login)
 */
export const mergeGuestCart = catchAsync(async (req, res, next) => {
    const userId = req.user?.id;
    const { sessionId } = req.body;

    if (!userId) {
        throw new AppError('User authentication required', 401);
    }

    if (!sessionId) {
        // No guest cart to merge
        const cart = await Cart.findOrCreateForUser(userId).populate('items.product', 'name price images stock');
        return customResponse(res, {
            status: 200,
            success: true,
            data: { cart, itemCount: cart.itemCount },
        });
    }

    // Merge guest cart into user cart
    const cart = await Cart.mergeGuestCart(userId, sessionId);
    await cart.populate('items.product', 'name price images stock');

    // Invalidate both caches
    const userKey = getCartCacheKey(userId, null);
    const sessionKey = getCartCacheKey(null, sessionId);

    await Promise.all([
        cache.del(userKey),
        cache.del(sessionKey)
    ]);

    // Cache merged cart
    await cache.set(userKey, cart, 7 * 24 * 60 * 60);

    return customResponse(res, {
        status: 200,
        success: true,
        message: 'Carts merged successfully',
        data: {
            cart,
            itemCount: cart.itemCount,
        },
    });
});

export default {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    mergeGuestCart,
};
