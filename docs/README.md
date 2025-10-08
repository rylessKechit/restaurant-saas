# 🍕 Restaurant SaaS - UAE Multi-tenant Ordering Platform

> Multi-tenant SaaS for restaurant online ordering (pickup & delivery) targeting UAE market. Built with Next.js, Express, MongoDB, Stripe, and WhatsApp integration.

## 🎯 Project Overview

**Target Market:** UAE Restaurants  
**Core Features:** Online ordering, WhatsApp notifications, multi-tenant architecture  
**Business Model:** SaaS subscription ($29/month per restaurant)

### Key Features

- 🏪 **Multi-tenant** - Subdomain per restaurant
- 📱 **WhatsApp Integration** - Automated order notifications
- 🗺️ **Google Maps** - Delivery zones, distance calculation, ETA
- 💳 **Stripe Payments** - Subscriptions + order checkout
- 🛒 **Complete Ordering** - Pickup & delivery with real-time tracking
- 👥 **Role-based Access** - Super admin, restaurant admin, staff, customers

## 🏗️ Architecture

### Frontend (Vercel)

```
Next.js 14 + TypeScript + Tailwind + shadcn/ui
├── Marketing site (landing, pricing)
├── Restaurant storefronts (subdomain routing)
├── Admin dashboard (restaurant management)
└── Super admin panel (platform management)
```

### Backend (Render)

```
Express + Node.js + Puppeteer + WhatsApp-web.js
├── WhatsApp service (notifications)
├── Email service (Nodemailer)
├── Webhooks (Stripe, order status)
└── API endpoints (secure HMAC)
```

### Database & Services

- **Database:** MongoDB Atlas (multi-tenant via tenantId)
- **Auth:** NextAuth.js (email magic links)
- **Payments:** Stripe (checkout + subscriptions)
- **Storage:** Cloudinary (images)
- **Maps:** Google Maps API
- **Communication:** HTTP webhooks (no Redis)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Stripe account (test mode)
- Google Maps API key
- Cloudinary account

### Installation

```bash
# Clone repository
git clone <repository-url>
cd restaurant-saas

# Install dependencies
npm install

# Setup environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/worker/.env.example apps/worker/.env

# Configure your environment variables (see .env.example files)
```

### Development

```bash
# Start frontend (Next.js)
cd apps/web
npm run dev
# → http://localhost:3000

# Start backend worker (Express)
cd apps/worker
npm run dev
# → http://localhost:8000
```

### First Setup

1. Create MongoDB Atlas cluster and get connection string
2. Setup Stripe webhook endpoint: `https://your-worker-url/webhooks/stripe`
3. Configure Google Maps API with required services
4. Setup Cloudinary for image uploads
5. Configure email SMTP (Gmail or custom)

## 📁 Project Structure

```
restaurant-saas/
├── apps/
│   ├── web/                     # Next.js frontend (Vercel)
│   │   ├── app/
│   │   │   ├── (marketing)/     # Landing pages
│   │   │   ├── (auth)/          # Auth pages
│   │   │   ├── admin/           # Restaurant dashboard
│   │   │   ├── super-admin/     # Platform admin
│   │   │   └── api/             # API routes
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   └── worker/                  # Express backend (Render)
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── models/
│       │   ├── middleware/
│       │   ├── routes/
│       │   └── server.js
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── shared/                  # Shared utilities & types
│   └── database/                # Mongoose schemas
│
└── docs/                        # Documentation
```

## 🔧 Environment Variables

### Frontend (.env.local)

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
MONGODB_URI=mongodb+srv://...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_MAPS_API_KEY=AIza...
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-secret
WORKER_URL=http://localhost:8000
WORKER_API_KEY=your-hmac-key
```

### Backend (.env)

```bash
MONGODB_URI=mongodb+srv://...
PORT=8000
WORKER_API_KEY=your-hmac-key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=development
```

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Connect your repo to Vercel
# Set environment variables in Vercel dashboard
# Deploy automatically on git push
```

### Backend (Render)

```bash
# Connect your repo to Render
# Service type: Web Service
# Build command: npm install
# Start command: npm start
# Auto-deploy from main branch
```

### Database (MongoDB Atlas)

```bash
# Create cluster
# Setup network access (0.0.0.0/0 for development)
# Create database user
# Get connection string
```

## 🧪 Testing

```bash
# Run frontend tests
cd apps/web
npm test

# Run backend tests
cd apps/worker
npm test

# Run e2e tests
npm run test:e2e
```

## 📊 Core Business Flow

1. **Restaurant Signup**

   - Visit pricing page → Stripe Checkout
   - Webhook creates tenant in MongoDB
   - Redirect to onboarding flow

2. **Restaurant Setup**

   - Complete restaurant info & address
   - Setup delivery zones & pricing
   - Upload menu & images
   - Configure branding

3. **Customer Orders**

   - Browse restaurant storefront (subdomain)
   - Add items to cart → checkout
   - Stripe payment → order created
   - WhatsApp + email notifications sent

4. **Order Fulfillment**
   - Restaurant receives order notification
   - Update status in admin dashboard
   - Customer receives status updates via WhatsApp
   - Order completed

## 🔐 Security

- **Authentication:** NextAuth.js with JWT
- **Authorization:** Role-based access control (RBAC)
- **API Security:** HMAC signatures between services
- **Data Isolation:** Multi-tenant via tenantId filtering
- **Payments:** Stripe webhooks with signature verification
- **CORS:** Restrictive CORS policy
- **Rate Limiting:** API endpoints protected

## 💰 Cost Structure

### Fixed Costs (Monthly)

- Vercel Pro: $20
- Render (512MB): $7
- MongoDB Atlas: $0 (free tier)
- Cloudinary: $0 (free tier)
- Google Maps: $0 (free $200 credit)
- **Total: ~$27/month**

### Variable Costs

- Stripe: 2.9% per transaction
- Google Maps: After $200 credit
- Email: Free (Gmail SMTP)

## 📈 Roadmap

### ✅ MVP (Months 1-4)

- Multi-tenant architecture
- Basic ordering (pickup/delivery)
- Stripe subscriptions
- WhatsApp notifications
- Admin dashboard

### 🔄 Phase 2 (Months 5-6)

- Product options/variants
- Advanced analytics
- Customer CRM
- Mobile optimizations

### 🚀 Phase 3 (Months 7-8)

- Loyalty program
- Advanced promotions
- Multi-language (Arabic/French)
- Third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Documentation:** [docs/](./docs/)
- **Issues:** GitHub Issues
- **Email:** support@restaurant-saas.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for UAE restaurant owners**
