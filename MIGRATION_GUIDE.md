# Payments Infrastructure Migration Guide

This guide documents the payment infrastructure setup completed on this branch.

## What's New

### 1. Payment Processing System
- **Stripe Integration**: Full credit/debit card payment support
- **JazzCash Integration**: Pakistan mobile payment gateway
- **Easypaisa Integration**: Pakistan alternative payment gateway
- **Payment API Routes**: `/api/payments` for creating and managing payments
- **Webhook Handlers**: Stripe webhook endpoint at `/api/payments/webhook/stripe`

### 2. Subscription Management
- **Database Models**: Subscription, PlanTierConfig, and Payment tables
- **Subscription API**: `/api/subscriptions` for subscription CRUD operations
- **Dashboard Pages**: 
  - `/dashboard/subscription` - User subscription management
  - `/admin/payments` - Admin payment tracking and analytics

### 3. Cron Job Scheduler
- **Subscription Reminders**: Daily job sends emails 7 days before expiry
- **Subscription Expiry**: Daily job marks expired subscriptions and downgrades users
- **Test Endpoints**: `/api/cron/test/*` for testing cron jobs

### 4. Email Notifications
- **Subscription Reminders**: HTML emails for renewal notifications
- **Professional Templates**: Email templates with styling
- **Resend Integration**: Support for Resend email service
- **Nodemailer**: SMTP support for any email provider

### 5. Configuration Files
- `.env.example` - Environment variable template
- `.env` - Development environment setup
- `PAYMENTS_SETUP.md` - Complete setup documentation
- `lib/payment.ts` - Payment service configuration
- `lib/cron.ts` - Cron job scheduler
- `lib/validations.ts` - Zod validation schemas

## Files Modified

### New Files Created
```
lib/payment.ts                          # Payment gateway configuration
lib/cron.ts                            # Cron job scheduler
lib/validations.ts                     # Validation schemas
app/api/payments/route.ts              # Payment CRUD endpoints
app/api/payments/webhook/stripe/route.ts  # Stripe webhook handler
app/api/subscriptions/route.ts         # Subscription endpoints
app/api/cron/test/subscription-reminder/route.ts  # Test endpoints
app/api/cron/test/subscription-expiry/route.ts    # Test endpoints
app/dashboard/subscription/page.tsx    # Subscription management UI
app/admin/payments/page.tsx            # Admin payment dashboard
PAYMENTS_SETUP.md                      # Setup documentation
MIGRATION_GUIDE.md                     # This file
.env.example                           # Environment template
.env                                   # Development configuration
```

### Modified Files
```
app/page.tsx                # Added try-catch for featured listings
app/blog/page.tsx          # Added try-catch for blog posts
app/properties/page.tsx    # Added try-catch for property search
app/sitemap.ts             # Added try-catch for sitemap generation
app/dashboard/page.tsx     # Added subscription status card
lib/auth.ts               # Fixed NextAuth configuration
lib/email.ts              # Added subscription reminder email function
package.json              # Added dependencies (stripe, node-cron, axios, zod, nodemailer)
```

## Dependencies Added

```json
{
  "stripe": "^20.0.0",
  "node-cron": "^4.2.1",
  "axios": "^1.13.2",
  "zod": "^4.2.0",
  "nodemailer": "^6.9.7",
  "@types/node-cron": "[latest]",
  "next-auth": "^4.x",
  "@next-auth/prisma-adapter": "^1.x"
}
```

## Database Schema Changes

### New Tables
- **Payment**: Payment transaction records
- **Subscription**: User subscription records
- **PlanTierConfig**: Plan tier configurations
- All payment-related fields in User model

### Enum Additions
- `PaymentStatus`: PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED
- `PlanTier`: FREE, STARTER, PROFESSIONAL, PREMIUM
- `VerificationType`: EMAIL, PHONE, IDENTITY, BANK_ACCOUNT, PROPERTY_DOCUMENT

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### Step 3: Run Migrations
```bash
npm run prisma:migrate
```

### Step 4: Seed Database
```bash
npm run prisma:db:seed
```

This creates:
- **Subscription Plans**: Free, Starter, Professional, Premium
- **Demo Users**: Admin, 2 Agents, 2 Buyers
- **Sample Listings**: For testing search and filtering
- **Amenities**: Property amenities catalog
- **Cities**: Sample cities for listings

