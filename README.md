# AI Research Paper Podcast Generator

Automated service that converts arXiv research papers into engaging podcasts and delivers them to subscribers via email.

## What It Does

- Fetches research papers from arXiv
- Generates conversational podcast scripts using OpenAI
- Converts scripts to natural-sounding audio with ElevenLabs voices
- Emails podcasts to subscribers with embedded audio player
- Manages subscriptions and podcast history

## Architecture

**Frontend:** Static HTML/JS landing page + admin dashboard
**Backend:** FastAPI (Python) hosted on Render
**Storage:** AWS DynamoDB (metadata) + S3 (audio files)
**Email:** Mailgun for transactional emails

## Quick Start

### 1. Environment Setup

Required API keys:
- **OpenAI** - Script generation (~$0.01/podcast)
- **ElevenLabs** - Text-to-speech (~$0.30/podcast)
- **Mailgun** - Email delivery (free tier: 5k emails/month)
- **AWS** - DynamoDB + S3 storage

### 2. Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn main:app --reload

# Frontend
# Open frontend/index.html in browser
```

### 3. Deployment

**Backend (Render):**
- Connects to GitHub repo
- Auto-deploys on push to main
- Add environment variables from `.env.example`

**Frontend (Vercel):**
- Import repo
- Set root directory to `frontend/`
- Deploy

## Project Structure

```
├── frontend/           # Landing page + admin dashboard
│   ├── index.html     # User signup page
│   ├── pricing.html   # Subscription plans
│   └── admin/         # Admin dashboard
├── backend/           # FastAPI application
│   ├── main.py       # API endpoints
│   ├── services/     # ArXiv, Podcast, Email services
│   └── requirements.txt
└── infra/            # AWS infrastructure configs
```

## Admin Workflow

1. Visit `/admin` dashboard
2. Paste arXiv paper URL
3. Click "Generate Podcast" (2-3 min)
4. Preview audio
5. Send to all subscribers

## API Endpoints

**Public:**
- `POST /api/signup` - Subscribe to podcasts
- `POST /api/unsubscribe` - Unsubscribe

**Admin:**
- `POST /api/admin/fetch-paper` - Fetch arXiv paper
- `POST /api/admin/generate-podcast` - Generate audio
- `POST /api/admin/send-podcast` - Email subscribers
- `GET /api/admin/stats` - Dashboard stats

## Cost Estimate

For 100 subscribers with daily podcasts:
- OpenAI: ~$0.30/month
- ElevenLabs: ~$9/month
- S3 Storage: ~$1/month
- Mailgun: Free (up to 5k emails)
- Render: Free tier
- **Total: ~$10/month**

## Setup Details

See `SETUP.md` for detailed configuration instructions.
See `QUICK_START.md` for deployment steps.
