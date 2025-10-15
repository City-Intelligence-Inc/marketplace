# 40k ARR SaaS - AI Research Podcast System

## Overview
Automated system for converting arXiv research papers into podcasts and sending them to subscribers via email.

## Infrastructure (AWS - Already Deployed ✅)
- **DynamoDB Tables:**
  - `email-signups` - Subscriber management
  - `paper-links` - arXiv paper metadata
  - `podcasts` - Generated podcast records
- **S3 Bucket:** `40k-arr-saas-podcasts` - Audio file storage

## Environment Variables Needed

Add these to your Render environment:

```
# OpenAI for podcast script generation
OPENAI_API_KEY=your_openai_api_key

# ElevenLabs for text-to-speech
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Mailgun for emails
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.com
FROM_EMAIL=podcasts@your_domain.com

# AWS (already set)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# DynamoDB Tables
EMAIL_TABLE_NAME=email-signups
PAPER_TABLE_NAME=paper-links
PODCASTS_TABLE_NAME=podcasts

# S3
S3_BUCKET_NAME=40k-arr-saas-podcasts
```

## URLs

### Production
- **Landing Page:** https://your-vercel-domain.vercel.app
- **Admin Dashboard:** https://your-vercel-domain.vercel.app/admin
- **Thank You Page:** https://your-vercel-domain.vercel.app/thank-you.html
- **Backend API:** https://four0k-arr-saas.onrender.com

### Local Development
- Frontend: Open `frontend/index.html` in browser
- Backend: `cd backend && uvicorn main:app --reload`

## Daily Workflow (Manual via Admin Dashboard)

1. **Visit Admin Dashboard:** `/admin/index.html`

2. **Fetch Paper:**
   - Find interesting paper on arXiv
   - Paste URL (e.g., https://arxiv.org/abs/2401.12345)
   - Click "Fetch Paper"
   - Review title, authors, abstract

3. **Generate Podcast:**
   - Click "Generate Podcast"
   - Wait 2-3 minutes
   - AI generates script using OpenAI
   - ElevenLabs converts to audio
   - Preview audio player appears

4. **Send to Subscribers:**
   - Click "Send to All Subscribers"
   - Confirm
   - Mailgun sends HTML emails with:
     - Paper info
     - Embedded audio player
     - Full transcript
     - Unsubscribe link

## User Flow

1. User visits landing page
2. Enters name + email
3. Receives instant welcome email (Mailgun)
4. Gets redirected to thank you page
5. Waits for daily podcast emails

## API Endpoints

### Public
- `POST /api/signup` - User signup with welcome email
- `POST /api/unsubscribe` - Unsubscribe from emails

### Admin
- `POST /api/admin/fetch-paper` - Fetch from arXiv
- `POST /api/admin/generate-podcast` - Generate audio
- `POST /api/admin/send-podcast` - Email all subscribers
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/podcast-history` - Sent podcasts

## Setup Instructions

### 1. Get API Keys

**OpenAI:** https://platform.openai.com/api-keys
- Used for: Generating podcast scripts
- Cost: ~$0.01 per podcast

**ElevenLabs:** https://elevenlabs.io
- Used for: Text-to-speech audio generation
- Cost: ~$0.30 per 10-min podcast
- Free tier: 10,000 characters/month

**Mailgun:** https://mailgun.com
- Used for: Sending emails
- Free tier: 5,000 emails/month
- Need to verify domain

### 2. Configure Mailgun Domain

1. Add domain in Mailgun dashboard
2. Add DNS records to your domain
3. Verify domain
4. Get API key from settings

### 3. Deploy to Render

1. Push code to GitHub (already done ✅)
2. Go to Render dashboard
3. Your existing service will auto-deploy
4. Add new environment variables (listed above)
5. Manual redeploy after adding vars

### 4. Deploy Frontend to Vercel

1. Go to vercel.com
2. Import `40k-arr-saas` repo
3. Set root directory: `frontend`
4. Deploy
5. Visit your Vercel URL

## Testing

### Test Signup Flow
1. Visit landing page
2. Enter your email
3. Check inbox for welcome email
4. Verify redirect to thank you page

### Test Admin Dashboard
1. Visit `/admin/index.html`
2. Paste arXiv URL: https://arxiv.org/abs/2301.07041
3. Generate podcast
4. Send to yourself first (test email)

## Cost Breakdown (Monthly)

For 100 subscribers receiving daily podcasts:

- Render: Free (750 hours/month)
- Vercel: Free (hosting)
- DynamoDB: Free tier
- S3: ~$1 (storage)
- OpenAI: ~$0.30 (30 podcasts × $0.01)
- ElevenLabs: ~$9 (30 podcasts × $0.30)
- Mailgun: Free up to 5k emails, then $35/month

**Total: ~$10-45/month** depending on subscriber count

## Troubleshooting

### Podcast generation fails
- Check OpenAI API key is valid
- Check ElevenLabs API key and quota
- Check S3 bucket permissions

### Emails not sending
- Verify Mailgun domain is verified
- Check API key is correct
- Check Mailgun logs in dashboard

### Audio not playing
- Check S3 bucket has public read access
- Check CORS configuration on bucket
- Try direct S3 URL in browser

## Next Steps

1. Get API keys (OpenAI, ElevenLabs, Mailgun)
2. Add to Render environment variables
3. Redeploy backend
4. Deploy frontend to Vercel
5. Test end-to-end flow
6. Send first podcast!

## Support

Check logs:
- Render: Dashboard → Logs tab
- Mailgun: Dashboard → Logs
- AWS: CloudWatch

Need help? Check the code comments or API documentation.
