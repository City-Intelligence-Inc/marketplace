# Agent Context Summary - Intelligent Podcasts Project

**Last Updated:** October 20, 2025
**Session Date:** October 20, 2025

---

## Project Overview

**Name:** Intelligent Podcasts
**Frontend:** Next.js 15.5.6 with TypeScript, App Router, Turbopack
**Backend:** FastAPI at https://four0k-arr-saas.onrender.com
**UI Library:** shadcn/ui (exclusively)
**Styling:** Tailwind CSS v4
**Package Manager:** pnpm

**Purpose:** Platform for curated AI-generated podcast summaries of academic papers, delivered daily to subscribers.

---

## Project Structure

```
/Users/arihantchoudhary/GitHub/marketplace/
├── frontend/                    # ACTIVE - Current working directory
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Home page with Hero
│   │   │   ├── episodes/page.tsx   # Episodes listing
│   │   │   └── admin/
│   │   │       ├── page.tsx    # FULL ADMIN DASHBOARD (active)
│   │   │       └── page-old.tsx    # Simple admin (backup)
│   │   ├── components/
│   │   │   ├── Hero.tsx        # Landing page hero
│   │   │   ├── Navbar.tsx      # Navigation
│   │   │   └── TrustedBy.tsx   # Logo carousel/grid
│   │   └── lib/
│   │       └── api.ts          # API functions
│   └── public/
│       └── logos/              # University/company logos
├── frontend-broken/            # DO NOT TOUCH - Old broken version
├── frontend-broken02/          # DO NOT TOUCH - Previous broken version
└── backend/                    # Backend FastAPI code
```

---

## Recent Session Work (October 20, 2025)

### 1. Logo Management

**Added Logos:**
- Harvard Law School (`harvard-law.png` - 8KB)
- Stanford University (`stanford.avif` - 14KB)
- UC Berkeley (`berkeley.png` - 56KB)
- University of Pennsylvania (`penn.png` - 157KB)
- Purdue University (`purdue.png` - 52KB)
- Meta (`meta.png` - 5.8KB)
- IIT Kharagpur (`iit-kgp.svg` - 97KB)

**Logo Sizes (Final):**
- Harvard: 40px
- Stanford: 80px (largest)
- Berkeley: 40px
- Penn: 60px
- Purdue: 40px
- Meta: 30px (smallest)
- IIT Kharagpur: 60px

**Layout:** 2 rows of 3 logos in grid (removed carousel)
- IIT Kharagpur has reduced left padding (`pl-0`)
- All logos have `unoptimized` prop for proper rendering

**Files Removed:**
- `harvard-law.jpeg` (replaced with PNG)
- `purdue.webp` (kept only PNG)
- `penn.webp` (kept only PNG)

### 2. Hero Component Updates

**File:** `/frontend/src/components/Hero.tsx`

**Categories Added to Rotating List (31 total):**
```javascript
const categories = [
  "Mathematics",
  "AI",
  "Crypto",
  "Quantum Computing",
  "Education",
  "Patent Law",
  "IP Law",
  "Constitutional Law",
  "Corporate Law",
  "Healthcare",
  "Climate Science",
  "Biotechnology",
  "Economics",
  "Psychology",
  "Space Exploration",
  "Neuroscience",
  "Physics",
  "Finance",
  "Cybersecurity",
  "Data Science",
  "Politics",
  "Philosophy",
  "Engineering",
  "Chemistry",
  "Antitrust Law",
  "Securities Law",
  "UI/UX Design",
  "Product Design",
  "Architecture",
  "Graphic Design",
  "Industrial Design",
];
```

**Key Features:**
- Rotating category animation (3s interval)
- Email subscription form
- TrustedBy logos section below
- Mars-themed background with gradient orbs

### 3. Admin Dashboard (FULLY FUNCTIONAL)

**File:** `/frontend/src/app/admin/page.tsx` (ACTIVE)
**Backup:** `/frontend/src/app/admin/page-old.tsx`

**Password:** `podcast025`

**Complete 4-Step Workflow:**

#### Step 1: Add Paper
**Three Tabs:**

1. **From arXiv:**
   - Endpoint: `/api/admin/fetch-paper` (metadata only)
   - With checkbox: `/api/admin/extract-pdf-from-arxiv` (full text)

