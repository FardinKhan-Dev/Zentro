/**
/**
 * Phase 5 Commerce Flow Integration Tests
 * Tests the complete e-commerce flow from cart to order completion
 */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Cart from '../src/models/Cart.js';
import Order from '../src/models/Order.js';
import { getRedisClient } from '../src/config/redis.js';
import { deductStockForOrder } from '../src/services/inventoryService.js';

describe('Phase 5: Complete Commerce Flow Integration Tests', () => {
    let authToken;
    let userId;
    let testProduct;
    let testCart;

    beforeAll(async () => {
        // Clear test data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});
        await Order.deleteMany({});

        // Create test user
        const userRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Commerce Test User',
                email: 'commerce@test.com',
                password: 'Test123!@#',
            });

        authToken = userRes.body.data.accessToken;
        userId = userRes.body.data.user.id;

        // Create test product with stock
        testProduct = await Product.create({
            name: 'Test Product for Commerce',
            description: 'Test product with stock',
            price: 99.99,
            stock: 100,
            reservedStock: 0,
            category: 'test',
            images: [{ url: 'http://example.com/image.jpg', public_id: 'test_img' }],
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Cart.deleteMany({});
        await Order.deleteMany({});
        await mongoose.connection.close();

        const redis = getRedisClient();
        if (redis) {
            await redis.quit();
        }
    });

    describe('Step 1: Cart Operations', () => {
        it('should create an empty cart for authenticated user', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.cart).toBeDefined();
            expect(res.body.data.cart.items).toEqual([]);
            expect(res.body.data.itemCount).toBe(0);
        });

        it('should add item to cart', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProduct._id.toString(),
                    quantity: 5,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.cart.items).toHaveLength(1);
            expect(res.body.data.cart.items[0].quantity).toBe(5);
            expect(res.body.data.cart.totalPrice).toBe(499.95); // 5 * 99.99
            expect(res.body.data.itemCount).toBe(5);
        });

        it('should update cart item quantity', async () => {
            const res = await request(app)
                .patch(`/api/cart/items/${testProduct._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ quantity: 3 });

            expect(res.status).toBe(200);
            expect(res.body.data.cart.items[0].quantity).toBe(3);
            expect(res.body.data.cart.totalPrice).toBe(299.97); // 3 * 99.99
        });

        it('should not allow adding more than available stock', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProduct._id.toString(),
                    quantity: 200, // More than stock (100)
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Only 100 items available');
        });

        it('should retrieve cart with cached data', async () => {
            const res = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.cart.items).toHaveLength(1);
            expect(res.body.data.itemCount).toBe(3);
        });
    });

    describe('Step 2: Order Creation & Stock Reservation', () => {
        let testOrder;

        it('should create order from cart and reserve stock', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    shippingAddress: {
                        street: '123 Test St',
                        city: 'Test City',
                        state: 'TS',
                        zipCode: '12345',
                        country: 'US',
                    },
                    notes: 'Test order',
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.order).toBeDefined();
            expect(res.body.data.order.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
            expect(res.body.data.order.orderStatus).toBe('pending');
            expect(res.body.data.order.paymentStatus).toBe('pending');
            expect(res.body.data.order.totalAmount).toBe(299.97);
            expect(res.body.message).toContain('Stock reserved');

            testOrder = res.body.data.order;

            // Verify stock was reserved
            const product = await Product.findById(testProduct._id);
            expect(product.reservedStock).toBe(3);
            expect(product.availableStock).toBe(97); // 100 - 3
        });

        it('should not allow creating order with insufficient stock', async () => {
            // Create another product with low stock
            const lowStockProduct = await Product.create({
                name: 'Low Stock Product',
                price: 50,
                stock: 2,
                reservedStock: 0,
            });

            // Add to cart
            await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: lowStockProduct._id.toString(),
                    quantity: 1,
                });

            // Now try to reserve more than available
            lowStockProduct.reservedStock = 2; // Simulate reservation
            await lowStockProduct.save();

            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    shippingAddress: {
                        street: '123 Test St',
                        city: 'Test City',
                        state: 'TS',
                        zipCode: '12345',
                    },
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Insufficient stock');
        });

        it('should retrieve user orders', async () => {
            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.orders).toHaveLength(1);
            expect(res.body.data.pagination).toBeDefined();
        });

        it('should retrieve specific order by ID', async () => {
            const res = await request(app)
                .get(`/api/orders/${testOrder._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.order.orderNumber).toBe(testOrder.orderNumber);
            expect(res.body.data.order.items).toHaveLength(1);
        });
    });

    describe('Step 3: Payment Processing & Stock Deduction', () => {
        let paymentIntentId;

        it('should create payment intent for order', async () => {
            // Get the first pending order
            const order = await Order.findOne({ paymentStatus: 'pending' });

            const res = await request(app)
                .post('/api/payments/create-intent')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ orderId: order._id.toString() });

            // Note: This will fail if Stripe is not configured
            // In that case, we just verify order exists
            if (res.status === 400 && res.body.message?.includes('Stripe')) {
                console.log('Skipping Stripe test - Stripe not configured');
                expect(order).toBeDefined();
                return;
            }

            expect(res.status).toBe(200);
            expect(res.body.data.clientSecret).toBeDefined();
            expect(res.body.data.amount).toBe(order.totalAmount);

            paymentIntentId = res.body.data.paymentIntentId;

            // Verify payment intent ID was saved to order
            const updatedOrder = await Order.findById(order._id);
            expect(updatedOrder.paymentIntent).toBe(paymentIntentId);
        });

        it('should simulate payment success and deduct stock', async () => {
            const order = await Order.findOne({ paymentStatus: 'pending' }).populate('user');

            if (!order) {
                console.log('No pending order found');
                return;
            }

            // Get initial stock levels
            const productBefore = await Product.findById(testProduct._id);
            const initialStock = productBefore.stock;
            const initialReserved = productBefore.reservedStock;

            // Simulate payment success by manually marking order as paid
            order.markAsPaid('test_payment_intent_123');
            await order.save();

            // Deduct stock
            await deductStockForOrder(order.items);

            // Verify order was marked as paid
            const updatedOrder = await Order.findById(order._id);
            expect(updatedOrder.paymentStatus).toBe('paid');
            expect(updatedOrder.orderStatus).toBe('processing');

            // Verify stock was deducted (reserved stock converted to actual deduction)
            const productAfter = await Product.findById(testProduct._id);
            expect(productAfter.stock).toBe(initialStock - 3); // 100 - 3 = 97
            expect(productAfter.reservedStock).toBe(0); // Reserved stock released after deduction
        });
    });

    describe('Step 4: Order Cancellation & Stock Release', () => {
        let cancelOrder;

        it('should create another order for cancellation test', async () => {
            // Reset cart
            await request(app)
                .delete('/api/cart')
                .set('Authorization', `Bearer ${authToken}`);

            // Add item to cart
            await request(app)
                .post('/api/cart/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    productId: testProduct._id.toString(),
                    quantity: 2,
                });

            // Create order
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    shippingAddress: {
                        street: '456 Cancel St',
                        city: 'Cancel City',
                        state: 'CC',
                        zipCode: '54321',
                    },
                });

            expect(res.status).toBe(201);
            cancelOrder = res.body.data.order;

            // Verify stock was reserved
            const product = await Product.findById(testProduct._id);
            expect(product.reservedStock).toBe(2);
        });

        it('should cancel unpaid order and release reserved stock', async () => {
            const productBefore = await Product.findById(testProduct._id);
            const reservedBefore = productBefore.reservedStock;

            const res = await request(app)
                .post(`/api/orders/${cancelOrder._id}/cancel`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    reason: 'Changed my mind',
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('Stock released');

            // Verify order was cancelled
            const updatedOrder = await Order.findById(cancelOrder._id);
            expect(updatedOrder.orderStatus).toBe('cancelled');

            // Verify reserved stock was released
            const productAfter = await Product.findById(testProduct._id);
            expect(productAfter.reservedStock).toBe(reservedBefore - 2);
        });

        it('should not allow cancelling already delivered order', async () => {
            const paidOrder = await Order.findOne({ paymentStatus: 'paid' });

            if (!paidOrder) {
                console.log('No paid order found for delivery test');
                return;
            }

            // Manually update to delivered status
            paidOrder.orderStatus = 'delivered';
            await paidOrder.save();

            const res = await request(app)
                .post(`/api/orders/${paidOrder._id}/cancel`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ reason: 'Test' });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('cannot be cancelled');
        });
    });

    describe('Step 5: Stock Availability Checks', () => {
        it('should correctly calculate available stock', async () => {
            const product = await Product.findById(testProduct._id);

            // Available stock = total stock - reserved stock
            const expectedAvailable = product.stock - product.reservedStock;
            expect(product.availableStock).toBe(expectedAvailable);
        });

        it('should detect low stock products', async () => {
            // Create product with low stock
            const lowStockProduct = await Product.create({
                name: 'Almost Out Product',
                price: 25,
                stock: 5,
                reservedStock: 0,
                lowStockThreshold: 10,
            });

            expect(lowStockProduct.isLowStock).toBe(true);
            expect(lowStockProduct.inStock).toBe(true);

            // Product with no stock
            const outOfStock = await Product.create({
                name: 'Out of Stock Product',
                price: 30,
                stock: 0,
                reservedStock: 0,
            });

            expect(outOfStock.inStock).toBe(false);
        });
    });

    describe('Step 6: Complete Flow Summary', () => {
        it('should verify complete commerce flow integrity', async () => {
            // Check that we have completed orders
            const completedOrders = await Order.countDocuments({ paymentStatus: 'paid' });
            expect(completedOrders).toBeGreaterThan(0);

            // Check that stock was properly managed
            const product = await Product.findById(testProduct._id);
            expect(product.stock).toBeLessThan(100); // Some stock was sold

            // Check that we have order history
            const allOrders = await Order.find({ user: userId });
            expect(allOrders.length).toBeGreaterThan(0);

            // Verify at least one order has status history
            const orderWithHistory = await Order.findOne({
                paymentStatus: 'paid',
                statusHistory: { $exists: true, $ne: [] }
            });
            expect(orderWithHistory).toBeDefined();
            expect(orderWithHistory.statusHistory.length).toBeGreaterThan(0);
        });
    });
});
