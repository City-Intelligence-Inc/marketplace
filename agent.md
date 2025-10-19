# Agent Context & Working Memory

**Last Updated:** 2025-10-20
**Project:** City Secretary - Research Paper Podcast Service
**Working Relationship:** Active Development

---

## My Persona & Role

I am an **experienced backend engineer** working on City Secretary, a production SaaS application that converts research papers into audio podcasts. My expertise includes:

- **Backend Architecture**: FastAPI, Python services, RESTful APIs
- **Cloud Infrastructure**: AWS (DynamoDB, S3), Render deployment, Vercel hosting
- **External APIs**: OpenAI GPT-4, ElevenLabs TTS, Mailgun, Stripe payments
- **Database Design**: NoSQL data modeling, DynamoDB table structures
- **System Integration**: Multi-service orchestration, async workflows
- **Production Operations**: Cost optimization, monitoring, deployment automation

I approach problems methodically, prioritize maintainability, and always consider production implications.

---

## Project Context (Consolidated from all documentation)

### What City Secretary Does

Automated service that converts research papers and custom text into conversational podcast audio, delivered via email to subscribers.

**Core Flow:**
1. Admin fetches paper (arXiv URL, PDF upload, or custom text)
2. OpenAI GPT-4 generates conversational 2-person dialogue script
3. ElevenLabs converts script to audio with distinct host/expert voices
4. Audio uploaded to S3, metadata stored in DynamoDB
5. Mailgun sends HTML email with embedded audio player to subscribers

### Technical Stack

**Backend (Python/FastAPI):**
- `main.py` - Primary application (1468 lines)
  - Public endpoints: `/api/signup`, `/api/unsubscribe`, `/api/create-podcast-from-text`
  - Admin endpoints: `/api/admin/*` for paper management, podcast generation, user management
  - Stripe checkout and webhook handling
- `app.py` - Legacy Flask app (deprecated, only email signup)
- Service layer in `backend/services/`:
  - `arxiv_service.py` - Fetches arXiv paper metadata
  - `podcast_service.py` - Orchestrates script generation + audio synthesis
  - `email_service.py` - Mailgun email delivery (welcome, podcasts, unsubscribe)
  - `pdf_service.py` - PDF text extraction (pypdf, pdfplumber)

**Frontend (Vanilla JS + HTML):**
- `index.html` - Landing page (signup form)
- `pricing.html` - Stripe subscription plans ($9.99/mo, $99/yr, $299/yr team)
- `thank-you.html` - Post-signup confirmation
- `admin/index.html` - Admin dashboard (78KB single-file SPA, no auth)

**Data Model (DynamoDB):**
- `email-signups` - Subscribers (email, signup_timestamp, subscribed)
- `paper-links` - Paper metadata (paper_id, title, authors, abstract, pdf_url)
- `podcasts` - Generated podcasts (podcast_id, audio_url, transcript, sent_at)
- `paper-requests` - User-submitted requests (email, paper_url, reason)

**External Services:**
- OpenAI GPT-4: Script generation (~$0.01/podcast)
- ElevenLabs: Text-to-speech (~$0.30/podcast)
- Mailgun: Email delivery (free tier: 5k/month)
- Stripe: Payment processing
- AWS S3: Audio file storage
- Render: Backend hosting (free tier)
- Vercel: Frontend hosting (static deployment)

### Key Features & Recent Changes

**Editable Metadata** (Recent):
- All paper fields (title, authors, abstract) editable in admin before generation
- Fixes parsing errors from arXiv/PDF extraction

**Voice Presets** (6 options):
- default, energetic, calm, dynamic, professional, storyteller
- Each uses different ElevenLabs voice IDs for host/expert personas
- Configured in `PodcastService.voice_presets` dict

**User Management** (Recent):
- Quick add single users
- Bulk CSV import (comma or newline separated)
- Checkbox selection for targeted sends
- Test email feature before mass send

**Stripe Integration**:
- Individual monthly/yearly, team yearly plans
- Gift subscription support
- Webhook handling for subscription lifecycle
- Environment-configured price IDs

**Rebrand** (Completed):
- Changed from "AI Research Podcasts" to "City Secretary"
- Genericized from AI-specific to general research
- All frontend/backend/email templates updated
- Zero functional changes, purely cosmetic

### Development Commands

```bash
# Backend development
cd backend
pip install -r requirements.txt
uvicorn main:app --reload  # http://localhost:8000

# Frontend (no build)
open frontend/index.html  # Landing page
open frontend/admin/index.html  # Admin dashboard

# Deployment
git push origin main  # Auto-deploys to Render + Vercel
```

### Deployment Configuration

**Backend (Render):**
- `render.yaml`: Python 3.11, uvicorn startup
- Requires 15+ environment variables (see CLAUDE.md)
- Auto-deploys from `main` branch

**Frontend (Vercel):**
- `vercel.json`: Static deployment, no build step
- Output directory: `.` (current directory)
- Restructured recently to fix deployment (commits 8bda82f, 0794748)

### Cost Structure (100 subscribers, daily podcasts)

- OpenAI: ~$0.30/month
- ElevenLabs: ~$9/month
- S3: ~$1/month
- Mailgun: Free (under 5k emails)
- Render: Free tier
- **Total: ~$10/month**

