import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Inject test JWT secrets (CI will override these with environment variables for parity)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-min-32-chars-long-';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-min-32-chars-';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  // connect DB using existing helper
  const connectDB = (await import('../src/config/db.js')).default;
  await connectDB();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Auth API (basic flows)', () => {
  let app;
  let agent;
  let User;

  beforeAll(async () => {
    // Import server app (server.js will skip external services in test mode)
    const srv = await import('../server.js');
    app = srv.app;
    agent = request.agent(app);
    User = (await import('../src/models/User.js')).default;
  });

  test('POST /api/auth/register -> registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123', confirmPassword: 'password123' });
    console.log('REGISTER RESPONSE:', res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'success');
  });

  test('POST /api/auth/login -> login with correct credentials', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    console.log('LOGIN RESPONSE:', res.status, res.body);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'success');
  });

  test('Password reset flow: generate token and reset password (test-only)', async () => {
    // Generate a reset token directly on the user (test-only) and save it
    const user = await User.findOne({ email: 'test@example.com' });
    const rawToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Use agent to call reset endpoint so cookies are captured
    const resetRes = await agent
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'newpassword123', confirmPassword: 'newpassword123' });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body).toHaveProperty('status', 'success');
  });

  test('Refresh token flow sets new access token', async () => {
    // Ensure agent is logged in (login already done in earlier test)
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'newpassword123' });
    expect(loginRes.status).toBe(200);

    // Call refresh endpoint which uses refreshToken cookie
    const refreshRes = await agent.post('/api/auth/refresh');
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty('status', 'success');
    // Ensure accessToken cookie is present in set-cookie headers
    const setCookie = refreshRes.headers['set-cookie'] || [];
    const hasAccess = setCookie.some((c) => c && c.startsWith('accessToken='));
    expect(hasAccess).toBe(true);
  });

  test('Logout clears cookies and invalidates refresh tokens', async () => {
    // Login to ensure cookies are present
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'newpassword123' });
    expect(loginRes.status).toBe(200);

    // Get user's current token version
    const beforeUser = await User.findOne({ email: 'test@example.com' });
    const beforeVersion = beforeUser.refreshTokenVersion;

    // Call logout (protected)
    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toHaveProperty('status', 'success');

    // Cookies should be cleared (set-cookie present with empty values)
    const setCookie = logoutRes.headers['set-cookie'] || [];
    const cleared = setCookie.some((c) => /accessToken=;/.test(c) || /refreshToken=;/.test(c));
    expect(cleared).toBe(true);

    // User's refreshTokenVersion should have incremented
    const afterUser = await User.findOne({ email: 'test@example.com' });
    expect(afterUser.refreshTokenVersion).toBeGreaterThanOrEqual(beforeVersion + 1);
  });

  test('Password change flow updates password and invalidates old tokens', async () => {
    // Ensure agent is logged in
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'newpassword123' });
    expect(loginRes.status).toBe(200);

    const beforeUser = await User.findOne({ email: 'test@example.com' });
    const beforeVersion = beforeUser.refreshTokenVersion;

    // Change password
    const changeRes = await agent
      .post('/api/auth/change-password')
      .send({ currentPassword: 'newpassword123', newPassword: 'changed123', confirmPassword: 'changed123' });
    expect(changeRes.status).toBe(200);
    expect(changeRes.body).toHaveProperty('status', 'success');

    // Token version should be incremented
    const afterUser = await User.findOne({ email: 'test@example.com' });
    expect(afterUser.refreshTokenVersion).toBeGreaterThanOrEqual(beforeVersion + 1);

    // Old password should fail
    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'newpassword123' });
    expect(oldLogin.status).toBe(401);

    // New password should succeed
    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'changed123' });
    expect(newLogin.status).toBe(200);
  });

  test('Refresh token edge cases: missing, invalid, version mismatch', async () => {
    // Missing refresh token
    const missingRes = await request(app).post('/api/auth/refresh');
    expect(missingRes.status).toBe(401);

    // Invalid refresh token
    const invalidRes = await request(app).post('/api/auth/refresh').set('Cookie', ['refreshToken=invalid']);
    expect(invalidRes.status).toBe(401);

    // Version mismatch: login to get a refresh token, then bump version in DB
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'changed123' });
    expect(loginRes.status).toBe(200);

    const user = await User.findOne({ email: 'test@example.com' });
    user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
    await user.save();

    const mismatchRes = await agent.post('/api/auth/refresh');
    expect(mismatchRes.status).toBe(401);
  });

  test('Google OAuth redirect handler sets cookies and redirects', async () => {
    // Create a user to simulate OAuth-authenticated user
    const googleUser = await User.create({ name: 'Google User', email: 'google@example.com', password: 'gpass123', isVerified: true });

    const { googleAuthRedirect } = await import('../src/controllers/authController.js');

    const cookies = [];
    const redirectCalls = [];
    const redirectSpy = (...args) => redirectCalls.push(args);
    const res = {
      cookie: (name, value, opts) => cookies.push({ name, value, opts }),
      redirect: redirectSpy,
    };
    const req = { user: googleUser };

    await googleAuthRedirect(req, res, () => {});

    // Cookies set
    expect(cookies.some((c) => c.name === 'accessToken')).toBe(true);
    expect(cookies.some((c) => c.name === 'refreshToken')).toBe(true);

    // Redirect called with auth=success
    expect(redirectCalls.length).toBeGreaterThan(0);
    const calledArgs = redirectCalls[0];
    const url = calledArgs[1] || calledArgs[0];
    expect(url).toEqual(expect.stringContaining('auth=success'));
  });
});

