import express from 'express';
import { getMe, updateMe, getAllUsers, deleteUser, addAddress, deleteAddress, updateAddress } from '../controllers/userController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/me', getMe);
import { uploadMultiple } from '../middleware/uploadMiddleware.js';

router.patch('/me', uploadMultiple, updateMe);

// Address Routes
router.post('/me/addresses', addAddress);
router.delete('/me/addresses/:addressId', deleteAddress);
router.patch('/me/addresses/:addressId', updateAddress);

router.use(restrictTo('admin'));
router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

export default router;
