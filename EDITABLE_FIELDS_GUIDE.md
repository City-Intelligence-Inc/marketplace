# Editable Metadata Fields - Admin Guide

## Overview
All paper metadata fields are now **fully editable** in the admin panel BEFORE you generate the podcast. This allows you to fix any parsing errors or make adjustments.

---

## How It Works

### Step 1: Fetch Paper
1. Go to admin dashboard
2. Paste paper URL (arXiv, research paper, etc.) OR upload PDF OR paste text
3. Click "Fetch Paper" or "Upload PDF" or "Generate from Text"

### Step 2: Review & Edit Metadata
After fetching, you'll see **three editable fields**:

#### ✏️ Title (Large input field)
- **What it is:** The paper's title
- **Why edit:** Fix capitalization, remove extra characters, shorten if too long
- **Example fix:**
  - Before: `ATTENTION IS ALL YOU NEED`
  - After: `Attention Is All You Need`

#### ✏️ Authors (Input field)
- **What it is:** Author names (comma-separated)
- **Why edit:** Fix parsing errors, add missing names, correct spelling
- **Example fix:**
  - Before: `Smith, J., Doe, J.`
  - After: `John Smith, Jane Doe`

#### ✏️ Abstract (Large textarea)
- **What it is:** Paper summary/description
- **Why edit:** Clean up formatting, fix encoding issues, shorten if needed
- **Example fix:** Remove weird characters or truncation artifacts

---

## Visual Guide

```
┌─────────────────────────────────────────────────┐
│ Step 1: Fetch Paper                            │
│ [Paste arXiv URL]                              │
│ [Fetch Paper Button]                           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Title:                                          │
│ ┌─────────────────────────────────────────────┐ │
│ │ Attention Is All You Need           [EDIT] │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Authors:                                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ Vaswani et al.                      [EDIT] │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Abstract:                                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ The dominant sequence transduction...       │ │
│ │                                     [EDIT] │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ✏️ All fields above are editable!              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Step 2: Generate Transcript                    │
│ [Generate Podcast Button]                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Step 3: Convert to Audio                       │
│ Uses your EDITED metadata ✓                    │
└─────────────────────────────────────────────────┘
```

---

## What Gets Saved

When you click **"Convert to Audio"**, the system:

1. ✅ **Updates the paper record** in the database with your edited values
2. ✅ **Creates the podcast** using the edited title, authors, and abstract
3. ✅ **Displays edited metadata** in the podcast gallery
4. ✅ **Sends emails** with the corrected information

**Result:** Your edits are PERMANENT and appear everywhere!

---

## Common Use Cases

### 1. Author Name Parsing Failed
**Problem:** arXiv returns `["Smith, J.", "Doe, J."]` but you want full names

**Solution:**
```
Before: Smith, J., Doe, J.
After:  John Smith, Jane Doe
```
Just type the corrected names and continue!

---

### 2. Title Has Weird Formatting
**Problem:** Title is all caps or has LaTeX artifacts

**Solution:**
```
Before: DEEP LEARNING FOR \\TEXTBF{NLPS}
After:  Deep Learning for NLP
```
Clean it up manually!

---

### 3. Abstract is Truncated
**Problem:** Only first 200 characters were extracted

**Solution:**
- Copy the full abstract from the paper
- Paste into the abstract field
- System will use the complete version

---

### 4. Custom Content Needs Better Metadata
**Problem:** You pasted blog content but title is generic

**Solution:**
```
Before: Custom Content
After:  The Future of AI Assistants - Blog Post Summary
```
Make it descriptive!

---

## Technical Details

### Frontend Changes
- `paperTitleEdit` - Input field for title
- `paperAuthorsEdit` - Input field for authors
- `paperAbstractEdit` - Textarea for abstract

### Backend API
The `/api/admin/convert-to-audio` endpoint now accepts:
- `edited_title` (optional) - Overrides paper title
- `edited_authors` (optional) - Overrides author list
- `edited_abstract` (optional) - Overrides abstract

### Database Updates
When edited metadata is provided:
1. **Paper table** gets updated with new values
2. **Podcast table** stores the corrected metadata
3. Future operations use the edited version

---

## Important Notes

⚠️ **Edit BEFORE generating audio**
- You can edit anytime after fetching
- But must edit BEFORE clicking "Convert to Audio"
- Once audio is generated, edits won't retroactively change it

✅ **Edits are saved permanently**
- Changed metadata persists in the database
- Emails sent later will use the corrected version

🔄 **Re-fetching resets edits**
- If you fetch a NEW paper, fields reset
- But the old podcast keeps your edited metadata

---

## Pro Tips

1. **Always review before generating** - Check all three fields for accuracy
2. **Author formatting** - Use "FirstName LastName" format for readability
3. **Keep titles concise** - Email subject lines work best under 70 chars
4. **Abstract brevity** - First 2-3 sentences are usually enough

---

## Quick Reference

| Field | Purpose | Common Fixes |
|-------|---------|--------------|
| **Title** | Podcast subject line | Capitalization, remove LaTeX |
| **Authors** | Attribution credit | Full names vs initials |
| **Abstract** | Email preview text | Truncation, encoding issues |

---

**That's it!** All metadata is now under your control. Fix parsing errors before finalizing the podcast. 🎉
