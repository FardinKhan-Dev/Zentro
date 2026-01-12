import { catchAsync } from '../utils/errorHandler.js';
import User from '../models/User.js';

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

export const getMe = catchAsync(async (req, res) => {
    // User is already fetched by protect middleware
    const user = req.userDoc;

    res.status(200).json({
        status: 'success',
        data: user,
    });
});

import { uploadBufferToCloudinary } from '../utils/uploadUtils.js';

export const updateMe = catchAsync(async (req, res) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return res.status(400).json({
            status: 'error',
            message: 'This route is not for password updates. Please use /updateMyPassword.'
        });
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email', 'phoneNumber');

    // 3) Handle Avatar Upload if present
    if (req.files && req.files.length > 0) {
        // Assume first file is the avatar
        const file = req.files[0];
        const uploadResult = await uploadBufferToCloudinary(file.buffer, 'zentro/avatars');
        filteredBody.avatar = uploadResult.url;
    }

    // 4) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.userDoc.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: updatedUser
    });
});

/**
 * Add a new address
 */
export const addAddress = catchAsync(async (req, res) => {
    const user = req.userDoc;

    // If setting as default, unset others first
    if (req.body.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(200).json({
        status: 'success',
        data: user.addresses
    });
});

/**
 * Delete an address
 */
export const deleteAddress = catchAsync(async (req, res) => {
    const user = req.userDoc;

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
    await user.save();

    res.status(200).json({
        status: 'success',
        data: user.addresses
    });
});

/**
 * Update an existing address
 */
export const updateAddress = catchAsync(async (req, res) => {
    const user = req.userDoc;
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        return res.status(404).json({
            status: 'error',
            message: 'Address not found'
        });
    }

    // If setting as default, unset others first
    if (req.body.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Update fields
    Object.assign(address, req.body);
    await user.save();

    res.status(200).json({
        status: 'success',
        data: user.addresses
    });
});

export const getAllUsers = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const queryObj = {};

    // Search functionality
    if (req.query.search) {
        queryObj.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Role filtering
    if (req.query.role) {
        queryObj.role = req.query.role;
    }

    const users = await User.find(queryObj)
        .select('-password')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments(queryObj);

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            data: users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        }
    });
});

export const deleteUser = catchAsync(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
