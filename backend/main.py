from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, EmailStr
import boto3
from datetime import datetime, timedelta
import os
from botocore.exceptions import ClientError
from typing import List, Optional
from services.arxiv_service import ArxivService
from services.podcast_service import PodcastService
from services.email_service import EmailService
from services.pdf_service import PDFService
import stripe
import uuid
from pathlib import Path

app = FastAPI(title="Research Paper Podcast API")

# Get the directory containing the frontend files
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')

# Stripe Price IDs
INDIVIDUAL_MONTHLY_PRICE_ID = os.getenv('INDIVIDUAL_MONTHLY_PRICE_ID', 'price_1SIbzVRhG8asVSl57FKrrQ1Q')
INDIVIDUAL_YEARLY_PRICE_ID = os.getenv('INDIVIDUAL_YEARLY_PRICE_ID', 'price_1SIc0VRhG8asVSl5q67CtVLa')
TEAM_YEARLY_PRICE_ID = os.getenv('TEAM_YEARLY_PRICE_ID', 'price_1SIc1ORhG8asVSl5e6nyAmH3')

# Configure CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ['*'] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
arxiv_service = ArxivService()
podcast_service = PodcastService()
email_service = EmailService()

# Initialize DynamoDB clients
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'us-east-1'))
email_table = dynamodb.Table(os.getenv('EMAIL_TABLE_NAME', 'email-signups'))
paper_table = dynamodb.Table(os.getenv('PAPER_TABLE_NAME', 'paper-links'))
podcast_table = dynamodb.Table(os.getenv('PODCASTS_TABLE_NAME', 'podcasts'))
paper_requests_table = dynamodb.Table(os.getenv('PAPER_REQUESTS_TABLE_NAME', 'paper-requests'))

# ===== Models =====

class EmailSignup(BaseModel):
    email: EmailStr
    name: str = None

class SignupResponse(BaseModel):
    message: str
    email: str

class FetchPaperRequest(BaseModel):
    arxiv_url: str

class SendPodcastRequest(BaseModel):
    podcast_id: str

class CheckoutRequest(BaseModel):
    email: EmailStr
    plan: str  # 'individual_monthly', 'individual_yearly', 'team'
    is_gift: bool = False
    gift_recipient_email: EmailStr = None
    gift_recipient_name: str = None

class PaperRequestModel(BaseModel):
    email: EmailStr
    paper_url: str
    paper_title: str = None
    reason: str = None

# ===== Public Endpoints =====

@app.get("/")
async def root():
    return {"message": "40k ARR SaaS API is running", "version": "2.0-personas"}

