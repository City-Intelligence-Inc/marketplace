# Backend API

Flask backend API for handling email signups.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure AWS credentials:
   - Copy `.env.example` to `.env`
   - Add your AWS credentials
   - Or use AWS CLI configured credentials

3. Run the server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## Endpoints

### POST /api/signup
Submit email for waitlist signup.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success - 201):**
```json
{
  "message": "Successfully added to waitlist!",
  "email": "user@example.com"
}
```

**Response (Already Exists - 409):**
```json
{
  "message": "This email is already on the waitlist"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```
