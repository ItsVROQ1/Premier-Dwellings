# Payments, Subscriptions & Security Deposits Implementation

## Overview

This document describes the monetization system implementation for the Premium Real Estate Platform, including:
- Configurable subscription plans (Free/Silver/Gold/Premium)
- Pay-per-listing purchases
- Security deposit workflow for premium licenses
- Payment gateway integration (JazzCash, Easypaisa, Stripe)
- Email and SMS notification system

## Architecture

### Database Models

#### Subscription Management
- **Subscription**: User subscription with tier, billing period, and usage tracking
- **PlanTierConfig**: Plan configuration with features and limits
- **PayPerListingTransaction**: Individual purchase of extra/featured listings
- **SecurityDeposit**: Premium license security deposit tracking

#### Payment Processing
- **Payment**: Payment records with gateway references and status tracking
- **UserNotification**: User-specific notifications with delivery tracking

### Payment Flow

```
User initiates payment → Create Payment record → Route to gateway
                                    ↓
                    Receive webhook callback
                                    ↓
        Update Payment status & Activate Subscription
                                    ↓
                    Send email/SMS notifications
```

## Configuration

### Environment Variables

```env
# Payment Gateways
JAZZCASH_MERCHANT_ID=your_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_RETURN_URL=http://localhost:3000/api/payments/jazzcash/callback

EASYPAISA_MERCHANT_ID=your_id
EASYPAISA_PASSWORD=your_password
EASYPAISA_RETURN_URL=http://localhost:3000/api/payments/easypaisa/callback

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
RESEND_API_KEY=your_api_key
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test
SMTP_PASSWORD=test
SMTP_FROM=noreply@realestate.local

# SMS
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

JAZZ_SMS_API_KEY=your_key
JAZZ_SMS_SENDER_ID=REALESTATE
```

## Subscription Plans

### Free Plan
- **Price**: PKR 0
- **Max Listings**: 1
- **Features**: Basic listing, Email support

### Silver Plan
- **Price**: PKR 5,000/month or PKR 50,000/year
- **Max Listings**: 10
- **Max Featured**: 2
- **Features**: Basic analytics, Email & phone support

### Gold Plan
- **Price**: PKR 15,000/month or PKR 150,000/year
- **Max Listings**: 50
- **Max Featured**: 10
- **Features**: Advanced analytics, Promotion tools, Priority support, Virtual tours

### Premium Plan
- **Price**: PKR 50,000/month or PKR 500,000/year
- **Max Listings**: Unlimited
- **Max Featured**: Unlimited
- **Features**: All Gold features + Team management, Custom branding, Premium blue tick

## API Endpoints

### Payment Creation
```
POST /api/payments/create
Body: {
  userId: string
  amount: number
  currency: string
  description: string
  paymentMethod: "JAZZCASH" | "EASYPAISA" | "STRIPE"
  planTier?: PlanTier
  billingPeriod?: "MONTHLY" | "YEARLY"
}
Response: {
  success: boolean
  paymentId: string
  redirectUrl: string
}
```

### Payment Webhooks
- `POST /api/payments/jazzcash/webhook` - JazzCash callback
- `POST /api/payments/easypaisa/webhook` - Easypaisa callback
- `POST /api/payments/stripe/webhook` - Stripe webhook

### Security Deposit Application
```
POST /api/security-deposits/apply
Body: {
  userId: string
  paymentMethod: string
}
```

### Admin APIs
```
POST /api/admin/security-deposits/approve
Body: {
  depositId: string
  adminId: string
  approved: boolean
  rejectionReason?: string
}
```

## Server Actions

### Subscription Management
```typescript
// Get subscription details
getSubscriptionDetails(userId)

// Get available plans
getAvailablePlans()

// Check if can publish listing
canPublishListing(userId, isFeatured?)

// Get listing capacity
getListingCapacity(userId)

// Get security deposit status
getSecurityDepositStatus(userId)

// Get user payments
getUserPayments(userId, limit?)

// Upgrade/downgrade subscription
upgradeSubscription(userId, newTier, billingPeriod)
downgradeSubscription(userId, newTier, billingPeriod)

// Cancel subscription
cancelSubscription(userId, reason?)
```

### Admin Actions
```typescript
// Get pending deposits
getPendingSecurityDeposits(adminId)

// Approve/reject deposit
approveSecurityDeposit(adminId, depositId)
rejectSecurityDeposit(adminId, depositId, reason)

// Get all payments
getAllPayments(adminId, limit?, offset?)

// Toggle premium tick
togglePremiumTick(adminId, agentId)

// Process refund
processRefund(adminId, paymentId, amount, reason)

// Get statistics
getSubscriptionStats(adminId)
```

## Notification System

### Notification Types
- `LISTING_INQUIRY` - New inquiry for a listing
- `PAYMENT_RECEIVED` - Payment successful
- `PAYMENT_FAILED` - Payment declined
- `LISTING_APPROVED` - Listing approved after moderation
- `PLAN_EXPIRY_REMINDER` - 7-day expiry warning
- `SUBSCRIPTION_RENEWED` - Subscription auto-renewed
- `SECURITY_DEPOSIT_APPROVED` - Deposit approved by admin
- `SECURITY_DEPOSIT_REJECTED` - Deposit rejected
- `PREMIUM_LICENSE_APPROVED` - Premium license granted

