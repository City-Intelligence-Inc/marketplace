# Deployment Guide

## Infrastructure (DynamoDB) - COMPLETED

Both DynamoDB tables are already deployed:
- `paper-links` - For storing paper links
- `email-signups` - For storing email signups

## Backend Deployment to Render

### Step 1: Push Code to GitHub

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Add backend and frontend for email signups"
git push origin main
```

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name:** 40k-arr-saas-backend
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Plan:** Free

### Step 3: Set Environment Variables

In Render, add these environment variables:

**Required:**
- `AWS_REGION` = `us-east-1`
- `EMAIL_TABLE_NAME` = `email-signups`
- `AWS_ACCESS_KEY_ID` = (your AWS access key)
- `AWS_SECRET_ACCESS_KEY` = (your AWS secret key)
- `FLASK_ENV` = `production`

**Optional:**
- `ALLOWED_ORIGINS` = (your frontend URL, e.g., `https://yourdomain.com`)

### Step 4: Deploy

Click "Create Web Service" and wait for deployment to complete.

### Step 5: Get Your Backend URL

After deployment, Render will provide a URL like:
`https://40k-arr-saas-backend.onrender.com`

## Frontend Deployment

### Option 1: Netlify/Vercel (Recommended)

1. Update `frontend/index.html` - replace the fetch URL:
```javascript
const response = await fetch('https://YOUR-RENDER-URL.onrender.com/api/signup', {
```

2. Deploy to Netlify:
   - Drag and drop the `frontend` folder
   - Or connect your GitHub repo

### Option 2: GitHub Pages

1. Update the API URL in `frontend/index.html`
2. Push to GitHub
3. Enable GitHub Pages in repository settings
4. Select `frontend` as the source folder

## AWS IAM Permissions

Your AWS credentials need these DynamoDB permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:050451400186:table/email-signups",
        "arn:aws:dynamodb:us-east-1:050451400186:table/email-signups/index/*"
      ]
    }
  ]
}
```

## Testing

After deployment, test the API:

```bash
curl -X POST https://YOUR-RENDER-URL.onrender.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Health check:
```bash
curl https://YOUR-RENDER-URL.onrender.com/api/health
```

## Monitoring

- **Render Logs:** Check logs in Render dashboard
- **DynamoDB:** Monitor table in AWS Console
- **Costs:** Free tier includes:
  - Render: 750 hours/month
  - DynamoDB: 25GB storage, 200M requests/month
