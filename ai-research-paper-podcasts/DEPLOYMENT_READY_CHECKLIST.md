# 🚀 Deployment Ready Checklist

**Project**: AI Research Paper Podcasts
**URL**: https://four0k-arr-saas.onrender.com
**Status**: ✅ READY TO DEPLOY

---

## ✅ Infrastructure Status

### DynamoDB Tables (via Terraform - Already Created)
- ✅ `email-signups` - Stores subscriber data WITH Stripe fields:
  - email (hash key)
  - signup_timestamp
  - subscribed (boolean)
  - subscription_tier (free/individual_monthly/individual_yearly/team)
  - stripe_customer_id
  - stripe_subscription_id
  - subscription_status (active/canceled)
  - subscription_start_date

- ✅ `paper-links` - Stores research papers
- ✅ `podcasts` - Stores generated podcasts
- ✅ `paper-requests` - Stores user paper requests
- ✅ S3 bucket for podcast audio files

**Note**: The existing `email-signups` table is **ALREADY set up** to handle Stripe subscriptions. The webhook updates these fields dynamically when subscriptions are created.

### Backend Stripe Integration - COMPLETE ✅
- ✅ Stripe API keys configured
- ✅ Price IDs for 3 plans configured
- ✅ Checkout endpoint: `POST /api/create-checkout`
- ✅ Webhook endpoint: `POST /api/webhook/stripe`
- ✅ Customer portal endpoint: `POST /api/customer-portal`
- ✅ Subscription status endpoint: `GET /api/subscription-status`
- ✅ Gift subscription support
- ✅ Automatic subscriber activation via webhooks

### Frontend Pages - COMPLETE ✅
- ✅ `pricing.html` - Beautiful pricing page with 3 tiers
- ✅ `thank-you.html` - Post-checkout success page
- ✅ `index.html` - Main landing page
- ✅ All pages served from backend at `/pricing.html`, `/thank-you.html`

---

## 📋 Deployment Steps

### Step 1: Set Environment Variables on Render ✅ READY TO PASTE

Go to your Render dashboard → Service → Environment Variables and paste these:

```
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51RvAnaRhG8asVSl5iD3tyuNiiPON5ItkdhZzEWmCm2ox111tKy9agolKgUneowfeFIg4Q8kylzeVtwhltweu1fIj001irzevpB
INDIVIDUAL_MONTHLY_PRICE_ID=price_1SIbzVRhG8asVSl57FKrrQ1Q
INDIVIDUAL_YEARLY_PRICE_ID=price_1SIc0VRhG8asVSl5q67CtVLa
TEAM_YEARLY_PRICE_ID=price_1SIc1ORhG8asVSl5e6nyAmH3
SUCCESS_URL=https://four0k-arr-saas.onrender.com/thank-you.html
CANCEL_URL=https://four0k-arr-saas.onrender.com/pricing.html
PORTAL_RETURN_URL=https://four0k-arr-saas.onrender.com/dashboard.html
```

### Step 2: Deploy the Code 🚀

Your code is ready! Just push to git or trigger a manual deploy:

```bash
git add .
git commit -m "Add Stripe subscription integration"
git push origin main
```

Render will auto-deploy on push.

### Step 3: Set Up Stripe Webhook (AFTER deployment) ⚠️

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://four0k-arr-saas.onrender.com/api/webhook/stripe`
4. **Events to send**: Select these 3 events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. **Copy the Webhook Signing Secret** (starts with `whsec_`)
7. Add it to Render environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```
8. Trigger a Render redeploy after adding the webhook secret

---

## 🧪 Testing Checklist (After Deployment)

### Test 1: Pricing Page Access
- [ ] Visit `https://four0k-arr-saas.onrender.com/pricing.html`
- [ ] Verify all 3 plans display correctly
- [ ] Toggle between Monthly/Yearly billing

