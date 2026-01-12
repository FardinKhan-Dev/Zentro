import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import logger from '../src/utils/logger.js';

dotenv.config({ path: './.env' });

const seedUsers = async () => {
    try {
        await connectDB();
        logger.info('Connected to MongoDB...');

        // Optional: clear existing non-admin users if you want a clean slate
        // await User.deleteMany({ role: { $ne: 'admin' } });

        const users = [];
        const password = 'password123'; // Will be hashed by pre-save hook

        for (let i = 1; i <= 50; i++) {
            users.push({
                name: `Test User ${i}`,
                email: `user${i}@example.com`,
                password: password,
                role: 'user',
                isVerified: i % 2 === 0, // 50% verified
            });
        }

        // We use create instead of insertMany to trigger the pre-save hook for password hashing
        // This might be slower but ensures passwords are correct
        logger.info('Creating 50 dummy users...');
        
        for (const user of users) {
             // Check if user exists to avoid duplicate key errors if re-running
             const exists = await User.findOne({ email: user.email });
             if (!exists) {
                 await User.create(user);
             }
        }

        logger.info('✓ Successfully seeded 50 users!');
        process.exit();
    } catch (error) {
        logger.error(`✗ Error seeding users: ${error.message}`);
        process.exit(1);
    }
};

seedUsers();
