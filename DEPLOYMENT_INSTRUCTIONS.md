# Stripe Integration - Deployment Instructions

## Overview
The Stripe integration is complete! Here's what you need to do to deploy it.

## What's Been Built

### Backend Endpoints (in `backend/main.py`)
1. **POST /api/create-checkout** - Creates Stripe checkout sessions
2. **POST /api/webhook/stripe** - Handles Stripe webhooks (subscriptions, cancellations)
3. **POST /api/customer-portal** - Generates customer portal links
4. **GET /api/subscription-status** - Gets user subscription info

### Frontend Pages
1. **pricing.html** - Beautiful pricing page with 3 tiers
2. **Updated index.html** - Added pricing link to navigation
3. **thank-you.html** - Already configured

### Database Schema
The webhook automatically adds these fields to `email-signups` table:
- `subscription_tier` - 'free', 'individual_monthly', 'individual_yearly', 'team'
- `subscription_status` - 'active', 'canceled', 'none'
- `stripe_customer_id` - Stripe customer ID
- `stripe_subscription_id` - Stripe subscription ID
- `subscription_start_date` - Unix timestamp

## Environment Variables to Add on Render

Go to your Render dashboard and add these environment variables:

```bash
# Stripe Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_51...   # Replace with your secret key
STRIPE_PUBLISHABLE_KEY=pk_test_... # Replace with your publishable key

# Stripe Price IDs (already in code as defaults, but recommended to set)
INDIVIDUAL_MONTHLY_PRICE_ID=price_1SIbzVRhG8asVSl57FKrrQ1Q
INDIVIDUAL_YEARLY_PRICE_ID=price_1SIc0VRhG8asVSl5q67CtVLa
TEAM_YEARLY_PRICE_ID=price_1SIc1ORhG8asVSl5e6nyAmH3

# URLs for Stripe Checkout (update with your actual domain)
SUCCESS_URL=https://your-frontend-domain.com/thank-you.html
CANCEL_URL=https://your-frontend-domain.com/pricing.html
PORTAL_RETURN_URL=https://your-frontend-domain.com/dashboard.html

# This will be set up in Step 3 below
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Deployment Steps

### Step 1: Deploy Backend Code
1. Commit and push all changes:
```bash
cd /Users/ari/GitHub/City/marketplace/ai-research-paper-podcasts
git add .
git commit -m "Add Stripe integration with checkout, webhooks, and customer portal"
git push
```

2. Render will auto-deploy the backend
3. Wait for deployment to complete

### Step 2: Deploy Frontend
1. Upload `frontend/pricing.html` to your frontend hosting
2. Update `frontend/index.html` (already has pricing link)

### Step 3: Set Up Stripe Webhook
**IMPORTANT: Do this AFTER deploying!**

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter webhook URL:
   ```
   https://four0k-arr-saas.onrender.com/api/webhook/stripe
   ```
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_...`)
7. Add it to Render as `STRIPE_WEBHOOK_SECRET`

### Step 4: Test the Integration

#### Test with Stripe Test Cards:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Card Declined:**
- Card: `4000 0000 0000 0002`

**Requires Authentication (3D Secure):**
- Card: `4000 0025 0000 3155`

#### Testing Flow:
1. Go to `your-domain.com/pricing.html`
2. Enter your test email
3. Click "Subscribe Now"
4. Use test card `4242 4242 4242 4242`
5. Complete checkout
6. Verify webhook received (check Render logs)
7. Verify user upgraded in DynamoDB `email-signups` table

### Step 5: Test Webhook Locally (Optional)

If you want to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to http://localhost:8000/api/webhook/stripe

