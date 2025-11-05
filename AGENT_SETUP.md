# Agent Subscribe System - Setup Guide

## Overview
This system allows you to create agents and let users subscribe to them from any website using embeddable widgets or direct API calls.

## What Was Built

### 1. Backend API
- **Endpoint**: `POST /api/agents/subscribe`
- **Purpose**: Add subscribers to agents
- **No authentication required** - designed to be called from any frontend

### 2. Frontend Widget Page
- **URL**: `/agents` (e.g., `http://localhost:3000/agents`)
- **Purpose**: Generate copy-paste code for developers
- **Features**:
  - HTML/JavaScript embed code
  - React component code
  - cURL examples
  - Live API documentation

### 3. DynamoDB Table
- **Table Name**: `agents`
- **Primary Key**: `agent_id`
- **Fields**:
  - `agent_id`: Unique identifier for the agent
  - `name`: Display name
  - `description`: What the agent does
  - `category`: Type of content (ai, crypto, quantum, etc.)
  - `owner_email`: Creator's email
  - `subscribers`: List of subscriber emails
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

---

## Setup Instructions

### Step 1: Deploy DynamoDB Table

You have two options:

#### Option A: Using Terraform (Recommended)

```bash
cd infra
terraform init
terraform apply
```

This will create the `agents` table along with your other tables.

#### Option B: Manual Creation via AWS Console

1. Go to AWS DynamoDB Console
2. Click "Create table"
3. **Table name**: `agents`
4. **Partition key**: `agent_id` (String)
5. Click "Create table"

### Step 2: Add Environment Variable

Add this to your backend `.env` file:

```bash
AGENTS_TABLE_NAME=agents
```

### Step 3: Create Your First Agent

Since there's no UI for creating agents yet, you can create one manually:

#### Option A: Using AWS DynamoDB Console

1. Go to DynamoDB > Tables > agents
2. Click "Create item"
3. Add these fields:
```json
{
  "agent_id": "research_club",
  "name": "Research Club",
  "description": "Weekly AI research summaries",
  "category": "ai",
  "owner_email": "you@example.com",
  "subscribers": [],
  "created_at": 1699200000000,
  "updated_at": 1699200000000
}
```

#### Option B: Using AWS CLI

```bash
aws dynamodb put-item \
    --table-name agents \
    --item '{
        "agent_id": {"S": "research_club"},
        "name": {"S": "Research Club"},
        "description": {"S": "Weekly AI research summaries"},
        "category": {"S": "ai"},
        "owner_email": {"S": "you@example.com"},
        "subscribers": {"L": []},
        "created_at": {"N": "1699200000000"},
        "updated_at": {"N": "1699200000000"}
    }'
```

### Step 4: Get Your Embeddable Widget

1. Start your frontend: `cd frontend && npm run dev`
2. Visit `http://localhost:3000/agents`
3. Enter your `agent_id` (e.g., "research_club")
4. Copy the code you want to use

---

## Usage Examples

### Example 1: HTML Website

Add this to any HTML page:

```html
<!-- Copy the entire code block from the /agents page -->
<div id="city-secretary-subscribe">
  <form id="subscribe-form-research_club">
    <!-- Form fields here -->
  </form>
</div>
<script>
  // Subscription logic here
</script>
```

### Example 2: React Component

```jsx
import { useState } from 'react';

function SubscribeButton() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('https://your-api.com/api/agents/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_id: 'research_club',
        email: email
      })
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Subscribe</button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

### Example 3: Direct API Call

```bash
curl -X POST https://your-api.com/api/agents/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "research_club",
    "email": "user@example.com"
  }'
```

**Response:**
```json
{
  "message": "Successfully subscribed to Research Club",
  "agent_name": "Research Club",
  "agent_id": "research_club",
  "subscriber_count": 1
}
```

---

## API Reference

### Subscribe to Agent

**Endpoint**: `POST /api/agents/subscribe`

**Request Body**:
```json
{
  "agent_id": "string (required)",
  "email": "string (required, valid email)"
}
```

**Success Response** (200):
```json
{
  "message": "Successfully subscribed to Agent Name",
  "agent_name": "Agent Name",
  "agent_id": "agent_id",
  "subscriber_count": 42
}
```

**Already Subscribed** (200):
```json
{
  "message": "Already subscribed to Agent Name",
  "agent_name": "Agent Name",
  "agent_id": "agent_id"
}
```

**Error Responses**:
- **404**: Agent not found
- **422**: Invalid email format
- **500**: Server error

---

## Testing

### Test Locally

1. Start backend: `cd backend && uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Visit `http://localhost:3000/agents`
4. Copy the HTML embed code
5. Create a test HTML file and open it in your browser
6. Enter an email and click subscribe
7. Check DynamoDB to see if the email was added to the subscribers list

### Test the API Directly

```bash
# Test subscription
curl -X POST http://localhost:8000/api/agents/subscribe \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "research_club", "email": "test@example.com"}'

# Check DynamoDB
aws dynamodb get-item \
  --table-name agents \
  --key '{"agent_id": {"S": "research_club"}}'
```

---

## Next Steps

### Future Enhancements
1. **Create Agent UI**: Add a page to create new agents without manual DynamoDB edits
2. **Unsubscribe Endpoint**: Add `POST /api/agents/unsubscribe`
3. **Agent Dashboard**: View all subscribers, send broadcasts
4. **Email Verification**: Confirm subscriptions via email
5. **Webhook Support**: Notify when someone subscribes
6. **Analytics**: Track subscriber growth, engagement

---

## Troubleshooting

### "Agent not found" error
- Make sure the agent exists in DynamoDB
- Check that the `agent_id` matches exactly (case-sensitive)
- Verify `AGENTS_TABLE_NAME` is set correctly in `.env`

### CORS errors
- Make sure your backend has CORS configured for your frontend domain
- Check the `ALLOWED_ORIGINS` environment variable

### Subscribers not being added
- Check CloudWatch logs for errors
- Verify IAM permissions for DynamoDB
- Make sure the `subscribers` field is initialized as an empty list `[]`

---

## File Structure

```
marketplace/
├── backend/
│   ├── main.py                    # API endpoint is here
│   └── .env                       # Add AGENTS_TABLE_NAME=agents
├── frontend/
│   └── src/
│       └── app/
│           └── agents/
│               └── page.tsx       # Widget generator page
├── infra/
│   ├── main.tf                    # Terraform config with agents table
│   ├── variables.tf               # Added agents_table_name variable
│   └── outputs.tf                 # Added agents table outputs
└── AGENT_SETUP.md                 # This file
```

---

## Support

If you run into issues:
1. Check the backend logs: `cd backend && uvicorn main:app --reload`
2. Inspect browser console for frontend errors
3. Verify DynamoDB table exists and has correct permissions
4. Test the API directly with curl to isolate issues

Happy building! 🚀