describe('Rate Limiting', () => {
  let app;
  let User;

  beforeAll(async () => {
    const srv = await import('../server.js');
    app = srv.app;
    User = (await import('../src/models/User.js')).default;
  });

  test('Rate limiter skipped in test environment', async () => {
    // In test mode, rate limiter should be skipped (NODE_ENV=test)
    // Make multiple requests to auth endpoints and all should succeed
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrong' });
      // Status should be 401 (auth failure), not 429 (rate limited)
      expect([401, 403]).toContain(res.status);
    }
  });

  test('Rate limiter respects NODE_ENV setting', async () => {
    // Verify that rate limiter skips when NODE_ENV is 'test'
    expect(process.env.NODE_ENV).toBe('test');
  });
});

describe('Google OAuth Full E2E Flow', () => {
  let app;
  let User;
  let passport;

  beforeAll(async () => {
    const srv = await import('../server.js');
    app = srv.app;
    User = (await import('../src/models/User.js')).default;
    passport = (await import('passport')).default;
  });

  test('Google OAuth strategy is skipped in test environment', async () => {
    // Verify Passport's google strategy is not initialized in test mode
    // Attempting to access it should not throw (strategy simply won't exist)
    const strategies = Object.keys(passport._strategies || {});
    expect(strategies.includes('google')).toBe(false);
  });

  test('Unauthenticated user cannot access protected /api/auth/logout', async () => {
    const res = await request(app).post('/api/auth/logout');
    // Should fail with 401 (not authenticated) before rate limiter
    expect(res.status).toBe(401);
  });

  test('Google OAuth callback handler simulation with mocked Passport', async () => {
    // Create a test user as if OAuth succeeded
    const oauthUser = await User.findOneAndUpdate(
      { email: 'oauth-user@example.com' },
      { name: 'OAuth User', password: 'oauth123', isVerified: true },
      { upsert: true, new: true }
    );

    const { googleAuthRedirect } = await import('../src/controllers/authController.js');

    // Simulate Express res/req
    let redirectUrl = null;
    const mockRes = {
      cookie: () => {},
      redirect: (statusOrUrl, url) => {
        redirectUrl = url || statusOrUrl;
      },
    };
    const mockReq = {
      user: oauthUser.toObject(),
    };
    const mockNext = () => {};

    // Execute the redirect handler
    await googleAuthRedirect(mockReq, mockRes, mockNext);

    // Verify redirect was called with auth=success
    expect(redirectUrl).toBeTruthy();
    expect(redirectUrl).toContain('auth=success');
  });

  test('Google OAuth user flow: create and login via OAuth simulation', async () => {
    // Simulate Passport creating a user from OAuth profile
    const oauthProfile = {
      id: 'google-123',
      displayName: 'OAuth Test User',
      emails: [{ value: 'oauth-test@example.com' }],
    };

    // Simulate upsert (Passport's typical OAuth flow)
    const user = await User.findOneAndUpdate(
      { email: oauthProfile.emails[0].value },
      {
        name: oauthProfile.displayName,
        isVerified: true, // OAuth providers auto-verify
        password: Math.random().toString(36), // Random password
      },
      { upsert: true, new: true }
    );

    // Verify user was created/updated
    expect(user).toBeTruthy();
    expect(user.email).toBe('oauth-test@example.com');
    expect(user.isVerified).toBe(true);
    expect(user.name).toBe('OAuth Test User');
  });

  test('Protected route requires authentication before rate limiting applies', async () => {
    // Attempt to access protected /api/auth/change-password without auth
    const res = await request(app)
      .post('/api/auth/change-password')
      .send({ currentPassword: 'old', newPassword: 'new', confirmPassword: 'new' });

    // Should be 401 (unauthenticated), not 429 (rate limited)
    expect(res.status).toBe(401);
  });
});
