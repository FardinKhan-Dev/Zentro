# Zentro - E-Commerce Platform

A modern, scalable e-commerce platform built with React (Vite), Node.js, MongoDB, Redis, and Docker. Designed to handle high-concurrency scenarios with real-time updates and async job processing.

## Architecture Overview

### The Three-Service Architecture

1. **API Service** (`server.js`) - Handles HTTP requests and WebSocket connections
2. **Worker Service** (`worker.js`) - Processes background jobs (emails, analytics)
3. **Client Service** - Serves React frontend with Nginx

### Technology Stack

**Frontend:**
- React + Vite
- Redux Toolkit with RTK Query
- Socket.IO client for real-time updates
- Service Workers for push notifications

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- Redis (Caching, Pub/Sub, Queues)
- BullMQ for job queuing
- Socket.IO for real-time communication
- Stripe for payment processing
- Cloudinary for image uploads
- OpenAI for product descriptions

**Infrastructure:**
- Docker & Docker Compose
- Nginx reverse proxy
- Redis Adapter for Socket.IO scaling

## Project Structure

```
Zentro/
├── client/                    # React frontend
│   ├── src/
│   │   ├── app/              # Redux store & RTK Query setup
│   │   ├── features/         # Feature-based slices & components
│   │   ├── components/       # Shared UI components
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   └── utils/            # Utilities & helpers
│   ├── public/               # Static assets & Service Worker
│   ├── Dockerfile            # Multi-stage build
│   └── nginx.conf            # Production config
│
└── server/                    # Node.js backend
    ├── src/
    │   ├── config/           # DB, Redis, Cloudinary, Stripe
    │   ├── models/           # Mongoose schemas
    │   ├── controllers/      # Request handlers
    │   ├── middleware/       # Express middleware
    │   ├── routes/           # API routes
    │   ├── services/         # Business logic
    │   ├── jobs/             # BullMQ workers & queues
    │   ├── websocket/        # Socket.IO setup & events
    │   └── utils/            # Helpers & error handling
    ├── server.js             # Express + Socket.IO entry
    └── worker.js             # BullMQ worker entry
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB (local or Atlas)
- Redis (local or elasticache)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   # Install root dependencies if any
   cd server && npm install
   cd ../client && npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - Redis Commander (optional): http://localhost:8081

### Key Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection URL
- `JWT_SECRET` - JWT signing key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `CLOUDINARY_*` - Cloudinary credentials
- `GOOGLE_CLIENT_ID/SECRET` - Google OAuth
- `OPENAI_API_KEY` - OpenAI API key

## Development Workflow

### API Development

```bash
# Terminal 1: API Service
cd server
npm run dev

# Terminal 2: Worker Service
npm run worker:dev

# Terminal 3: Client Service
cd client
npm run dev
```

### Key Features

#### Authentication
- JWT + HttpOnly Cookies
- Google OAuth integration
- Redis session store
- Rate limiting per IP

#### Products
- CRUD operations with Cloudinary image upload
- Redis caching for product lists
- Advanced filtering & search
- Category-based navigation

#### Shopping Cart
- Redis-backed cart persistence
- Real-time sync across tabs
- Inventory checks

#### Checkout & Payments
- Stripe payment integration
- Order creation & tracking
- Concurrency control (inventory locking)
- Email notifications via BullMQ

#### Real-time Features
- Socket.IO with Redis adapter
- Live product updates
- Order status notifications
- Multi-instance communication

#### Background Jobs
- Email sending (BullMQ)
- Analytics generation
- Scheduled tasks

## Docker Compose Services

```yaml
api-service:     # Port 5000 (HTTP + WebSocket)
worker-service:  # Background job processor
client-service:  # Port 3000 (Nginx)
redis:           # Port 6379
mongo:           # Port 27017
```

## Testing

```bash
# Run tests
npm test

# Coverage
npm run test:coverage
```

## Deployment

### Production Build

1. **Docker build:**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

2. **Environment:**
   - Set `NODE_ENV=production`
   - Configure proper credentials
   - Enable SSL/TLS with reverse proxy

3. **Scaling:**
   - Multiple API containers (load balanced)
   - Redis Adapter ensures Socket.IO works across containers
   - Worker containers scale horizontally

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/logout` - Logout

### Product Endpoints
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Order Endpoints
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details

### Cart Endpoints (Redis-backed)
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:itemId` - Remove from cart

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue on GitHub.

## Production SMTP & Email Deliverability

When you run Zentro in production you must provide real SMTP credentials and follow deliverability best practices.

Environment variables (examples):
- `SMTP_HOST` or `EMAIL_HOST` – SMTP server hostname (e.g. `smtp.sendgrid.net`)
- `SMTP_PORT` or `EMAIL_PORT` – SMTP port (587 for TLS, 465 for SSL)
- `SMTP_USER` or `EMAIL_USER` – SMTP username
- `SMTP_PASS` or `EMAIL_PASSWORD` – SMTP password / API key
- `EMAIL_FROM` – From address (e.g. `Zentro <no-reply@yourdomain.com>`)
- `EMAIL_SECURE` – `true` for port 465, otherwise `false`
- `EMAIL_TEST_TO` – test recipient used by CI validation

Checklist before going live:
- Use a dedicated sending domain or subdomain (e.g. `mail.yourdomain.com`).
- Add SPF and DKIM records for the sending domain.
- Configure a DMARC policy (start with `p=none` and monitor reports).
- Use verified SMTP providers (SendGrid, Mailgun, SES, Postmark) for higher deliverability.
- Warm up your IP or sending domain gradually if sending bulk email.
- Keep unsubscribe and spam complaint handling in place.
- Monitor deliverability and complaint rates.

GitHub Actions SMTP validation
- Add the following repository secrets: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.
- The repository contains a workflow at `.github/workflows/smtp-validate.yml` which runs `server/scripts/send_test_email.js` to verify connectivity and credentials. Use `Actions -> Run workflow` to test after adding secrets.

Local testing
- Copy `.env.example` to `.env` and set SMTP variables.
- You can run the small test script locally in `server`:

```bash
cd server
npm ci
npm run send:test-email
```

Email deliverability tips
- Prefer transactional-email providers (SES, Postmark, SendGrid) over raw SMTP for reliability.
- Use short links, avoid URL shorteners, and keep HTML emails lightweight.
- Authenticate and verify your sending domain (SPF/DKIM); misconfigured DNS is the most common cause of failures.
- Monitor bounces and suppress hard-bounced addresses.