### Test 2: Checkout Flow
- [ ] Click "Subscribe Now" on Individual Monthly plan
- [ ] Enter test email
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify redirect to thank-you page

### Test 3: Subscription Activation
- [ ] Check Render logs for "Activated subscription for [email]"
- [ ] Verify email appears in DynamoDB `email-signups` table with:
  - `subscription_tier` = plan name
  - `stripe_customer_id` = cus_xxx
  - `stripe_subscription_id` = sub_xxx
  - `subscription_status` = "active"

### Test 4: Webhook Events
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click on your webhook endpoint
- [ ] Check "Events" tab shows successful 200 responses
- [ ] Test failed payment scenario

### Test 5: Customer Portal
- [ ] Implement a button to call `POST /api/customer-portal` with email
- [ ] Verify it redirects to Stripe customer portal
- [ ] Test subscription cancellation
- [ ] Verify webhook updates DynamoDB to `subscription_status: "canceled"`

---

## 📊 What Happens When Someone Subscribes?

1. **User clicks "Subscribe Now"** on pricing page
2. **Frontend calls** `POST /api/create-checkout` with:
   - `email`: user's email
   - `plan`: individual_monthly | individual_yearly | team
   - `is_gift`: boolean (optional)
3. **Backend creates Stripe Checkout session** and returns URL
4. **User redirects to Stripe** to enter payment
5. **Stripe processes payment** and redirects to thank-you page
6. **Stripe fires webhook** → `checkout.session.completed` event
7. **Your backend webhook handler**:
   - Extracts customer_id, subscription_id, email from event
   - Updates `email-signups` table with:
     - `stripe_customer_id`
     - `stripe_subscription_id`
     - `subscription_tier` (plan name)
     - `subscription_status: "active"`
   - Sends welcome email
8. **User is now a paid subscriber!** 🎉

---

## 🛠 Infrastructure Summary

### What's Already Built:

✅ **Backend** (`main.py`):
- Complete Stripe integration (4 endpoints)
- Webhook signature verification
- Automatic subscription activation
- Gift subscription support
- Customer portal link generation

✅ **Frontend**:
- Pricing page with toggle billing
- Checkout integration
- Thank you page
- Gift subscription UI

✅ **Database**:
- DynamoDB tables already created via Terraform
- `email-signups` table supports all Stripe fields
- No schema changes needed!

✅ **Infrastructure**:
- Render backend deployment configured
- S3 bucket for audio files
- AWS DynamoDB tables provisioned

### What You DON'T Need:

❌ **No new DynamoDB tables** - existing `email-signups` handles everything
❌ **No database migrations** - DynamoDB is schemaless
❌ **No additional infrastructure** - everything uses existing resources
❌ **No separate subscription service** - integrated into main backend

---

## 🔑 Important URLs

- **Pricing Page**: https://four0k-arr-saas.onrender.com/pricing.html
- **API Base URL**: https://four0k-arr-saas.onrender.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Render Dashboard**: https://dashboard.render.com

---

## 💡 Next Steps After Launch

1. **Monitor webhook events** in Stripe dashboard
2. **Check Render logs** for subscription activations
3. **Query DynamoDB** to see new paid subscribers
4. **Implement dashboard** to show subscription status
5. **Add email notification** for failed payments
6. **Create admin view** to see all subscribers with tiers
7. **Test subscription cancellation** flow
8. **Set up customer support** email for billing questions

---

## 🎯 Success Metrics

After deployment, you should see:
- ✅ Pricing page loads at `/pricing.html`
- ✅ Stripe Checkout opens on "Subscribe Now"
- ✅ Webhooks return 200 OK in Stripe dashboard
- ✅ New subscribers appear in DynamoDB with Stripe IDs
- ✅ Customer portal link works for managing subscriptions

---

**Status**: 🟢 **ALL SYSTEMS GO! READY TO DEPLOY!**

The infrastructure is complete. Just paste the env vars into Render and deploy!
