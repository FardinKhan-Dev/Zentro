# CI/CD & Testing Guide

## JWT Secret Configuration

### Local Development
When running tests locally, JWT secrets are injected with fallback values in `server/tests/auth.test.js`:
- `JWT_SECRET`: `'test-secret-key-min-32-chars-long-'`
- `JWT_REFRESH_SECRET`: `'test-refresh-secret-key-min-32-chars-'`

You can override these by setting environment variables before running tests:
```bash
cd server
export JWT_SECRET="your-production-secret-min-32-chars"
export JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
npm test
```

### GitHub Actions CI/CD
The CI workflow (`.github/workflows/test.yml`) injects JWT secrets via:
1. **GitHub Repository Secrets** (recommended for production):
   - `JWT_SECRET`: Set in Settings → Secrets and variables → Actions
   - `JWT_REFRESH_SECRET`: Set in Settings → Secrets and variables → Actions

2. **Fallback values** (for public repos):
   - If secrets are not set, CI will use default test values to prevent test failures.

#### Setting Up Repository Secrets
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add `JWT_SECRET` with a strong, random value (min 32 characters)
4. Add `JWT_REFRESH_SECRET` with a strong, random value (min 32 characters)

#### Running CI Locally
To test the CI pipeline locally, use `act`:
```bash
# Install act: https://github.com/nektos/act
act -j test --secret JWT_SECRET="your-test-secret-32-chars" --secret JWT_REFRESH_SECRET="your-refresh-test-32-chars"
```

## Running Tests Locally

### Prerequisites
- Node.js 18+ installed
- npm dependencies installed

### Run All Tests
```bash
cd server
npm test
```

### Run Tests with Environment Secrets
```bash
cd server
export NODE_ENV=test
export JWT_SECRET="your-secret-min-32-chars"
export JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
npm test
```

### Run Specific Test File
```bash
cd server
npm test -- tests/auth.test.js
```

### Run Tests in Watch Mode
```bash
cd server
npm test -- --watch
```

### Run Queue Integration Tests
```bash
cd server
npm test -- tests/queue.integration.test.js
```

**Note**: Queue integration tests require Redis to be running. In CI, Redis is automatically started as a service.

## Test Coverage

Current tests cover:
- ✅ User registration with auto-verification in test mode
- ✅ Login with valid credentials
- ✅ Password reset flow (token generation & reset)
- ✅ Token refresh (access token refresh via cookie)
- ✅ Logout (cookie clearing & token invalidation)
- ✅ Password change (token invalidation on change)
- ✅ Token refresh edge cases (missing, invalid, version mismatch)
- ✅ Google OAuth redirect handler (mocked)
- ✅ Product CRUD operations
- ✅ Queue integration (email & analytics queues)
- ✅ Queue job submission and priority handling
- ✅ Queue statistics and monitoring

## Queue Integration Tests

The queue integration tests (`tests/queue.integration.test.js`) validate:

### Email Queue Tests
- Job submission for welcome, verification, and password reset emails
- Order confirmation email jobs (with higher priority)
- Timestamp inclusion in job data
- Retry configuration (3 attempts with exponential backoff)
- Priority handling (order confirmations = 1, others = 5)

### Analytics Queue Tests  
- Job submission for analytics processing
- Retry configuration (2 attempts with exponential backoff)
- Job data integrity

### Queue Statistics Tests
- Queue stat retrieval (waiting, active, completed, failed counts)
- Statistics for both email and analytics queues

### Job Processing Tests
- Priority-based job ordering
- Job data integrity throughout lifecycle
- Error handling and graceful failures

**Running in CI:**
- Redis service is automatically started
- Queue tests run after unit tests
- Tests use `--detectOpenHandles` and `--runInBand` flags

## Design Decisions

### Why Inject Secrets in Tests?
- **Parity with CI**: Both local and CI environments use the same secret injection mechanism.
- **No Code Fallbacks**: Removed test-only fallbacks from source code to keep production and test codepaths consistent.
- **Security**: Prevents hardcoded secrets in source code; CI secrets are managed separately in GitHub.

### Email Service in Tests
- Email sending is stubbed when the transporter is not initialized.
- Allows testing password-reset and verification flows without SMTP setup.
- Production email service initializes normally with `initializeEmailService()` when `NODE_ENV !== 'test'`.

### Queue Service in Tests
- Queues use lazy initialization to prevent Redis connection errors during module loading.
- Unit tests don't require Redis; integration tests do.
- Worker processes are not started in test mode.

### Passport Strategy in Tests
- GoogleStrategy is skipped during test mode (guarded by `NODE_ENV !== 'test'`).
- Tests for the redirect handler use a direct controller invocation with mocked req/res.
- Full OAuth e2e testing can be added with a test-friendly Passport strategy if needed.

## Future Enhancements

- Add rate-limiting behavior tests
- Implement Google OAuth full e2e with test strategy
- Add refresh-token reuse detection with persistent token identifiers
- Expand test coverage to Stripe integration
- Add worker process integration tests
- Add queue resilience tests (Redis failures, job timeouts)

