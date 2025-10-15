# ⚡ Quick Start - Paste & Deploy

## Step 1: Copy Environment Variables (1 minute)

Go to **Render Dashboard** → Your Service → **Environment** tab

Paste these 8 variables:

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

Click **Save Changes**

---

## Step 2: Deploy Code (30 seconds)

Render will auto-deploy when you push:

```bash
git add .
git commit -m "Add Stripe subscriptions"
git push origin main
```

Or click **Manual Deploy** in Render dashboard.

---

## Step 3: Set Up Webhook (2 minutes)

**After deployment completes:**

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter:
   - **Endpoint URL**: `https://four0k-arr-saas.onrender.com/api/webhook/stripe`
   - **Events**: Select these 3:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
4. Click **Add endpoint**
5. **Copy the Webhook Signing Secret** (starts with `whsec_`)
6. Go back to Render → Environment
7. Add one more variable:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
8. Click **Save** → Render will auto-redeploy

---

## Step 4: Test It! (1 minute)

1. Visit: `https://four0k-arr-saas.onrender.com/pricing.html`
2. Click "Subscribe Now" on any plan
3. Enter email
4. Use test card: **4242 4242 4242 4242**
5. Complete checkout
6. Check: Should redirect to thank-you page! 🎉

---

## ✅ What's Built

Everything is ready:
- ✅ Pricing page with 3 plans ($9.99/mo, $99/yr, $299/yr team)
- ✅ Stripe Checkout integration
- ✅ Webhook for automatic subscription activation
- ✅ Customer portal for subscription management
- ✅ Gift subscriptions (yearly plan only)
- ✅ DynamoDB storage with Stripe customer IDs
- ✅ Welcome emails on signup

---

## 🎯 URLs

- **Pricing**: https://four0k-arr-saas.onrender.com/pricing.html
- **Backend**: https://four0k-arr-saas.onrender.com
- **Stripe**: https://dashboard.stripe.com
- **Render**: https://dashboard.render.com

---

**That's it! You're live! 🚀**

See `DEPLOYMENT_READY_CHECKLIST.md` for detailed info.
