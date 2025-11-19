import express from 'express';
import {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { uploadMultiple } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected (require authentication for create/update/delete)
router.post('/', protect, uploadMultiple, createProduct);
router.put('/:id', protect, uploadMultiple, updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