2. **Upload PDF:**
   - Endpoint: `/api/admin/upload-pdf`
   - Requires: PDF file + paper URL
   - **Editable Preview:** Fix parsing errors (especially author names)
   - Blue info box explaining editable fields
   - Amber warning box about fixing parsing errors
   - Fields: Title, Authors (comma-separated), Abstract
   - Big green "Save Changes & Continue" button

3. **From Text:**
   - Endpoint: `/api/admin/generate-from-text`
   - Custom text input (min 100 chars)
   - Auto-generates transcript

**Error Handling:**
- Detailed console logging
- Parse and display backend error messages
- Handle authors as string vs array

#### Step 2: Generate Transcript
- Loads personas from `/api/admin/personas`
- Host Persona dropdown
- Expert Persona dropdown
- Technical levels: baby, highschool, undergrad, graduate, expert, nobel
- Custom topics (optional)
- Use full text checkbox
- Generates via `/api/admin/generate-transcript`
- **Editable transcript** with edit/save toggle

#### Step 3: Convert to Audio
- Loads voices from `/api/admin/individual-voices`
- Host Voice dropdown + Preview button
- Expert Voice dropdown + Preview button
- Preview endpoint: `/api/admin/voice-preview/{voice_key}`
- Converts via `/api/admin/convert-to-audio`
- Shows audio player when complete

#### Step 4: Send to Users
- Loads users from `/api/admin/users`
- Checkbox selection per user
- Select All / Deselect All toggle
- **Send to Selected:** `/api/admin/send-podcast-to-users`
- **Send to ALL:** `/api/admin/send-podcast`

### 4. Console Logging (Comprehensive)

**Added detailed logging throughout admin:**

**On Page Mount:**
```
=== ADMIN PAGE MOUNTED ===
API URL: https://four0k-arr-saas.onrender.com
Checking authentication status...
Auth status from session: true
✓ User is authenticated
=== ADMIN PAGE READY ===
```

**Data Loading:**
- 📊 Stats: Response status + data
- 👥 Users: Count + full list
- 🎭 Personas: Count + details
- 🎤 Voices: Count + details
- 📄 Paper data: Full object logged

**LLM Context Logging:**
```javascript
=== 🤖 GENERATING TRANSCRIPT WITH LLM ===
📝 CONTEXT BEING SENT TO LLM:
{
  paper_id: "..."
  paper_title: "..."
  paper_authors: [...]
  use_full_text: true/false
  technical_level: "undergrad"
  host_persona: "curious_journalist"
  expert_persona: "academic_expert"
  custom_topics: "..."
  paper_abstract: "..."
  full_text_included: "YES - full paper content" or "NO - abstract only"
}
==================================================
📡 Sending request to: [endpoint]
Response status: 200
✓ Transcript generated successfully
Transcript length: 5432 characters
Transcript preview: [first 300 chars]
=== END LLM GENERATION ===
```

**Paper Operations:**
```
💾 Saving paper edits...
Title: [title]
Authors: [authors]
✓ Updated paper data: {full object}
```

**Upload Operations:**
```
Uploading PDF: [filename] URL: [url]
Response status: 200
Received paper data: {...}
```

### 5. Episodes Page

**File:** `/frontend/src/app/episodes/page.tsx`

**Features:**
- Fetches from `/api/episodes`
- Grid layout (1/2/3 columns responsive)
- Shows: title, authors, date, audio player
- "View Paper" button (if URL available)
- Loading and error states

### 6. API Integration

**File:** `/frontend/src/lib/api.ts`

**Functions:**
```typescript
subscribeEmail(email: string)
getEpisodes()
```

**Base URL:** `https://four0k-arr-saas.onrender.com`

---

## Backend API Endpoints

**Admin Endpoints:**
- `POST /api/admin/fetch-paper` - Fetch arXiv metadata
- `POST /api/admin/extract-pdf-from-arxiv` - Fetch arXiv with full text
- `POST /api/admin/upload-pdf` - Upload PDF and extract
- `POST /api/admin/generate-from-text` - Generate from custom text
- `POST /api/admin/generate-transcript` - Generate podcast transcript
- `POST /api/admin/convert-to-audio` - Convert transcript to audio
- `GET /api/admin/personas` - Get available personas
- `GET /api/admin/individual-voices` - Get ElevenLabs voices
- `GET /api/admin/voice-preview/{voice_key}` - Preview voice
- `GET /api/admin/users` - Get all users
- `POST /api/admin/send-podcast-to-users` - Send to selected
- `POST /api/admin/send-podcast` - Send to all
- `GET /api/admin/stats` - Dashboard statistics

