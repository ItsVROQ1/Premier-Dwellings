# Payments Infrastructure Setup Guide

This document provides step-by-step instructions for setting up the payments infrastructure for the Premium Real Estate Platform.

## Table of Contents

1. [PostgreSQL Migrations](#postgresql-migrations)
2. [Payment Gateway Credentials](#payment-gateway-credentials)
3. [Email & SMS Services](#email--sms-services)
4. [Cron Job Scheduler](#cron-job-scheduler)
5. [Testing Payment Flows](#testing-payment-flows)

## PostgreSQL Migrations

### Step 1: Initialize Database

First, ensure you have PostgreSQL installed and running. Update your `.env` file with the database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/premium_realestate"
```

### Step 2: Run Migrations

Run the Prisma migrations to create all payment-related tables:

```bash
npm run prisma:migrate
```

This command will:
- Create the `Payment` table for payment transactions
- Create the `Subscription` table for user subscriptions
- Create the `PlanTierConfig` table for plan definitions
- Set up all required indexes and relationships

### Step 3: Seed Initial Data

Seed the database with initial subscription plans:

```bash
npm run prisma:db:seed
```

This will create:
- **Free Plan**: 1 listing, basic features
- **Starter Plan**: 10 listings, basic analytics
- **Professional Plan**: 50 listings, advanced features
- **Premium Plan**: Unlimited listings, all features

### Verify Migrations

To verify that all tables were created correctly, use Prisma Studio:

```bash
npx prisma studio
```

You should see these tables:
- `Payment` - Payment transaction records
- `Subscription` - User subscription records
- `PlanTierConfig` - Plan tier configurations

## Payment Gateway Credentials

### Stripe Setup (Recommended)

Stripe handles credit/debit card payments globally.

#### 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" and create an account
3. Complete email verification
4. Provide business information

#### 2. Get API Keys

1. Go to [Dashboard](https://dashboard.stripe.com)
2. Navigate to "Developers" → "API Keys"
3. Copy test keys (for development):
   - **Publishable Key** (pk_test_...)
   - **Secret Key** (sk_test_...)

#### 3. Get Webhook Secret

1. In Developers section, go to "Webhooks"
2. Add endpoint: `https://yourapp.com/api/payments/webhook/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy the signing secret (whsec_...)

#### 4. Add to `.env`

```env
STRIPE_PUBLIC_KEY="pk_test_your_key_here"
STRIPE_SECRET_KEY="sk_test_your_key_here"
STRIPE_WEBHOOK_SECRET="whsec_test_your_secret_here"
```

### JazzCash Setup (Pakistan)

JazzCash provides mobile payment solutions for Pakistan.

#### 1. Register Account

1. Visit [https://merchant.jazzcash.com.pk](https://merchant.jazzcash.com.pk)
2. Register as a merchant
3. Complete KYC verification
4. Get approval (typically 24-48 hours)

#### 2. Get Credentials

After approval, you'll receive:
- **Merchant ID** - Your unique identifier
- **API Key** - For authentication
- **Endpoint URL** - API endpoint for transactions

#### 3. Add to `.env`

```env
JAZZCASH_API_KEY="your_jazzcash_api_key"
JAZZCASH_MERCHANT_ID="your_merchant_id"
JAZZCASH_ENDPOINT="https://sandbox.jazzcash.com.pk/ApplicationAPI/API/DoTransaction"
```

**Test Card Numbers:**
- `03005550011` (JazzCash account number format)

### Easypaisa Setup (Pakistan)

Easypaisa provides alternative mobile payment options.

#### 1. Register Account

1. Visit [https://easypaisa.com.pk/merchant](https://easypaisa.com.pk/merchant)
2. Complete merchant registration
3. Submit business documents
4. Get API credentials

#### 2. Get Credentials

After approval:
- **Merchant ID** - Your unique identifier
- **API Key** - For authentication

#### 3. Add to `.env`

```env
EASYPAISA_API_KEY="your_easypaisa_api_key"
EASYPAISA_MERCHANT_ID="your_merchant_id"
EASYPAISA_ENDPOINT="https://easypaisa.com.pk/api/"
```

## Email & SMS Services

### Resend Email Service (Recommended)

Resend provides reliable transactional email delivery.

#### 1. Create Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up with your email
3. Verify email address

#### 2. Get API Key

1. Go to [API Keys](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key

#### 3. Add to `.env`

```env
RESEND_API_KEY="re_your_api_key_here"
```

### Nodemailer/SMTP Setup (Alternative)

Use any SMTP provider (Gmail, Outlook, SendGrid, etc.)

#### Example: Gmail

1. Enable 2-Factor Authentication in Gmail account
2. Create an [App Password](https://myaccount.google.com/apppasswords)
3. Add to `.env`:

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM_ADDRESS="noreply@premiumrealestate.com"
```

#### Example: SendGrid

1. Create [SendGrid Account](https://sendgrid.com)
2. Get API Key from Settings
3. Add to `.env`:

```env
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="SG.your_api_key_here"
EMAIL_FROM_ADDRESS="noreply@premiumrealestate.com"
```

### Twilio SMS Setup

Twilio provides SMS capabilities for notifications.

#### 1. Create Account

1. Go to [https://twilio.com](https://twilio.com)
2. Sign up and verify email
3. Complete phone verification

#### 2. Get Credentials

1. Go to [Twilio Console](https://console.twilio.com)
2. Find your:
   - **Account SID**
   - **Auth Token**
   - **Phone Number** (assigned to your account)

#### 3. Add to `.env`

```env
TWILIO_ACCOUNT_SID="AC_your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### Jazz SMS Setup (Pakistan Alternative)

For SMS in Pakistan, use Jazz SMS API.

#### 1. Register

1. Contact Jazz SMS [https://jazz.com.pk](https://jazz.com.pk)
2. Apply for API access
3. Get credentials

#### 2. Add to `.env`

```env
JAZZ_SMS_API_KEY="your_api_key"
JAZZ_SMS_SENDER_ID="PremiumRealty"
```

## Cron Job Scheduler

The payment system includes automatic cron jobs for subscription management.

### Features

1. **Subscription Renewal Reminders**
   - Runs daily at 9:00 AM UTC
   - Sends email 7 days before expiry
   - Reminds users to renew their subscription

2. **Subscription Expiry Check**
   - Runs daily at 12:00 AM UTC
   - Marks expired subscriptions as "expired"
   - Downgrades users to FREE plan

### Enable Cron Jobs

In production, cron jobs run automatically. To enable in development:

```env
NODE_ENV="production"
```

### Test Cron Jobs

Create an API endpoint to test cron jobs:

```bash
# Test subscription reminder job
curl http://localhost:3000/api/cron/test/subscription-reminder?userId=<user-id>

# Test subscription expiry check
curl http://localhost:3000/api/cron/test/subscription-expiry
```

## Testing Payment Flows

### Test Stripe Payment

#### 1. Create a Test Payment

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "amount": 79.99,
    "currency": "USD",
    "description": "Professional Plan - Monthly",
    "paymentMethod": "stripe"
  }'
```

#### 2. Stripe Test Card Numbers

| Card Number | Outcome |
|-------------|---------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Expired card |
| `4000 0000 0000 0069` | CVC error |

#### 3. Verify Webhook

Stripe webhooks can be tested using the Stripe CLI:

```bash
# Login to Stripe CLI
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/payments/webhook/stripe

# Trigger a test event
stripe trigger payment_intent.succeeded
```

### Test Subscription Creation

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "planTier": "PROFESSIONAL"
  }'
```

### Test Subscription Status

```bash
curl http://localhost:3000/api/subscriptions?userId=user-123
```

### Test Email Notifications

The system will automatically send emails when:
- User subscribes to a plan
- Subscription expires in 7 days
- Payment succeeds/fails

You can also manually trigger a test:

```bash
curl -X POST http://localhost:3000/api/emails/test/subscription-reminder \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123"}'
```

## Database Schema

### Payment Table

```sql
CREATE TABLE "Payment" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  amount DECIMAL(65,30) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status "PaymentStatus" DEFAULT 'PENDING',
  paymentMethod TEXT,
  transactionId TEXT,
  description TEXT,
  metadata TEXT,
  processedAt TIMESTAMP,
  failureReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id)
);
```

### Subscription Table

```sql
CREATE TABLE "Subscription" (
  id TEXT PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  planTier "PlanTier" NOT NULL,
  status TEXT DEFAULT 'active',
  listingsUsed INT DEFAULT 0,
  listingsLimit INT NOT NULL,
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id)
);
```

### PlanTierConfig Table

```sql
CREATE TABLE "PlanTierConfig" (
  id TEXT PRIMARY KEY,
  tier "PlanTier" UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(65,30) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billingPeriod INT DEFAULT 30,
  maxListings INT DEFAULT 0,
  hasAnalytics BOOLEAN DEFAULT false,
  hasPromotion BOOLEAN DEFAULT false,
  hasPriority BOOLEAN DEFAULT false,
  features TEXT[],
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP
);
```

## API Endpoints

### Payment Endpoints

- `POST /api/payments` - Create a payment
- `GET /api/payments?userId=<id>` - Get user's payments
- `POST /api/payments/webhook/stripe` - Stripe webhook handler

### Subscription Endpoints

- `POST /api/subscriptions` - Create/update subscription
- `GET /api/subscriptions?userId=<id>` - Get user's subscription

### Dashboard Pages

- `/dashboard/subscription` - User subscription management
- `/admin/payments` - Admin payment management

## Troubleshooting

### Common Issues

**Issue: Migration fails with "unknown type" error**
- Solution: Ensure PostgreSQL is properly installed and DATABASE_URL is correct

**Issue: Stripe webhook not receiving events**
- Solution: Ensure webhook endpoint is publicly accessible and signing secret is correct

**Issue: Emails not sending**
- Solution: Check EMAIL_SERVER_* credentials and ensure SMTP port is accessible

**Issue: Cron job not running**
- Solution: Ensure NODE_ENV=production and server is running

## Next Steps

1. ✅ Configure all payment gateway credentials
2. ✅ Test payment flows with test cards
3. ✅ Configure email service and test notifications
4. ✅ Monitor webhook events and logs
5. ✅ Set up payment reporting and analytics
6. ✅ Configure SSL certificates for production
7. ✅ Switch to production API keys when ready

## Support

For issues with specific payment providers:

- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **JazzCash Support**: [https://merchant.jazzcash.com.pk](https://merchant.jazzcash.com.pk)
- **Easypaisa Support**: [https://easypaisa.com.pk](https://easypaisa.com.pk)
- **Twilio Support**: [https://support.twilio.com](https://support.twilio.com)
- **Resend Support**: [https://resend.com/support](https://resend.com/support)

---

**Last Updated**: December 2024