# This gives you a webhook signing secret (whsec_...)
# Add it to your local .env as STRIPE_WEBHOOK_SECRET
```

## How It Works

### Purchase Flow:
1. User visits pricing page
2. Enters email and clicks "Subscribe Now"
3. Frontend calls `/api/create-checkout`
4. Backend creates Stripe Checkout session
5. User redirects to Stripe payment page
6. User completes payment
7. Stripe redirects to thank-you page
8. Stripe webhook fires `checkout.session.completed`
9. Backend updates user's subscription in DynamoDB
10. User receives welcome email

### Subscription Management:
- Users can manage billing via Customer Portal
- Accessed via `/api/customer-portal` endpoint
- Allows: Cancel, update payment method, view invoices

### Gift Subscriptions:
- Only available for yearly plans
- Checkbox appears when "Yearly" is selected
- Purchaser enters recipient's email
- Webhook creates subscription for recipient
- Future: Send gift email to recipient

## Monitoring

### Check Subscription Status:
```bash
# Query DynamoDB
aws dynamodb scan \
  --table-name email-signups \
  --filter-expression "attribute_exists(subscription_tier)"
```

### Check Stripe Dashboard:
- Customers: https://dashboard.stripe.com/customers
- Subscriptions: https://dashboard.stripe.com/subscriptions
- Webhooks: https://dashboard.stripe.com/webhooks

### Check Render Logs:
Look for these log messages:
- `Received Stripe webhook: checkout.session.completed`
- `Activated subscription for {email}: {plan}`
- `Updated subscription status for {email}: {status}`
- `Canceled subscription for {email}`

## Revenue Tracking

Add to admin dashboard later:
- MRR = (Monthly subs × $9.99) + (Yearly subs × $99 / 12)
- ARR = MRR × 12
- Total subscribers by tier
- Churn rate

## Next Steps (Future Enhancements)

1. **User Dashboard** - Let users see their subscription status
2. **Paper Requests** - Let paid users request papers
3. **Email Differentiation** - Add upgrade CTAs to free emails
4. **Gift Email** - Send special email to gift recipients
5. **Admin Revenue Dashboard** - Show MRR/ARR metrics
6. **Team Management** - Let team admins manage seats

## Troubleshooting

### Webhook Not Firing:
- Check webhook URL is correct
- Check webhook is listening to correct events
- Check Stripe dashboard for delivery attempts
- Check Render logs for errors

### Payment Not Working:
- Check Price IDs match Stripe dashboard
- Check Stripe API keys are correct
- Check test mode vs live mode

### User Not Upgraded:
- Check webhook received (Stripe dashboard)
- Check Render logs for webhook processing
- Check DynamoDB for subscription fields

## Going Live (Production)

When ready for production:

1. Switch to live Stripe keys:
   - Go to https://dashboard.stripe.com/apikeys
   - Toggle from "Test" to "Live"
   - Copy live keys
   - Update Render env vars: `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`

2. Create live webhook endpoint:
   - Same URL, but with live Stripe account
   - Get new signing secret
   - Update `STRIPE_WEBHOOK_SECRET` on Render

3. Test with real card (use small amount first!)

## Support

If anything breaks:
- Check Render logs: https://dashboard.render.com
- Check Stripe logs: https://dashboard.stripe.com/logs
- Check webhook attempts: https://dashboard.stripe.com/webhooks

---

## Quick Reference: Stripe Test Cards

| Scenario | Card Number | Result |
|----------|-------------|---------|
| Success | 4242 4242 4242 4242 | Payment succeeds |
| Decline | 4000 0000 0000 0002 | Payment declined |
| 3D Secure | 4000 0025 0000 3155 | Requires authentication |
| Insufficient funds | 4000 0000 0000 9995 | Insufficient funds |

All test cards:
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

## Summary

You now have a complete Stripe integration with:
- ✅ Checkout sessions
- ✅ Webhook handling
- ✅ Customer portal
- ✅ Pricing page
- ✅ Gift subscriptions
- ✅ Subscription management

**Total time to deploy: ~15 minutes**

1. Add environment variables (5 min)
2. Deploy code (5 min)
3. Set up webhook (5 min)
4. Test (optional)

Good luck hitting $40K ARR! 🚀
