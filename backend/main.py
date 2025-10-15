from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import boto3
from datetime import datetime
import os
from botocore.exceptions import ClientError

app = FastAPI(title="40k ARR SaaS API")

# Configure CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ['*'] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'us-east-1'))
email_table = dynamodb.Table(os.getenv('EMAIL_TABLE_NAME', 'email-signups'))

class EmailSignup(BaseModel):
    email: EmailStr
    name: str = None

class SignupResponse(BaseModel):
    message: str
    email: str

@app.get("/")
async def root():
    return {"message": "40k ARR SaaS API is running"}

@app.get("/api/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/signup", response_model=SignupResponse, status_code=201)
async def signup(data: EmailSignup):
    try:
        email = data.email.lower()
        timestamp = int(datetime.utcnow().timestamp())

        # Prepare item for DynamoDB
        item = {
            'email': email,
            'signup_timestamp': timestamp,
            'created_at': datetime.utcnow().isoformat()
        }

        # Add name if provided
        if data.name:
            item['name'] = data.name.strip()

        # Store in DynamoDB
        try:
            email_table.put_item(
                Item=item,
                ConditionExpression='attribute_not_exists(email)'
            )

            return SignupResponse(
                message='Successfully added to waitlist!',
                email=email
            )

        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                raise HTTPException(
                    status_code=409,
                    detail='This email is already on the waitlist'
                )
            raise

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail='An error occurred. Please try again later.'
        )