@app.post("/api/create-podcast-from-text")
async def create_podcast_from_text(
    text: str = Form(...),
    title: str = Form("Custom Content"),
    email: EmailStr = Form(None),
    voice_preset: str = Form('default')
):
    """Public endpoint: Generate complete podcast (transcript + audio) from text"""
    try:
        print(f"Public text-to-podcast request, title: {title}, email: {email}, voice_preset: {voice_preset}")
        print(f"Text length: {len(text)} characters")

        if len(text) < 100:
            raise HTTPException(status_code=400, detail="Text must be at least 100 characters")

        # Truncate text if too long to avoid OpenAI rate limits
        # GPT-4o has ~30k TPM limit, so limit input to ~20k characters (~5k tokens)
        max_chars = 20000
        if len(text) > max_chars:
            print(f"Truncating text from {len(text)} to {max_chars} characters")
            text = text[:max_chars] + "\n\n[Content truncated for length...]"

        # Generate transcript
        transcript = podcast_service.generate_podcast_script_from_text(text, title)

        # Generate audio with selected voice preset
        podcast_id = str(uuid.uuid4())
        print(f"Converting transcript to audio for podcast {podcast_id}...")
        audio_url = podcast_service.generate_audio(transcript, podcast_id, voice_preset)

        # Store minimal paper data for tracking
        paper_id = f"public-text-{int(datetime.utcnow().timestamp())}"
        paper_data = {
            'paper_id': paper_id,
            'title': title,
            'authors': ['Public User'],
            'abstract': text[:500] + "..." if len(text) > 500 else text,
            'pdf_url': 'N/A',
            'published': datetime.utcnow().isoformat(),
            'categories': ['public-text'],
            'created_at': int(datetime.utcnow().timestamp())
        }
        paper_table.put_item(Item=paper_data)

        # Store podcast
        podcast_item = {
            'podcast_id': podcast_id,
            'paper_id': paper_id,
            'paper_title': title,
            'paper_authors': 'Public User',
            'paper_url': 'N/A',
            'audio_url': audio_url,
            'transcript': transcript,
            'created_at': int(datetime.utcnow().timestamp()),
            'sent_at': None,
            'recipients_count': 0,
            'public': True
        }
        podcast_table.put_item(Item=podcast_item)

        # If email provided, add to signup list
        if email:
            try:
                email_lower = email.lower()
                timestamp = int(datetime.utcnow().timestamp())
                email_table.put_item(
                    Item={
                        'email': email_lower,
                        'signup_timestamp': timestamp,
                        'created_at': datetime.utcnow().isoformat(),
                        'subscribed': True,
                        'last_email_sent': None
                    },
                    ConditionExpression='attribute_not_exists(email)'
                )
                email_service.send_welcome_email(email_lower, None)
            except:
                pass  # Email already exists, ignore

        return {
            "podcast_id": podcast_id,
            "audio_url": audio_url,
            "transcript": transcript,
            "title": title
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating podcast from text: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error creating podcast: {str(e)}")

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
            'created_at': datetime.utcnow().isoformat(),
            'subscribed': True,  # New field for tracking subscription status
            'last_email_sent': None
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

            # Send welcome email
            email_service.send_welcome_email(email, data.name)

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

@app.post("/api/unsubscribe")
async def unsubscribe(email: EmailStr):
    """Unsubscribe user from emails"""
    try:
        email_lower = email.lower()
        email_table.update_item(
            Key={'email': email_lower},
            UpdateExpression='SET subscribed = :val',
            ExpressionAttributeValues={':val': False}
        )
        return {"message": "Successfully unsubscribed"}
    except Exception as e:
        print(f"Error unsubscribing: {e}")
        raise HTTPException(status_code=500, detail="Error unsubscribing")

@app.get("/api/episodes")
async def get_episodes():
    """Get all published podcast episodes for public display"""
    try:
        # Scan for all podcasts that have been sent
        response = podcast_table.scan(
            FilterExpression='attribute_exists(sent_at)'
        )

        podcasts = response.get('Items', [])

        # Sort by sent_at descending (most recent first)
        podcasts.sort(key=lambda x: int(x.get('sent_at') or 0), reverse=True)

        # Format episodes for public display
        formatted_episodes = []
        for p in podcasts:
            try:
                sent_at = p.get('sent_at')
                if sent_at and sent_at != 'None':
                    formatted_episodes.append({
                        "podcast_id": p['podcast_id'],
                        "paper_title": p.get('paper_title', 'Unknown'),
                        "paper_authors": p.get('paper_authors', 'Unknown'),
                        "paper_url": p.get('paper_url', '#'),
                        "audio_url": p.get('audio_url', ''),
                        "sent_at": int(sent_at)
                    })
            except Exception as e:
                print(f"Error formatting episode {p.get('podcast_id')}: {e}")
                continue

        return {"episodes": formatted_episodes}

    except Exception as e:
        print(f"Error fetching episodes: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error fetching episodes: {str(e)}")

# ===== Stripe Endpoints =====

@app.post("/api/create-checkout")
async def create_checkout(request: CheckoutRequest):
    """Create a Stripe Checkout session for subscription"""
    try:
        # Map plan names to Price IDs
        price_id_map = {
            'individual_monthly': INDIVIDUAL_MONTHLY_PRICE_ID,
            'individual_yearly': INDIVIDUAL_YEARLY_PRICE_ID,
            'team': TEAM_YEARLY_PRICE_ID
        }

        price_id = price_id_map.get(request.plan)
        if not price_id:
            raise HTTPException(status_code=400, detail="Invalid plan selected")

        # Determine success and cancel URLs
        success_url = os.getenv('SUCCESS_URL', 'https://your-domain.com/thank-you.html') + '?session_id={CHECKOUT_SESSION_ID}'
        cancel_url = os.getenv('CANCEL_URL', 'https://your-domain.com/pricing.html')

        # Create checkout session params
        checkout_params = {
            'payment_method_types': ['card'],
            'line_items': [{
                'price': price_id,
                'quantity': 1 if request.plan != 'team' else 5,  # Team plan includes 5 seats
            }],
            'mode': 'subscription',
            'success_url': success_url,
            'cancel_url': cancel_url,
            'customer_email': request.email,
            'metadata': {
                'plan': request.plan,
                'email': request.email
            },
            'subscription_data': {
                'metadata': {
                    'plan': request.plan,
                    'email': request.email
                }
            }
        }

        # Handle gift subscriptions
        if request.is_gift and request.gift_recipient_email:
            checkout_params['metadata']['is_gift'] = 'true'
            checkout_params['metadata']['gift_recipient_email'] = request.gift_recipient_email
            checkout_params['metadata']['gift_recipient_name'] = request.gift_recipient_name or ''
            checkout_params['subscription_data']['metadata']['is_gift'] = 'true'
            checkout_params['subscription_data']['metadata']['gift_recipient_email'] = request.gift_recipient_email

        # Create the checkout session
        session = stripe.checkout.Session.create(**checkout_params)

        return {
            'checkout_url': session.url,
            'session_id': session.id
        }

    except stripe.error.StripeError as e:
        print(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error creating checkout: {e}")
        raise HTTPException(status_code=500, detail="Error creating checkout session")

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')

        # Verify webhook signature
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError as e:
            print(f"Webhook signature verification failed: {e}")
            raise HTTPException(status_code=400, detail="Invalid signature")

        # Handle different event types
        event_type = event['type']
        data = event['data']['object']

        print(f"Received Stripe webhook: {event_type}")

        if event_type == 'checkout.session.completed':
            # Payment successful - activate subscription
            customer_email = data.get('customer_email')
            subscription_id = data.get('subscription')
            customer_id = data.get('customer')
            metadata = data.get('metadata', {})

            plan = metadata.get('plan', 'individual_monthly')
            is_gift = metadata.get('is_gift') == 'true'

            # Determine the actual subscriber email
            if is_gift:
                subscriber_email = metadata.get('gift_recipient_email', customer_email)
            else:
                subscriber_email = customer_email

            if subscriber_email:
                subscriber_email = subscriber_email.lower()
                timestamp = int(datetime.utcnow().timestamp())

                # Update or create subscriber record
                try:
                    email_table.update_item(
                        Key={'email': subscriber_email},
                        UpdateExpression='SET subscription_tier = :tier, stripe_customer_id = :customer_id, stripe_subscription_id = :sub_id, subscription_status = :status, subscription_start_date = :start_date, subscribed = :subscribed',
                        ExpressionAttributeValues={
                            ':tier': plan,
                            ':customer_id': customer_id,
                            ':sub_id': subscription_id,
                            ':status': 'active',
                            ':start_date': timestamp,
                            ':subscribed': True
                        }
                    )
                except ClientError as e:
                    if e.response['Error']['Code'] == 'ResourceNotFoundException':
                        # Email doesn't exist, create new entry
                        email_table.put_item(
                            Item={
                                'email': subscriber_email,
                                'signup_timestamp': timestamp,
                                'created_at': datetime.utcnow().isoformat(),
                                'subscribed': True,
                                'subscription_tier': plan,
                                'stripe_customer_id': customer_id,
                                'stripe_subscription_id': subscription_id,
                                'subscription_status': 'active',
                                'subscription_start_date': timestamp
                            }
                        )

                print(f"Activated subscription for {subscriber_email}: {plan}")

                # Send welcome email for paid tier
                if is_gift:
                    # TODO: Send gift welcome email
                    pass
                else:
                    email_service.send_welcome_email(subscriber_email, None)

        elif event_type == 'customer.subscription.updated':
            # Subscription updated (e.g., plan change)
            subscription_id = data.get('id')
            status = data.get('status')
            customer_id = data.get('customer')

            # Find customer by subscription ID and update
            response = email_table.scan(
                FilterExpression='stripe_subscription_id = :sub_id',
                ExpressionAttributeValues={':sub_id': subscription_id}
            )

            for item in response.get('Items', []):
                email_table.update_item(
                    Key={'email': item['email']},
                    UpdateExpression='SET subscription_status = :status',
                    ExpressionAttributeValues={':status': status}
                )
                print(f"Updated subscription status for {item['email']}: {status}")

        elif event_type == 'customer.subscription.deleted':
            # Subscription canceled or expired
            subscription_id = data.get('id')

            # Find customer by subscription ID and mark as inactive
            response = email_table.scan(
                FilterExpression='stripe_subscription_id = :sub_id',
                ExpressionAttributeValues={':sub_id': subscription_id}
            )

            for item in response.get('Items', []):
                email_table.update_item(
                    Key={'email': item['email']},
                    UpdateExpression='SET subscription_status = :status, subscription_tier = :tier',
                    ExpressionAttributeValues={
                        ':status': 'canceled',
                        ':tier': 'free'
                    }
                )
                print(f"Canceled subscription for {item['email']}")

        return {"status": "success"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing webhook: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Error processing webhook")

@app.post("/api/customer-portal")
async def customer_portal(email: EmailStr):
    """Generate a Stripe Customer Portal link for managing subscription"""
    try:
        email_lower = email.lower()

        # Get customer ID from DynamoDB
        response = email_table.get_item(Key={'email': email_lower})

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Customer not found")

        customer_data = response['Item']
        stripe_customer_id = customer_data.get('stripe_customer_id')

        if not stripe_customer_id:
            raise HTTPException(status_code=400, detail="No active subscription found")

        # Create portal session
        return_url = os.getenv('PORTAL_RETURN_URL', 'https://your-domain.com/dashboard.html')

        portal_session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=return_url,
        )

        return {
            'portal_url': portal_session.url
        }

    except stripe.error.StripeError as e:
        print(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating portal session: {e}")
        raise HTTPException(status_code=500, detail="Error creating portal session")

@app.get("/api/subscription-status")
async def get_subscription_status(email: EmailStr):
    """Get subscription status for a user"""
    try:
        email_lower = email.lower()
        response = email_table.get_item(Key={'email': email_lower})

        if 'Item' not in response:
            return {
                'tier': 'free',
                'status': 'none',
                'has_subscription': False
            }

        customer_data = response['Item']

        return {
            'tier': customer_data.get('subscription_tier', 'free'),
            'status': customer_data.get('subscription_status', 'none'),
            'has_subscription': customer_data.get('stripe_subscription_id') is not None,
            'subscription_start_date': customer_data.get('subscription_start_date')
        }

    except Exception as e:
        print(f"Error fetching subscription status: {e}")
        raise HTTPException(status_code=500, detail="Error fetching subscription status")

# ===== Admin Endpoints =====

@app.post("/api/admin/fetch-paper")
async def fetch_paper(request: FetchPaperRequest):
    """Fetch paper metadata from arXiv"""
    try:
        # Extract paper ID
        paper_id = arxiv_service.extract_paper_id(request.arxiv_url)

        # Fetch paper from arXiv
        paper_data = arxiv_service.fetch_paper(paper_id)

        if not paper_data:
            raise HTTPException(status_code=404, detail="Paper not found")

        # Store in DynamoDB
        paper_table.put_item(
            Item={
                **paper_data,
                'created_at': int(datetime.utcnow().timestamp())
            }
        )

        return paper_data

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error fetching paper: {e}")
        raise HTTPException(status_code=500, detail="Error fetching paper")

@app.post("/api/admin/generate-podcast")
async def generate_podcast(
    paper_id: str = Form(...),
    use_full_text: bool = Form(False),
    voice_preset: str = Form('default')
):
    """Generate complete podcast (transcript + audio) from paper"""
    try:
        # Fetch paper from DynamoDB
        response = paper_table.get_item(Key={'paper_id': paper_id})

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Paper not found")

        paper_data = response['Item']

        # Step 1: Generate transcript
        print(f"Generating transcript for {paper_data['title']}...")
        transcript = podcast_service.generate_podcast_script(paper_data, use_full_text=use_full_text)

        # Step 2: Generate audio from transcript with selected voice preset
        podcast_id = str(uuid.uuid4())
        print(f"Converting transcript to audio for podcast {podcast_id}...")
        audio_url = podcast_service.generate_audio(transcript, podcast_id, voice_preset)

        # Store podcast in DynamoDB
        podcast_item = {
            'podcast_id': podcast_id,
            'paper_id': paper_id,
            'paper_title': paper_data['title'],
            'paper_authors': ', '.join(paper_data['authors']),
            'paper_url': paper_data.get('pdf_url', 'N/A'),
            'audio_url': audio_url,
            'transcript': transcript,
            'created_at': int(datetime.utcnow().timestamp()),
            'sent_at': None,
            'recipients_count': 0
        }

        podcast_table.put_item(Item=podcast_item)

        return {
            "podcast_id": podcast_id,
            "audio_url": audio_url,
            "transcript": transcript,
            "paper_title": paper_data['title']
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating podcast: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generating podcast: {str(e)}")

@app.get("/api/admin/preview-podcast/{podcast_id}")
async def preview_podcast(podcast_id: str):
    """Get podcast details for preview"""
    try:
        response = podcast_table.get_item(Key={'podcast_id': podcast_id})

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Podcast not found")

        return response['Item']

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching podcast: {e}")
        raise HTTPException(status_code=500, detail="Error fetching podcast")

@app.post("/api/admin/send-podcast")
async def send_podcast(request: SendPodcastRequest):
    """Send podcast to all subscribers"""
    try:
        # Fetch podcast
        podcast_response = podcast_table.get_item(Key={'podcast_id': request.podcast_id})

        if 'Item' not in podcast_response:
            raise HTTPException(status_code=404, detail="Podcast not found")

        podcast_data = podcast_response['Item']

        # Fetch all subscribed emails
        scan_response = email_table.scan(
            FilterExpression='subscribed = :val',
            ExpressionAttributeValues={':val': True}
        )

        subscribers = scan_response.get('Items', [])

        if not subscribers:
            return {"message": "No subscribers found", "sent": 0, "failed": 0}

        # Send emails
        result = email_service.send_bulk_podcast_emails(subscribers, podcast_data)

        # Update podcast record
        podcast_table.update_item(
            Key={'podcast_id': request.podcast_id},
            UpdateExpression='SET sent_at = :sent_at, recipients_count = :count',
            ExpressionAttributeValues={
                ':sent_at': int(datetime.utcnow().timestamp()),
                ':count': result['sent']
            }
        )

        # Update last_email_sent for each subscriber
        current_time = datetime.utcnow().isoformat()
        for subscriber in subscribers:
            try:
                email_table.update_item(
                    Key={'email': subscriber['email']},
                    UpdateExpression='SET last_email_sent = :time',
                    ExpressionAttributeValues={':time': current_time}
                )
            except:
                pass  # Continue even if individual update fails

        return {
            "message": "Podcast sent successfully",
            "sent": result['sent'],
            "failed": result['failed'],
            "total_subscribers": len(subscribers)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending podcast: {e}")
        raise HTTPException(status_code=500, detail=f"Error sending podcast: {str(e)}")

@app.get("/api/admin/stats")
async def get_stats():
    """Get dashboard statistics"""
    try:
        # Count total subscribers
        try:
            email_response = email_table.scan(
                Select='COUNT',
                FilterExpression='subscribed = :val',
                ExpressionAttributeValues={':val': True}
            )
            subscriber_count = email_response.get('Count', 0)
        except Exception as e:
            print(f"Error counting subscribers: {e}")
            subscriber_count = 0

        # Get last podcast sent
        try:
            podcast_response = podcast_table.scan(
                FilterExpression='attribute_exists(sent_at)',
                Limit=1
            )
            podcasts = podcast_response.get('Items', [])
            last_podcast_date = None
            if podcasts and podcasts[0].get('sent_at'):
                sent_at = podcasts[0]['sent_at']
                if sent_at is not None and sent_at != 'None':
                    last_podcast_date = datetime.fromtimestamp(int(sent_at)).isoformat()
        except Exception as e:
            print(f"Error getting last podcast: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            last_podcast_date = None

        # Count total podcasts
        try:
            total_podcasts = podcast_table.scan(Select='COUNT').get('Count', 0)
        except Exception as e:
            print(f"Error counting podcasts: {e}")
            total_podcasts = 0

        return {
            "total_subscribers": subscriber_count,
            "last_podcast_date": last_podcast_date,
            "total_podcasts": total_podcasts
        }

    except Exception as e:
        print(f"Error fetching stats: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@app.get("/api/admin/podcast-history")
async def get_podcast_history():
    """Get history of sent podcasts"""
    try:
        response = podcast_table.scan(
            FilterExpression='attribute_exists(sent_at)'
        )

        podcasts = response.get('Items', [])

        # Sort by sent_at descending (handle None values)
        podcasts.sort(key=lambda x: int(x.get('sent_at') or 0), reverse=True)

        # Filter and format podcasts
        formatted_podcasts = []
        for p in podcasts[:20]:
            try:
                sent_at = p.get('sent_at')
                if sent_at and sent_at != 'None':
                    formatted_podcasts.append({
                        "podcast_id": p['podcast_id'],
                        "paper_title": p.get('paper_title', 'Unknown'),
                        "sent_at": datetime.fromtimestamp(int(sent_at)).isoformat(),
                        "recipients_count": p.get('recipients_count', 0)
                    })
            except Exception as e:
                print(f"Error formatting podcast {p.get('podcast_id')}: {e}")
                continue

        return {"podcasts": formatted_podcasts}

    except Exception as e:
        print(f"Error fetching history: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error fetching history: {str(e)}")

@app.post("/api/admin/add-test-subscriber")
async def add_test_subscriber(email: str = Form(...), name: str = Form(None)):
    """Add a test subscriber for testing emails"""
    try:
        email_lower = email.lower()
        timestamp = int(datetime.utcnow().timestamp())

        item = {
            'email': email_lower,
            'signup_timestamp': timestamp,
            'created_at': datetime.utcnow().isoformat(),
            'subscribed': True,
            'last_email_sent': None
        }

        if name:
            item['name'] = name

        email_table.put_item(Item=item)

        return {"message": "Test subscriber added", "email": email_lower}

    except Exception as e:
        print(f"Error adding test subscriber: {e}")
        raise HTTPException(status_code=500, detail=f"Error adding test subscriber: {str(e)}")

@app.post("/api/admin/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), paper_url: str = Form(...)):
    """Upload PDF and extract full text with metadata"""
    try:
        print(f"Received file: {file.filename}, content_type: {file.content_type}")
        print(f"Paper URL: {paper_url}")

        # Validate paper URL
        if not paper_url or not paper_url.strip():
            raise HTTPException(status_code=400, detail="Paper URL is required")

        # Read PDF bytes
        pdf_bytes = await file.read()
        print(f"PDF size: {len(pdf_bytes)} bytes")

        # Extract text from PDF
        pdf_service = PDFService()
        full_text = pdf_service.extract_text_from_bytes(pdf_bytes)
        print(f"Extracted text length: {len(full_text)} characters")

        # Truncate if needed
        truncated_text = pdf_service.smart_truncate(full_text, max_chars=15000)

        # Try to extract title and authors from first few lines of text
        lines = full_text.split('\n')[:20]  # First 20 lines

        # Simple heuristics to extract title (usually first non-empty line)
        title = "Uploaded Paper"
        for line in lines:
            line = line.strip()
            if len(line) > 10 and not line.isupper():  # Skip all-caps headers
                title = line[:200]  # Limit title length
                break

        print(f"Extracted title: {title}")

        # Try to find authors (look for common patterns)
        authors = ["Unknown"]
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in ['author', 'by']):
                # Next line might be authors
                if i + 1 < len(lines):
                    author_line = lines[i + 1].strip()
                    if author_line and len(author_line) < 200:
                        authors = [a.strip() for a in author_line.split(',')]
                break

        print(f"Extracted authors: {authors}")

        # Generate paper ID from timestamp
        paper_id = f"upload-{int(datetime.utcnow().timestamp())}"

        # Prepare paper data with provided paper URL
        paper_data = {
            'paper_id': paper_id,
            'title': title,
            'authors': authors,
            'abstract': truncated_text[:500] + "..." if len(truncated_text) > 500 else truncated_text,
            'full_text': truncated_text,
            'pdf_url': paper_url.strip(),  # Use provided URL
            'published': datetime.utcnow().isoformat(),
            'categories': ['uploaded'],
            'created_at': int(datetime.utcnow().timestamp())
        }

        # Store in DynamoDB
        paper_table.put_item(Item=paper_data)

        return paper_data

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading PDF: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error uploading PDF: {str(e)}")

@app.post("/api/admin/extract-pdf-from-arxiv")
async def extract_pdf_from_arxiv(request: FetchPaperRequest):
    """Fetch paper from arXiv and extract full PDF text"""
    try:
        # Extract paper ID
        paper_id = arxiv_service.extract_paper_id(request.arxiv_url)

        # Fetch paper metadata from arXiv
        paper_data = arxiv_service.fetch_paper(paper_id)

        if not paper_data:
            raise HTTPException(status_code=404, detail="Paper not found")

        # Extract full text from PDF
        pdf_service = PDFService()
        full_text = pdf_service.extract_from_arxiv(paper_data['pdf_url'])

        # Truncate if needed
        truncated_text = pdf_service.smart_truncate(full_text, max_chars=15000)

        # Add full text to paper data
        paper_data['full_text'] = truncated_text

        # Store in DynamoDB
        paper_table.put_item(
            Item={
                **paper_data,
                'created_at': int(datetime.utcnow().timestamp())
            }
        )

        return paper_data

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error extracting PDF: {str(e)}")

@app.post("/api/admin/generate-transcript")
async def generate_transcript(
    paper_id: str = Form(...),
    use_full_text: bool = Form(False),
    technical_level: str = Form('undergrad'),
    custom_topics: str = Form(None),
    host_persona: str = Form('curious_journalist'),
    expert_persona: str = Form('academic_expert')
):
    """Generate just the transcript/script without audio"""
    try:
        # Fetch paper from DynamoDB
        response = paper_table.get_item(Key={'paper_id': paper_id})

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Paper not found")

        paper_data = response['Item']

        # Generate only the script with all parameters
        print(f"Generating transcript for {paper_data['title']}...")
        print(f"Technical level: {technical_level}")
        print(f"Host persona: {host_persona}, Expert persona: {expert_persona}")
        if custom_topics:
            print(f"Custom topics: {custom_topics[:100]}...")

        transcript = podcast_service.generate_podcast_script(
            paper_data,
            use_full_text=use_full_text,
            technical_level=technical_level,
            custom_topics=custom_topics,
            host_persona=host_persona,
            expert_persona=expert_persona
        )

        return {
            "transcript": transcript,
            "paper_id": paper_id,
            "paper_title": paper_data['title']
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating transcript: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating transcript: {str(e)}")

@app.post("/api/admin/convert-to-audio")
async def convert_to_audio(
    paper_id: str = Form(...),
    transcript: str = Form(...),
    voice_preset: str = Form('default'),
    host_voice_key: str = Form(None),
    expert_voice_key: str = Form(None)
):
    """Convert transcript to audio podcast with custom voice selection"""
    try:
        # Fetch paper from DynamoDB
        response = paper_table.get_item(Key={'paper_id': paper_id})

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Paper not found")

        paper_data = response['Item']

        # Generate audio from transcript with selected voices
        import uuid
        podcast_id = str(uuid.uuid4())
        print(f"Converting transcript to audio for podcast {podcast_id}...")
        if host_voice_key and expert_voice_key:
            print(f"Using custom voices: Host={host_voice_key}, Expert={expert_voice_key}")
        else:
            print(f"Using voice preset: {voice_preset}")

        audio_url = podcast_service.generate_audio(
            transcript,
            podcast_id,
            voice_preset=voice_preset,
            host_voice_key=host_voice_key,
            expert_voice_key=expert_voice_key
        )

        # Store podcast in DynamoDB
        podcast_item = {
            'podcast_id': podcast_id,
            'paper_id': paper_id,
            'paper_title': paper_data['title'],
            'paper_authors': ', '.join(paper_data['authors']),
            'paper_url': paper_data.get('pdf_url', 'N/A'),
            'audio_url': audio_url,
            'transcript': transcript,
            'created_at': int(datetime.utcnow().timestamp()),
            'sent_at': None,
            'recipients_count': 0
        }

        podcast_table.put_item(Item=podcast_item)

        return {
            "podcast_id": podcast_id,
            "audio_url": audio_url,
            "transcript": transcript,
            "paper_title": paper_data['title']
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error converting to audio: {e}")
        raise HTTPException(status_code=500, detail=f"Error converting to audio: {str(e)}")

@app.post("/api/admin/generate-from-text")
async def generate_from_text(
    text: str = Form(...),
    title: str = Form("Custom Content")
):
    """Generate podcast transcript from raw text"""
    try:
        print(f"Generating transcript from text, title: {title}")
        print(f"Text length: {len(text)} characters")

        # Generate transcript using the text-to-podcast method
        transcript = podcast_service.generate_podcast_script_from_text(text, title)

        # Create a temporary paper entry for the text-based content
        paper_id = f"text-{int(datetime.utcnow().timestamp())}"

        # Store minimal paper data
        paper_data = {
            'paper_id': paper_id,
            'title': title,
            'authors': ['Custom Text'],
            'abstract': text[:500] + "..." if len(text) > 500 else text,
            'pdf_url': 'N/A',
            'published': datetime.utcnow().isoformat(),
            'categories': ['custom-text'],
            'created_at': int(datetime.utcnow().timestamp())
        }

        paper_table.put_item(Item=paper_data)

        return {
            "transcript": transcript,
            "paper_id": paper_id,
            "title": title
        }

    except Exception as e:
        print(f"Error generating transcript from text: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generating transcript from text: {str(e)}")

@app.get("/api/admin/voices")
async def get_available_voices():
    """Get list of available voice presets"""
    try:
        voices = podcast_service.get_available_voices()
        return {"voices": voices}
    except Exception as e:
        print(f"Error fetching voices: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching voices: {str(e)}")

@app.get("/api/admin/individual-voices")
async def get_individual_voices():
    """Get list of all individual voices for custom selection"""
    try:
        voices = podcast_service.get_all_individual_voices()
        return {"voices": voices}
    except Exception as e:
        print(f"Error fetching individual voices: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching individual voices: {str(e)}")

@app.get("/api/admin/technical-levels")
async def get_technical_levels():
    """Get list of technical difficulty levels"""
    try:
        levels = podcast_service.get_technical_levels()
        return {"levels": levels}
    except Exception as e:
        print(f"Error fetching technical levels: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching technical levels: {str(e)}")

@app.get("/api/admin/personas")
async def get_personas():
    """Get list of available podcast personas"""
    try:
        personas = podcast_service.get_personas()
        return {"personas": personas}
    except Exception as e:
        print(f"Error fetching personas: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching personas: {str(e)}")

@app.get("/api/admin/voice-preview/{voice_key}")
async def get_voice_preview(voice_key: str, role: str = 'host'):
    """Generate and return a short audio preview for a voice"""
    try:
        print(f"Generating voice preview for {voice_key} as {role}")
        audio_bytes = podcast_service.generate_voice_preview(voice_key, role)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        print(f"Error generating voice preview: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generating voice preview: {str(e)}")

@app.get("/api/admin/users")
async def get_all_users():
    """Get all users from DynamoDB"""
    try:
        # Scan all users from email table
        response = email_table.scan()
        users = response.get('Items', [])

        # Handle pagination if there are many users
        while 'LastEvaluatedKey' in response:
            response = email_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            users.extend(response.get('Items', []))

        # Sort by signup timestamp (most recent first)
        users.sort(key=lambda x: x.get('signup_timestamp', 0), reverse=True)

        return {
            "users": users,
            "total": len(users)
        }
    except Exception as e:
        print(f"Error fetching users: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

class ManualEmailRequest(BaseModel):
    subject: str
    message: str
    recipients: List[EmailStr]  # List of email addresses
    from_name: str = "AI Research Podcasts"

@app.post("/api/admin/send-manual-email")
async def send_manual_email(request: ManualEmailRequest):
    """Send a manual email to selected users"""
    try:
        if not request.recipients:
            raise HTTPException(status_code=400, detail="No recipients provided")

        sent_count = 0
        failed_count = 0
        failed_emails = []

        for recipient_email in request.recipients:
            try:
                # Send email using email service
                email_service.send_custom_email(
                    to_email=recipient_email.lower(),
                    subject=request.subject,
                    message=request.message,
                    from_name=request.from_name
                )
                sent_count += 1
                print(f"✓ Sent email to {recipient_email}")
            except Exception as e:
                failed_count += 1
                failed_emails.append(recipient_email)
                print(f"✗ Failed to send to {recipient_email}: {e}")

        return {
            "message": "Email sending completed",
            "sent": sent_count,
            "failed": failed_count,
            "failed_emails": failed_emails,
            "total_recipients": len(request.recipients)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending manual emails: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error sending manual emails: {str(e)}")

class BulkImportRequest(BaseModel):
    emails: List[EmailStr]  # List of emails from CSV

@app.post("/api/admin/bulk-import-users")
async def bulk_import_users(request: BulkImportRequest):
    """Bulk import users from CSV"""
    try:
        if not request.emails:
            raise HTTPException(status_code=400, detail="No emails provided")

        timestamp = int(datetime.utcnow().timestamp())
        added_count = 0
        skipped_count = 0
        failed_count = 0
        added_emails = []
        skipped_emails = []
        failed_emails = []

        for email in request.emails:
            try:
                email_lower = email.lower().strip()

                # Try to add to DynamoDB
                item = {
                    'email': email_lower,
                    'signup_timestamp': timestamp,
                    'created_at': datetime.utcnow().isoformat(),
                    'subscribed': True,
                    'last_email_sent': None,
                    'source': 'bulk_import'
                }

                try:
                    email_table.put_item(
                        Item=item,
                        ConditionExpression='attribute_not_exists(email)'
                    )
                    added_count += 1
                    added_emails.append(email_lower)
                    print(f"✓ Added {email_lower}")
                except ClientError as e:
                    if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                        # Email already exists
                        skipped_count += 1
                        skipped_emails.append(email_lower)
                        print(f"⊘ Skipped {email_lower} (already exists)")
                    else:
                        raise
            except Exception as e:
                failed_count += 1
                failed_emails.append(email_lower if 'email_lower' in locals() else str(email))
                print(f"✗ Failed to add {email}: {e}")

        return {
            "message": "Bulk import completed",
            "added": added_count,
            "skipped": skipped_count,
            "failed": failed_count,
            "added_emails": added_emails,
            "skipped_emails": skipped_emails,
            "failed_emails": failed_emails,
            "total": len(request.emails)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error bulk importing users: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error bulk importing users: {str(e)}")

class QuickAddUserRequest(BaseModel):
    email: EmailStr
    name: str = None

@app.post("/api/admin/quick-add-user")
async def quick_add_user(request: QuickAddUserRequest):
    """Quickly add a single user from admin panel"""
    try:
        email = request.email.lower().strip()
        timestamp = int(datetime.utcnow().timestamp())

        item = {
            'email': email,
            'signup_timestamp': timestamp,
            'created_at': datetime.utcnow().isoformat(),
            'subscribed': True,
            'last_email_sent': None,
            'source': 'admin_add'
        }

        if request.name:
            item['name'] = request.name.strip()

        try:
            email_table.put_item(
                Item=item,
                ConditionExpression='attribute_not_exists(email)'
            )

            # Send welcome email
            email_service.send_welcome_email(email, request.name)

            return {
                "message": "User added successfully",
                "email": email,
                "name": request.name
            }
        except ClientError as e:
            if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
                raise HTTPException(status_code=409, detail="Email already exists")
            else:
                raise

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding user: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error adding user: {str(e)}")

class SendPodcastToUsersRequest(BaseModel):
    podcast_id: str
    recipient_emails: List[EmailStr]

@app.post("/api/admin/send-podcast-to-users")
async def send_podcast_to_users(request: SendPodcastToUsersRequest):
    """Send podcast to specific users"""
    try:
        # Fetch podcast
        podcast_response = podcast_table.get_item(Key={'podcast_id': request.podcast_id})

        if 'Item' not in podcast_response:
            raise HTTPException(status_code=404, detail="Podcast not found")

        podcast_data = podcast_response['Item']

        # Get user data for selected emails
        subscribers = []
        for email in request.recipient_emails:
            try:
                user_response = email_table.get_item(Key={'email': email.lower()})
                if 'Item' in user_response:
                    subscribers.append(user_response['Item'])
            except Exception as e:
                print(f"Warning: Could not fetch user {email}: {e}")

        if not subscribers:
            return {"message": "No valid subscribers found", "sent": 0, "failed": 0}

        # Send emails
        result = email_service.send_bulk_podcast_emails(subscribers, podcast_data)

        return {
            "message": "Podcast sent to selected users",
            "sent": result['sent'],
            "failed": result['failed'],
            "total_subscribers": len(subscribers)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending podcast to users: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error sending podcast to users: {str(e)}")

# ===== Static HTML Pages =====

@app.get("/pricing.html")
async def get_pricing():
    """Serve the pricing page"""
    pricing_file = FRONTEND_DIR / "pricing.html"
    if pricing_file.exists():
        return FileResponse(pricing_file)
    raise HTTPException(status_code=404, detail="Pricing page not found")

@app.get("/thank-you.html")
async def get_thank_you():
    """Serve the thank you page"""
    thank_you_file = FRONTEND_DIR / "thank-you.html"
    if thank_you_file.exists():
        return FileResponse(thank_you_file)
    raise HTTPException(status_code=404, detail="Thank you page not found")

@app.get("/dashboard.html")
async def get_dashboard():
    """Serve the dashboard page (placeholder for now)"""
    dashboard_file = FRONTEND_DIR / "dashboard.html"
    if dashboard_file.exists():
        return FileResponse(dashboard_file)
    # For now, redirect to index if dashboard doesn't exist
    return FileResponse(FRONTEND_DIR / "index.html")
