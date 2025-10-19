# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**City Secretary** - Research paper podcast service that converts arXiv papers and custom text into conversational audio podcasts delivered to subscribers via email.

**Architecture:**
- Frontend: Static HTML/JS landing page + admin dashboard (deployed on Vercel)
- Backend: FastAPI (Python) application (deployed on Render)
- Storage: AWS DynamoDB (metadata) + S3 (audio files)
- External APIs: OpenAI (script generation), ElevenLabs (text-to-speech), Mailgun (email delivery), Stripe (payments)

## Development Commands

### Backend Development

```bash
# Setup
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add required API keys

# Run development server
uvicorn main:app --reload

# Server runs on http://localhost:8000
```

### Frontend Development

```bash
# No build step required - static HTML/JS files
# Open files directly in browser:
open frontend/index.html        # Landing page
open frontend/admin/index.html  # Admin dashboard
```

### Testing

No automated tests currently exist in the repository. Manual testing is performed through the admin dashboard and API endpoints.

## Core Architecture

### Backend Entry Points

The backend has **two separate FastAPI applications**:

1. **main.py** - Primary application with full feature set:
   - Public endpoints: `/api/signup`, `/api/unsubscribe`, `/api/create-podcast-from-text`
   - Admin endpoints: `/api/admin/*` (fetch papers, generate podcasts, send emails, manage users)
   - Stripe payment integration
   - Paper request system
   - Serves frontend static files in production

2. **app.py** - Legacy Flask application (appears deprecated):
   - Simple email signup endpoint only
   - Likely superseded by main.py

**Important:** When modifying backend functionality, work with `main.py` and the services in `backend/services/`.

### Service Layer Architecture

Located in `backend/services/`, these encapsulate core business logic:

- **arxiv_service.py**: Fetches paper metadata from arXiv API
- **podcast_service.py**: Orchestrates podcast generation:
  - Generates conversational scripts using OpenAI GPT-4
  - Supports multiple voice presets (default, energetic, calm, dynamic, professional, storyteller)
  - Converts scripts to audio using ElevenLabs API (multi-speaker with host/expert personas)
  - Uploads audio files to S3
- **email_service.py**: Manages email delivery via Mailgun (welcome emails, podcast notifications, unsubscribe)
- **pdf_service.py**: Extracts text and metadata from PDF files using pypdf and pdfplumber

### Data Model (DynamoDB)

**Tables:**
- `email-signups`: Subscriber management (email, signup_timestamp, subscribed status)
- `paper-links`: Research paper metadata (paper_id, title, authors, abstract, pdf_url, categories)
- `podcasts`: Generated podcast records (podcast_id, paper_id, audio_url, transcript, sent_at, recipients_count)
- `paper-requests`: User-submitted paper requests (email, paper_url, paper_title, reason)

### Admin Workflow

The admin dashboard (`frontend/admin/index.html`) provides a multi-step interface:

1. **Fetch Paper**: Input arXiv URL, upload PDF, or paste custom text
2. **Edit Metadata**: All fields (title, authors, abstract) are editable before generation
3. **Generate Podcast**: Creates script + audio (2-3 min process)
4. **Send to Subscribers**: Three options:
   - Send test email to yourself
   - Send to selected users (checkbox selection)
   - Send to all subscribers

### Key Features

**Editable Metadata**: All paper fields can be edited in admin panel before podcast generation (see EDITABLE_FIELDS_GUIDE.md)

**Voice Presets**: Six different host/expert voice combinations available:
- default, energetic, calm, dynamic, professional, storyteller
- Each uses different ElevenLabs voice IDs for distinct personalities

**User Management**: Admin can:
- Quick add single users
- Bulk import from CSV
- View/manage all subscribers
- Select specific users for targeted sends

**Public Text-to-Podcast**: Public endpoint allows anyone to convert custom text to podcast without authentication

**Stripe Integration**: Payment flows for individual monthly/yearly and team yearly subscriptions with gift options

## Environment Variables Required

```bash
# OpenAI (script generation)
OPENAI_API_KEY=

# ElevenLabs (text-to-speech)
ELEVENLABS_API_KEY=

# Mailgun (email delivery)
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
FROM_EMAIL=

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# DynamoDB table names
EMAIL_TABLE_NAME=email-signups
PAPER_TABLE_NAME=paper-links
PODCASTS_TABLE_NAME=podcasts
PAPER_REQUESTS_TABLE_NAME=paper-requests

# S3
S3_BUCKET_NAME=

# Stripe (optional, for payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
INDIVIDUAL_MONTHLY_PRICE_ID=
INDIVIDUAL_YEARLY_PRICE_ID=
TEAM_YEARLY_PRICE_ID=

# CORS (optional)
ALLOWED_ORIGINS=*
```

## Deployment

**Backend (Render):**
- Configured via `backend/render.yaml`
- Auto-deploys from main branch
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Requires all environment variables set in Render dashboard

**Frontend (Vercel):**
- Configured via `vercel.json` in repository root
- Static deployment with current directory as output
- No build step required

## Common Patterns

### Adding a New API Endpoint

1. Define Pydantic model in `backend/main.py` (Models section around line 56)
2. Create endpoint function with proper route decorator
3. Use service layer (`services/`) for business logic
4. Return standardized JSON responses with proper HTTP status codes
5. Handle errors with HTTPException for proper error responses

### Modifying Podcast Generation

- Script generation logic: `PodcastService.generate_podcast_script()` in `backend/services/podcast_service.py`
- Audio generation: `PodcastService.generate_audio()` with voice preset support
- To add new voice preset: Add entry to `self.voice_presets` dict with host_id, expert_id, names, and description

### Email Template Changes

- Email templates are embedded in `EmailService` methods in `backend/services/email_service.py`
- Mailgun HTML templates include embedded audio player and transcript
- Unsubscribe links automatically appended to all emails

## Project-Specific Notes

- **Cost-conscious design**: Uses free tiers where possible (Render, Vercel, AWS free tier)
- **No authentication on admin panel**: Security through obscurity - admin dashboard has no auth layer
- **Legacy code present**: `app.py` appears deprecated but still in repository
- **Frontend is vanilla JS**: No framework, direct DOM manipulation, uses Tailwind CSS via CDN
- **Recent changes**: Directory restructure moved frontend to root level for Vercel deployment (see commits 8bda82f, 0794748)
