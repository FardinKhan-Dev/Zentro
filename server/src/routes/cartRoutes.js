import express from 'express';
import {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    mergeGuestCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes now require authentication
// Users must be logged in to use cart functionality

/**
 * @route   GET /api/cart
 * @desc    Get current user's cart
 * @access  Private (requires login)
 */
router.get('/', protect, getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private (requires login)
 */
router.post('/items', protect, addItemToCart);

/**
 * @route   PATCH /api/cart/items/:productId
 * @desc    Update item quantity in cart
 * @access  Private (requires login)
 */
router.patch('/items/:productId', protect, updateCartItem);

/**
 * @route   DELETE /api/cart/items/:productId
 * @desc    Remove item from cart
 * @access  Private (requires login)
 */
router.delete('/items/:productId', protect, removeCartItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private (requires login)
 */
router.delete('/', protect, clearCart);

/**
 * @route   POST /api/cart/merge
 * @desc    Merge guest cart into user cart (deprecated - no longer used)
 * @access  Private
 */
router.post('/merge', protect, mergeGuestCart);

export default router;