### Step 5: Configure Payment Gateways
Follow the detailed instructions in `PAYMENTS_SETUP.md`:
1. Stripe setup (recommended)
2. JazzCash setup (Pakistan)
3. Easypaisa setup (Pakistan)
4. Email service (Resend or SMTP)
5. SMS service (Twilio or Jazz SMS)

### Step 6: Start Development
```bash
npm run dev
```

## Testing Payment Flows

### Test Stripe Payment
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "amount": 79.99,
    "currency": "USD",
    "paymentMethod": "stripe"
  }'
```

### Test Stripe Test Cards
- **Successful**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Expired**: 4000 0025 0000 3155

### Test Cron Jobs
```bash
# Check expiring subscriptions
npm run cron:test:expiry

# Send reminder email
curl "http://localhost:3000/api/cron/test/subscription-reminder?userId=<user-id>"
```

## API Endpoints

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments?userId=<id>` - Get user payments
- `POST /api/payments/webhook/stripe` - Stripe webhook

### Subscriptions
- `POST /api/subscriptions` - Create/upgrade subscription
- `GET /api/subscriptions?userId=<id>` - Get user subscription

### Cron Testing
- `GET /api/cron/test/subscription-expiry` - Test expiry check
- `POST /api/cron/test/subscription-expiry` - Trigger expiry check
- `GET/POST /api/cron/test/subscription-reminder?userId=<id>` - Test reminder

## Dashboard Features

### User Dashboard
- **Subscription Status**: Shows current plan and expiry
- **Plan Comparison**: Compare all available plans
- **Billing History**: View past invoices and payments
- **Quick Actions**: Renew subscription, downgrade plan

### Admin Dashboard
- **Payment Analytics**: Total revenue, success rate
- **Recent Payments**: List of all payments with status
- **Payment Filtering**: Search by user, amount, status
- **Refund Management**: Process refunds

## Cron Jobs

### Subscription Reminder (Daily 9:00 AM UTC)
- Finds subscriptions expiring in 7 days
- Sends reminder emails to users
- Encourages subscription renewal

### Subscription Expiry (Daily 12:00 AM UTC)
- Marks expired subscriptions as "expired"
- Downgrades users to FREE plan
- Clears premium features access

## Security Considerations

1. **API Keys**: All keys stored in `.env` (ignored by git)
2. **Webhooks**: Signed with merchant secret (Stripe, JazzCash, Easypaisa)
3. **Database**: All queries use Prisma (prevents SQL injection)
4. **Validation**: Zod schemas validate all inputs
5. **Authentication**: NextAuth protects user endpoints

## Environment Setup

### Development
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/db
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod.db.host:5432/db
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
SSL_CERT=/path/to/cert
SSL_KEY=/path/to/key
```

## Troubleshooting

### Build Errors
- Ensure `DATABASE_URL` is set
- Check that all env variables match `.env.example`
- Run `npm install` to install missing dependencies

### Payment Not Processing
- Check Stripe API keys are correct
- Verify webhook endpoint is publicly accessible
- Check payment status in `/admin/payments`

### Cron Jobs Not Running
- Ensure `NODE_ENV=production` for cron jobs to run
- Check server logs for cron job errors
- Use test endpoints to debug

### Database Connection
- Verify PostgreSQL is running
- Check DATABASE_URL connection string
- Run migrations: `npm run prisma:migrate`

## Next Steps

1. ✅ Configure payment gateway credentials
2. ✅ Test payment flows with test cards
3. ✅ Configure email service
4. ✅ Test subscription reminders
5. ⏭️ Set up SSL certificates (production)
6. ⏭️ Deploy to production servers
7. ⏭️ Switch to production API keys
8. ⏭️ Configure payment failure notifications
9. ⏭️ Set up payment reporting/analytics
10. ⏭️ Test full subscription lifecycle

## Support

For issues or questions:
- Check `PAYMENTS_SETUP.md` for detailed setup instructions
- Review `lib/payment.ts` for payment gateway configuration
- Check `lib/cron.ts` for cron job implementation
- Refer to API endpoint documentation

---

**Branch**: `configure-payments-infra`
**Last Updated**: December 2024