### Notification Channels
- **Email**: Via Resend (primary) or Nodemailer (fallback)
- **SMS**: Via Jazz SMS (primary for Pakistan) or Twilio (fallback)
- **In-App**: Stored in UserNotification table

### Sending Notifications
```typescript
import { notificationService } from '@/lib/notifications/service';

// Send payment confirmation
await notificationService.notifyPaymentSuccess(userId, {
  amount: 5000,
  currency: 'PKR',
  transactionId: 'TXN-123',
  description: 'Subscription upgrade'
});

// Send listing inquiry notification
await notificationService.notifyListingInquiry(agentId, {
  listingTitle: 'Luxury Apartment',
  inquirerName: 'John Doe',
  inquirerEmail: 'john@example.com',
  message: 'Is this property still available?'
});
```

## Listing Publish Checks

### Before Publishing a Listing
```typescript
import { checkListingPublishAllowed } from '@/lib/listing-publish-check';

const check = await checkListingPublishAllowed(userId, isFeatured);
if (!check.allowed) {
  // Show upgrade prompt or error message
  console.log(check.reason);
}
```

### Usage Tracking
- Subscription tracks `listingsUsed` and `featuredUsed`
- Updated when listings are published/archived
- Prevents publishing if limits exceeded

## Cron Jobs

### Subscription Reminders (Daily)
```typescript
import { sendSubscriptionExpiryReminders } from '@/lib/cron/subscription-reminders';

// Call daily to send 7-day expiry reminders
await sendSubscriptionExpiryReminders();
```

### Auto-Renewal (Daily at Midnight)
```typescript
import { processAutoRenewals } from '@/lib/cron/subscription-reminders';

// Process auto-renewal for subscriptions
await processAutoRenewals();
```

### Deactivate Expired (Daily)
```typescript
import { deactivateExpiredSubscriptions } from '@/lib/cron/subscription-reminders';

// Deactivate subscriptions past end date
await deactivateExpiredSubscriptions();
```

## Components

### Subscription Card
```tsx
<SubscriptionCard
  planName="Gold"
  planTier="PROFESSIONAL"
  isActive={true}
  startDate={new Date()}
  endDate={new Date(Date.now() + 30*24*60*60*1000)}
  features={['10 listings', 'Analytics']}
  onUpgrade={() => {}}
  onRenew={() => {}}
  onManage={() => {}}
/>
```

### Plan Selector
```tsx
<PlanSelector
  plans={planConfigs}
  currentPlan="FREE"
  onSelectPlan={(tier, period) => {}}
/>
```

### Payment Method Selector
```tsx
<PaymentMethodSelector
  methods={[
    { id: 'JAZZCASH', name: 'JazzCash', ... },
    { id: 'EASYPAISA', name: 'Easypaisa', ... },
  ]}
  selected="JAZZCASH"
  onSelect={setMethod}
/>
```

### Security Deposit Form
```tsx
<SecurityDepositForm
  agentName="John Smith"
  onSubmit={async (method) => {}}
/>
```

## Testing

### Payment Gateway Testing
- Use merchant test/sandbox credentials
- JazzCash sandbox: `https://sandbox.jazzcash.com.pk`
- Easypaisa sandbox: `https://sandbox.easypaisa.com.pk`
- Stripe test mode: Use `pk_test_` and `sk_test_` keys

### Email/SMS Testing
- Email: Configure local SMTP server (e.g., MailHog on port 1025)
- SMS: Use test credentials from Twilio/Jazz SMS

### Webhook Testing
- Use ngrok to expose local server: `ngrok http 3000`
- Update webhook URLs in payment gateway admin panels
- Test with tools like Postman or webhook.site

## Security Considerations

1. **Payment Data**:
   - Never store full card numbers
   - Use payment gateway APIs, not manual form submissions
   - Implement proper SSL/TLS

2. **Webhooks**:
   - Verify webhook signatures before processing
   - Implement idempotency to handle duplicate webhooks
   - Log all webhook events

3. **User Data**:
   - Validate all user inputs
   - Implement rate limiting on payment endpoints
   - Store sensitive data encrypted

4. **Admin Actions**:
   - Verify admin role on all admin endpoints
   - Audit log all security deposit approvals
   - Require 2FA for high-value refunds

## Future Enhancements

1. **Subscription Features**:
   - Proration on mid-cycle upgrades/downgrades
   - Usage-based billing for pay-per-listing
   - Volume discounts for team subscriptions

2. **Payment Features**:
   - Multiple payment methods per user
   - Saved payment methods
   - Recurring billing automation
   - Invoice generation and download

3. **Reporting**:
   - Revenue reports by plan/gateway
   - Churn analysis
   - Lifetime value tracking

4. **User Experience**:
   - Plan upgrade wizards
   - Feature unlock prompts
   - Trial periods
   - Referral bonuses
