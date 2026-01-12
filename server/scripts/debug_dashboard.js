
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initializeRedis, disconnectRedis } from '../src/config/redis.js';
import { getDashboardStats } from '../src/services/analyticsService.js';

import { trackProductView, trackSale } from '../src/services/analyticsService.js';

const debugDashboard = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await initializeRedis();
        console.log('Connected to Redis');

        // Simulate views for random products
        const products = await Product.find().limit(5);
        if (products.length > 0) {
            console.log(`Simulating views and SALES for ${products.length} products...`);
            for (const product of products) {
                // Random 10-50 views
                const views = Math.floor(Math.random() * 40) + 10;
                // console.log(`Adding ${views} views for product: ${product.name}`);
                for (let i = 0; i < views; i++) {
                    await trackProductView(product._id);
                }

                // Simulate sales (random 1-5 sales per product)
                const salesCount = Math.floor(Math.random() * 5) + 1;
                console.log(`Adding ${salesCount} sales for product: ${product.name}`);
                for (let j = 0; j < salesCount; j++) {
                    await trackSale({
                        totalAmount: product.price,
                        items: [{ product: product._id, quantity: 1, price: product.price }],
                        createdAt: new Date()
                    });
                }
            }
        } else {
            console.log('No products found to simulate views.');
        }

        console.log('Fetching Dashboard Stats...');
        const stats = await getDashboardStats();

        console.log('--- DASHBOARD STATS ---');
        console.log(JSON.stringify(stats, null, 2));

        console.log('--- DB COUNTS ---');
        console.log('Users:', await User.countDocuments());
        console.log('Products:', await Product.countDocuments());
        console.log('Orders:', await Order.countDocuments());

    } catch (error) {
        console.error('ERROR in debug script:', error);
    } finally {
        await mongoose.disconnect();
        await disconnectRedis();
        process.exit(0);
    }
};

debugDashboard();
