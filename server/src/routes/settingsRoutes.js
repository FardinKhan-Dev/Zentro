import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All settings routes are protected and admin-only
router.use(protect);
router.use(restrictTo('admin'));

router.route('/')
    .get(getSettings)
    .patch(updateSettings);

export default router;
