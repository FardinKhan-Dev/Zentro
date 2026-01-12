import PlatformSettings from '../models/PlatformSettings.js';
import { catchAsync } from '../utils/errorHandler.js';

export const getSettings = catchAsync(async (req, res) => {
    const settings = await PlatformSettings.getSettings();

    res.status(200).json({
        status: 'success',
        data: settings
    });
});

export const updateSettings = catchAsync(async (req, res) => {
    const settings = await PlatformSettings.findOneAndUpdate(
        {},
        req.body,
        { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
        status: 'success',
        data: settings
    });
});
