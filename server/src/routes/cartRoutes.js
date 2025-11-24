import express from 'express';
import {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    mergeGuestCart,
} from '../controllers/cartController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes can work with or without authentication
// If authenticated, use user cart; otherwise use session cart

/**
 * @route   GET /api/cart
 * @desc    Get current cart
 * @access  Public (uses session for guest, user ID for authenticated)
 */
router.get('/', optionalAuth, getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Public
 */
router.post('/items', optionalAuth, addItemToCart);

/**
 * @route   PATCH /api/cart/items/:productId
 * @desc    Update item quantity in cart
 * @access  Public
 */
router.patch('/items/:productId', optionalAuth, updateCartItem);

/**
 * @route   DELETE /api/cart/items/:productId
 * @desc    Remove item from cart
 * @access  Public
 */
router.delete('/items/:productId', optionalAuth, removeCartItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Public
 */
router.delete('/', optionalAuth, clearCart);

/**
 * @route   POST /api/cart/merge
 * @desc    Merge guest cart into user cart (called after login)
 * @access  Private
 */
router.post('/merge', protect, mergeGuestCart);

export default router;