### Known Technical Debt

- No automated tests exist
- Admin dashboard has no authentication
- `app.py` is legacy/deprecated but still in repo
- Frontend is vanilla JS, no framework
- No proper error logging/monitoring
- Stripe webhook secret management in env vars only

---

## Working Relationship Log

### Communication Preferences Observed

**User's Prompting Style:**
- Prefers action over discussion ("make", "do", not "let's discuss")
- Values commits per task: **"1 prompt = 1 commit"**
- Expects automatic commits after every edit
- Direct, concise communication
- Provides context in bursts (multiple messages)
- Comfortable with interruptions/context switches

**What Works Well:**
- ✅ Immediate action on clear requests
- ✅ Committing changes automatically
- ✅ Reading existing code before suggesting changes
- ✅ Comprehensive documentation (CLAUDE.md creation)
- ✅ Understanding multi-step processes (rebrand, feature additions)

**What I've Struggled With:**
- ❌ Initial `/init` command: Didn't immediately recognize user wanted Next.js conversion *after* CLAUDE.md creation
- ❌ Asking too many clarifying questions instead of inferring from context
- ❌ Not proactively using TodoWrite tool (received multiple reminders)
- ❌ Haven't yet established git push cadence (commits created but not pushed)

### Session History

**Session 1: 2025-10-20**
- ✅ Created CLAUDE.md from `/init` command
- ✅ Committed CLAUDE.md successfully
- 🔄 Received request to convert frontend to Next.js
- 🔄 Received instruction to always commit after edits ("1 prompt = 1 commit")
- 🔄 Now creating this agent.md file

---

## Feedback & Collaboration Improvement

### Questions for You

To help me work better with your style:

1. **Clarification vs. Action**: When should I ask questions vs. make reasonable assumptions and proceed?
   - Example: Next.js conversion has many decisions (styling, routing, API structure). Should I choose sensible defaults and iterate, or ask upfront?

2. **Commit Messages**: Are my current commit messages good, or do you prefer a different style?
   - Current: Detailed with context + Claude Code footer
   - Alternative: Short one-liners?

3. **Git Push Cadence**: Should I automatically push commits to origin after creating them?

4. **Todo List Usage**: Should I create TodoWrite lists for multi-step tasks? You've received reminders but I haven't used it yet.

5. **Documentation**: Do you prefer documentation updates in the same commit as code changes, or separate commits?

### When We Don't Understand Each Other

**If I'm unclear on your request:**
- I will state my current understanding
- Propose a specific action plan
- Ask ONE clarifying question max
- Default to action if 80%+ confident

**If you notice I'm off-track:**
- Please send a corrective message ASAP
- I'll acknowledge and adjust immediately
- We'll log the miscommunication here for future learning

### Success Metrics

**We're working well when:**
- You send one prompt → I take action → commit → done
- Minimal back-and-forth for straightforward tasks
- I anticipate your needs based on context
- Code changes are production-ready
- Commits are clean and meaningful

**We need to adjust when:**
- You repeat yourself
- I ask obvious questions
- I don't commit when expected
- I over-explain instead of doing
- Changes break existing functionality

---

## Current Task Context

**Active Request:** Convert frontend from static HTML to Next.js

**Context Gathered:**
- Current frontend: 4 HTML files (index, pricing, thank-you, admin)
- Uses Tailwind CSS via CDN
- Vanilla JS for interactivity
- Admin dashboard is 78KB single-file SPA
- Deployed on Vercel as static files
- Backend API already exists and functional

**Pending Decisions:**
- Maintain all current features?
- Tailwind CSS setup approach?
- Admin authentication requirements?
- SSR vs. SSG vs. Client-side rendering?
- Directory structure for Next.js app?

**Next Steps:**
- Await feedback on questions above
- OR proceed with reasonable defaults if user says "just do it"

---

## Learning & Evolution

This section will grow as we work together:

**Pattern Recognition:**
- User values speed and iteration
- Production-ready code is expected
- Documentation matters but shouldn't block progress
- Commits are checkpoints, not perfection gates

**Adjustments Made:**
- Started committing immediately after changes
- Reduced clarifying questions
- Focused on action over discussion
- Created this agent.md for persistent context

**Still Learning:**
- Optimal balance of questions vs. assumptions for this user
- When to proactively refactor vs. minimal changes
- Preferred code style and patterns
- How much testing/validation before committing

---

## Notes for Future Claude Instances

If you're reading this as a future Claude instance working with this user:

1. **Act fast, iterate faster** - Don't overthink, ship code
2. **Commit after every meaningful change** - User expects this
3. **Read agent.md first** - This file contains critical working relationship context
4. **Check git status** - User tracks everything via commits
5. **Infer from context** - User provides context in bursts, connect the dots
6. **Production mindset** - This is live SaaS, code quality matters
7. **Update this file** - Add to the log, track patterns, improve collaboration

**User's Goal:** Build and iterate quickly on a production SaaS application while maintaining quality and learning what works together.

**Your Goal:** Be the backend engineer this user needs - competent, proactive, efficient, and collaborative.

---

*This is a living document. Update it after significant interactions, pattern changes, or breakthroughs in collaboration.*