**Public Endpoints:**
- `POST /api/signup` - Email subscription
- `GET /api/episodes` - Get all published podcasts

---

## Key Design Decisions

1. **Only shadcn/ui components** - No other UI libraries
2. **Admin at `/admin` route** - Not in navbar, password protected
3. **White background design** - Matches home page aesthetic
4. **Editable PDF preview** - Fix OCR parsing errors (authors, title, abstract)
5. **Comprehensive logging** - Debug in console with detailed context
6. **Full mobile responsiveness** - Bottom nav bar on mobile

---

## Important Notes

### Logo Rendering Fix
- Added `unoptimized` prop to all Image components
- Use inline `style` prop for dynamic heights
- Harvard logo switched from JPEG to PNG

### Upload PDF Workflow
1. Upload PDF file + provide paper URL
2. Backend extracts text and metadata
3. **Review editable preview** (critical for fixing author names)
4. Save edits before continuing
5. Generate transcript in Step 2

### Admin Access
- Password: `podcast025`
- Session-based auth (sessionStorage)
- Auto-login on refresh if authenticated

### Testing Checklist
1. Hard refresh page (Ctrl+Shift+R)
2. Open console (F12)
3. Login to admin
4. Try uploading a PDF
5. Check console for detailed logs
6. Fix any author parsing errors in preview
7. Generate transcript and review LLM context logs

---

## Recent Commits (Latest First)

```
24df736 - Further reduce logo sizes - Harvard, Berkeley, Purdue smaller, Meta much smaller
9d083ae - Reduce logo sizes for Harvard, Berkeley, Purdue, and Meta
24705a6 - Add detailed console logging to admin dashboard
7295671 - Add Penn logo to trusted by section
25e04bf - Change logos to 2 rows of 3 grid and fix IIT spacing
0dc034b - Update to new Harvard and Purdue logos
a79b93b - Activate full admin dashboard with all features
6aca3ff - Fix upload PDF button with better error handling
97a23f4 - Improve Upload PDF section with better editing UI for parsing errors
```

---

## Common Issues & Solutions

### Issue: Harvard logo not rendering
**Solution:** Changed to PNG, added `unoptimized` prop

### Issue: Upload PDF button not working
**Solution:** Added detailed error handling and console logging

### Issue: Authors parsed incorrectly
**Solution:** Added editable preview with clear instructions and save button

### Issue: Logos different sizes
**Solution:** Individual height control per logo via `style` prop

### Issue: IIT logo too much left padding
**Solution:** Conditional `pl-0` for IIT Kharagpur only

---

## Next Steps / TODO

1. **Test complete admin workflow end-to-end**
   - Upload PDF → Fix authors → Generate transcript → Convert to audio → Send

2. **Monitor console logs** for any errors during workflow

3. **Verify all logos render correctly** after size changes

4. **Test email sending** to selected users vs all users

---

## Git Workflow

**Current Branch:** `main`
**Remote:** `github.com:City-Intelligence-Inc/marketplace.git`

**Standard commit format:**
```bash
git add [files]
git commit -m "Summary

Details...

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

---

## Component File Paths

**Admin Dashboard (Main):**
`/Users/arihantchoudhary/GitHub/marketplace/frontend/src/app/admin/page.tsx`

**Hero Component:**
`/Users/arihantchoudhary/GitHub/marketplace/frontend/src/components/Hero.tsx`

**TrustedBy Component:**
`/Users/arihantchoudhary/GitHub/marketplace/frontend/src/components/TrustedBy.tsx`

**Episodes Page:**
`/Users/arihantchoudhary/GitHub/marketplace/frontend/src/app/episodes/page.tsx`

**API Functions:**
`/Users/arihantchoudhary/GitHub/marketplace/frontend/src/lib/api.ts`

---

## Environment

- **Working Directory:** `/Users/arihantchoudhary/GitHub/marketplace/frontend`
- **Node/pnpm:** Managed via pnpm
- **Git Status:** Clean (as of last commit)
- **Deployment:** Vercel (Root Directory set to `frontend`)

---

## Critical Rules

1. ✅ **ONLY work in `/frontend` directory**
2. ❌ **DO NOT touch `frontend-broken` or `frontend-broken02`**
3. ✅ **Only use shadcn/ui components**
4. ✅ **Always add detailed console logging**
5. ✅ **Test with console open (F12)**
6. ✅ **Hard refresh after deployments**

---

**End of Context Summary**
