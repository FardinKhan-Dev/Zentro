import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Ensure JWT test secrets are set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-min-32-chars-long-';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-min-32-chars-';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  const connectDB = (await import('../src/config/db.js')).default;
  await connectDB();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Product API', () => {
  let app;
  let agent;
  let Product;

  beforeAll(async () => {
    // Server import will pick up the test stub in `src/config/cloudinary.js`
    const srv = await import('../server.js');
    app = srv.app;
    agent = request.agent(app);
    Product = (await import('../src/models/Product.js')).default;
  });

  test('Unauthenticated create should be blocked', async () => {
    const res = await request(app)
      .post('/api/products')
      .field('name', 'Unauth Product')
      .field('price', '9.99');

    expect(res.status).toBe(401);
  });

  test('Create, list, get, update, delete product (with image uploads)', async () => {
    // Register + login a user to get auth cookies
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Prod Tester', email: 'prod@test.com', password: 'password123', confirmPassword: 'password123' });

    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: 'prod@test.com', password: 'password123' });
    expect(loginRes.status).toBe(200);

    // Create product with a dummy image buffer
    const createRes = await agent
      .post('/api/products')
      .field('name', 'Test Product')
      .field('price', '19.99')
      .attach('files', Buffer.from([0xff, 0xd8, 0xff]), 'img.jpg');

    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty('data');
    const created = createRes.body.data;
    expect(created).toHaveProperty('_id');
    expect(Array.isArray(created.images)).toBe(true);
    expect(created.images.length).toBeGreaterThanOrEqual(1);
    // Validate image structure
    const img0 = created.images[0];
    expect(typeof img0.url).toBe('string');
    expect(img0.url).toMatch(/^https?:\/\//);
    expect(typeof img0.public_id).toBe('string');
    expect(img0.public_id.length).toBeGreaterThan(0);

    // List products
    const listRes = await request(app).get('/api/products');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.meta).toBeTruthy();

    // Get product by id
    const getRes = await request(app).get(`/api/products/${created._id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data._id).toBe(created._id);

    // Update: append another image and change name
    const updateRes = await agent
      .put(`/api/products/${created._id}`)
      .field('name', 'Updated Product')
      .attach('files', Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'img2.png');

    expect(updateRes.status).toBe(200);
    const updated = updateRes.body.data;
    expect(updated.name).toBe('Updated Product');
    expect(updated.images.length).toBeGreaterThanOrEqual(created.images.length + 1);
    // Validate appended image structure
    const lastImg = updated.images[updated.images.length - 1];
    expect(lastImg).toBeTruthy();
    expect(typeof lastImg.url).toBe('string');
    expect(lastImg.url).toMatch(/^https?:\/\//);
    expect(typeof lastImg.public_id).toBe('string');
    expect(lastImg.public_id.length).toBeGreaterThan(0);

    // Delete product
    const delRes = await agent.delete(`/api/products/${created._id}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body).toHaveProperty('message', 'Product deleted');

    // Ensure it's gone
    const afterGet = await request(app).get(`/api/products/${created._id}`);
    expect(afterGet.status).toBe(404);
  });
});
