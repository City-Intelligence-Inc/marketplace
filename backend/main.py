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
import json
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
    return {
        "status": "healthy",
        "version": "2025-01-20-ocr-v2",
        "features": {
            "ocr_page_by_page": True,
            "openrouter_metadata": True,
            "llm_logging": True
        },
        "endpoints": {
            "upload_pdf": "/api/admin/upload-pdf",
            "returns_ocr": True
        }
    }

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
        # Handle both timestamp formats (int and string)
        def get_sort_key(x):
            sent_at = x.get('sent_at')
            if not sent_at or sent_at == 'None':
                return 0
            # If it's already an int, return it
            if isinstance(sent_at, int):
                return sent_at
            # If it's a string timestamp, try to parse it
            try:
                return int(sent_at)
            except (ValueError, TypeError):
                # If it's an ISO string, return 0 (will be at the end)
                return 0

        podcasts.sort(key=get_sort_key, reverse=True)

        # Format episodes for public display
        formatted_episodes = []
        for p in podcasts:
            try:
                sent_at = p.get('sent_at')
                if sent_at and sent_at != 'None':
                    # Convert sent_at to int if possible, otherwise use current timestamp
                    try:
                        sent_at_int = int(sent_at) if isinstance(sent_at, (int, str)) and str(sent_at).isdigit() else int(datetime.now().timestamp())
                    except (ValueError, TypeError):
                        sent_at_int = int(datetime.now().timestamp())

                    formatted_episodes.append({
                        "podcast_id": p['podcast_id'],
                        "paper_title": p.get('paper_title', 'Unknown'),
                        "paper_authors": p.get('paper_authors', 'Unknown'),
                        "paper_url": p.get('paper_url', '#'),
                        "audio_url": p.get('audio_url', ''),
                        "sent_at": sent_at_int
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

@app.delete("/api/admin/episodes/{podcast_id}")
async def delete_episode(podcast_id: str):
    """Delete a podcast episode (admin only)"""
    try:
        print(f"🗑️ Deleting podcast: {podcast_id}")

        # Get podcast to check if it exists
        response = podcast_table.get_item(Key={'podcast_id': podcast_id})

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Podcast not found")

        # Delete from DynamoDB
        podcast_table.delete_item(Key={'podcast_id': podcast_id})

        print(f"✅ Successfully deleted podcast: {podcast_id}")
        return {"message": "Podcast deleted successfully", "podcast_id": podcast_id}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting podcast: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error deleting podcast: {str(e)}")

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
        print("=" * 80)
        print("📧 SENDING PODCAST TO ALL SUBSCRIBERS")
        print("=" * 80)
        print(f"Podcast ID: {request.podcast_id}")
        print("-" * 80)

        # Fetch podcast
        podcast_response = podcast_table.get_item(Key={'podcast_id': request.podcast_id})

        if 'Item' not in podcast_response:
            raise HTTPException(status_code=404, detail="Podcast not found")

        podcast_data = podcast_response['Item']

        print(f"📄 Podcast Details:")
        print(f"   Title: {podcast_data.get('paper_title', 'N/A')[:60]}...")
        print(f"   Audio URL: {podcast_data.get('audio_url', 'N/A')[:60]}...")
        print("-" * 80)

        # Fetch all subscribed emails
        scan_response = email_table.scan(
            FilterExpression='subscribed = :val',
            ExpressionAttributeValues={':val': True}
        )

        subscribers = scan_response.get('Items', [])

        print(f"👥 Found {len(subscribers)} active subscribers")

        if not subscribers:
            print("⚠️  No subscribers found")
            print("=" * 80)
            return {
                "message": "No subscribers found",
                "sent": 0,
                "failed": 0,
                "stats": {
                    "total_subscribers": 0,
                    "sent_count": 0,
                    "failed_count": 0,
                    "success_rate": 0
                }
            }

        # Send emails
        print(f"📤 Starting bulk email send...")
        result = email_service.send_bulk_podcast_emails(subscribers, podcast_data)

        print("-" * 80)
        print(f"✉️  Email Send Results:")
        print(f"   Sent: {result['sent']}")
        print(f"   Failed: {result['failed']}")
        print(f"   Success Rate: {(result['sent'] / len(subscribers) * 100):.1f}%")
        print("-" * 80)

        # Update podcast record
        sent_timestamp = int(datetime.utcnow().timestamp())
        podcast_table.update_item(
            Key={'podcast_id': request.podcast_id},
            UpdateExpression='SET sent_at = :sent_at, recipients_count = :count',
            ExpressionAttributeValues={
                ':sent_at': sent_timestamp,
                ':count': result['sent']
            }
        )
        print(f"💾 Updated podcast record in database")

        # Update last_email_sent for each subscriber
        current_time = datetime.utcnow().isoformat()
        updated_count = 0
        for subscriber in subscribers:
            try:
                email_table.update_item(
                    Key={'email': subscriber['email']},
                    UpdateExpression='SET last_email_sent = :time',
                    ExpressionAttributeValues={':time': current_time}
                )
                updated_count += 1
            except:
                pass  # Continue even if individual update fails

        print(f"💾 Updated last_email_sent for {updated_count} subscribers")
        print("=" * 80)
        print("✅ PODCAST SEND COMPLETED SUCCESSFULLY")
        print("=" * 80)

        return {
            "message": "Podcast sent successfully",
            "sent": result['sent'],
            "failed": result['failed'],
            "total_subscribers": len(subscribers),
            "stats": {
                "podcast_id": request.podcast_id,
                "podcast_title": podcast_data.get('paper_title', 'N/A'),
                "sent_at": sent_timestamp,
                "sent_count": result['sent'],
                "failed_count": result['failed'],
                "total_subscribers": len(subscribers),
                "success_rate": round((result['sent'] / len(subscribers) * 100), 2) if len(subscribers) > 0 else 0,
                "subscribers_updated": updated_count
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending podcast: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
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
    """Upload PDF and extract full text with page-by-page OCR and LLM metadata extraction"""
    try:
        print(f"Received file: {file.filename}, content_type: {file.content_type}")
        print(f"Paper URL: {paper_url}")

        # Validate paper URL
        if not paper_url or not paper_url.strip():
            raise HTTPException(status_code=400, detail="Paper URL is required")

        # Read PDF bytes
        pdf_bytes = await file.read()
        print(f"PDF size: {len(pdf_bytes)} bytes")

        # Extract text from PDF with page-by-page details
        pdf_service = PDFService()
        extraction_result = pdf_service.extract_text_from_bytes_detailed(pdf_bytes)

        full_text = extraction_result['full_text']
        pages = extraction_result['pages']
        total_pages = extraction_result['total_pages']
        total_chars = extraction_result['total_chars']

        print(f"✓ Extracted {total_pages} pages, {total_chars} total characters")
        print(f"✓ Page-by-page breakdown:")
        for page_info in pages[:5]:  # Show first 5 pages
            print(f"  Page {page_info['page_number']}: {page_info['char_count']} chars, {page_info['line_count']} lines")
        if total_pages > 5:
            print(f"  ... and {total_pages - 5} more pages")

        # Use OpenRouter LLM to extract metadata intelligently
        from services.openrouter_service import OpenRouterService

        print("=" * 80)
        print("🔍 STARTING LLM METADATA EXTRACTION")
        print("=" * 80)

        openrouter = OpenRouterService()
        metadata = openrouter.extract_paper_metadata(full_text)

        print("=" * 80)
        print("📥 LLM RESPONSE - RAW METADATA:")
        print(json.dumps(metadata, indent=2))
        print("=" * 80)

        # Extract fields with fallbacks
        title = metadata.get('title', 'Uploaded Paper')
        authors = metadata.get('authors', ['Unknown'])
        abstract = metadata.get('abstract', '')

        # If abstract is missing or too short, generate one
        if not abstract or len(abstract) < 100:
            print("=" * 80)
            print("⚠️  ABSTRACT TOO SHORT - GENERATING WITH LLM")
            print(f"   Current abstract length: {len(abstract)} chars")
            print("=" * 80)
            abstract = openrouter.improve_abstract(full_text)

        print("=" * 80)
        print("✅ FINAL EXTRACTED METADATA:")
        print(f"   Title: {title}")
        print(f"   Authors: {authors}")
        print(f"   Abstract length: {len(abstract)} chars")
        print(f"   Abstract preview: {abstract[:200]}...")
        print("=" * 80)

        # Generate paper ID from timestamp
        paper_id = f"upload-{int(datetime.utcnow().timestamp())}"

        # Prepare paper data with LLM-extracted metadata
        paper_data = {
            'paper_id': paper_id,
            'title': title,
            'authors': authors,
            'abstract': abstract,
            'full_text': full_text,  # Store full text
            'pdf_url': paper_url.strip(),
            'published': datetime.utcnow().isoformat(),
            'categories': metadata.get('keywords', ['uploaded']),
            'created_at': int(datetime.utcnow().timestamp())
        }

        # Store in DynamoDB
        print("=" * 80)
        print("💾 SAVING TO DYNAMODB:")
        print(json.dumps({
            'paper_id': paper_data['paper_id'],
            'title': paper_data['title'],
            'authors': paper_data['authors'],
            'abstract': paper_data['abstract'][:200] + "...",
            'full_text_length': len(paper_data['full_text']),
            'pdf_url': paper_data['pdf_url'],
            'categories': paper_data['categories']
        }, indent=2))
        print("=" * 80)

        paper_table.put_item(Item=paper_data)

        print(f"✅ Successfully stored paper {paper_id} in DynamoDB")
        print("=" * 80)

        # Return paper data WITH page-by-page OCR results for UI display
        return {
            **paper_data,
            'ocr_details': {
                'total_pages': total_pages,
                'total_chars': total_chars,
                'pages': pages  # Include all page details for admin UI
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading PDF: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error uploading PDF: {str(e)}")

@app.post("/api/admin/extract-pdf-from-arxiv")
async def extract_pdf_from_arxiv(request: FetchPaperRequest):
    """Fetch paper from arXiv and extract full PDF text (NO TRUNCATION for Gemini support)"""
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

        print(f"Extracted full text: {len(full_text)} characters (NO TRUNCATION - full paper preserved)")

        # NO TRUNCATION - Store full text for Gemini to handle
        # Gemini 1.5 Flash can handle 1M+ tokens (~750k characters)
        paper_data['full_text'] = full_text

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
        print("=" * 80)
        print("🎙️  GENERATING TRANSCRIPT")
        print("=" * 80)
        print(f"Paper ID: {paper_id}")
        print(f"Title: {paper_data['title'][:60]}...")
        print(f"Technical Level: {technical_level}")
        print(f"Host Persona: {host_persona}")
        print(f"Expert Persona: {expert_persona}")
        print(f"Use Full Text: {use_full_text}")
        if custom_topics:
            print(f"Custom Topics: {custom_topics[:100]}...")
        print("-" * 80)

        transcript = podcast_service.generate_podcast_script(
            paper_data,
            use_full_text=use_full_text,
            technical_level=technical_level,
            custom_topics=custom_topics,
            host_persona=host_persona,
            expert_persona=expert_persona
        )

        print("=" * 80)
        print("✅ TRANSCRIPT GENERATED SUCCESSFULLY")
        print(f"   Length: {len(transcript)} characters")
        print(f"   Word count: ~{len(transcript.split())} words")
        print("=" * 80)

        return {
            "transcript": transcript,
            "paper_id": paper_id,
            "paper_title": paper_data['title'],
            "stats": {
                "char_count": len(transcript),
                "word_count": len(transcript.split()),
                "technical_level": technical_level,
                "personas": {"host": host_persona, "expert": expert_persona}
            }
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
    expert_voice_key: str = Form(None),
    edited_title: str = Form(None),
    edited_authors: str = Form(None),
    edited_abstract: str = Form(None)
):
    """Convert transcript to audio podcast with custom voice selection and edited metadata"""
    try:
        # Fetch paper from DynamoDB
        response = paper_table.get_item(Key={'paper_id': paper_id})

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Paper not found")

        paper_data = response['Item']

        # Use edited metadata if provided, otherwise use original
        final_title = edited_title if edited_title else paper_data['title']
        final_authors = edited_authors if edited_authors else ', '.join(paper_data['authors'])
        final_abstract = edited_abstract if edited_abstract else paper_data.get('abstract', '')

        # Update paper_data with edited values if they were provided
        if edited_title or edited_authors or edited_abstract:
            print(f"Using edited metadata for podcast:")
            if edited_title:
                print(f"  Title: {edited_title}")
                paper_data['title'] = edited_title
            if edited_authors:
                print(f"  Authors: {edited_authors}")
                paper_data['authors'] = [edited_authors]  # Store as list for consistency
            if edited_abstract:
                print(f"  Abstract updated (length: {len(edited_abstract)})")
                paper_data['abstract'] = edited_abstract

            # Update the paper in DynamoDB with edited values
            paper_table.update_item(
                Key={'paper_id': paper_id},
                UpdateExpression='SET title = :title, authors = :authors, abstract = :abstract',
                ExpressionAttributeValues={
                    ':title': final_title,
                    ':authors': [final_authors] if isinstance(final_authors, str) else final_authors,
                    ':abstract': final_abstract
                }
            )

        # Generate audio from transcript with selected voices
        import uuid
        podcast_id = str(uuid.uuid4())

        print("=" * 80)
        print("🎧 CONVERTING TRANSCRIPT TO AUDIO")
        print("=" * 80)
        print(f"Podcast ID: {podcast_id}")
        print(f"Paper ID: {paper_id}")
        print(f"Title: {final_title[:60]}...")
        print(f"Transcript Length: {len(transcript)} chars")
        if host_voice_key and expert_voice_key:
            print(f"Custom Voices: Host={host_voice_key}, Expert={expert_voice_key}")
        else:
            print(f"Voice Preset: {voice_preset}")
        print("-" * 80)

        audio_url = podcast_service.generate_audio(
            transcript,
            podcast_id,
            voice_preset=voice_preset,
            host_voice_key=host_voice_key,
            expert_voice_key=expert_voice_key
        )

        # Store podcast in DynamoDB with edited metadata
        podcast_item = {
            'podcast_id': podcast_id,
            'paper_id': paper_id,
            'paper_title': final_title,
            'paper_authors': final_authors,
            'paper_url': paper_data.get('pdf_url', 'N/A'),
            'audio_url': audio_url,
            'transcript': transcript,
            'created_at': int(datetime.utcnow().timestamp()),
            'sent_at': None,
            'recipients_count': 0
        }

        podcast_table.put_item(Item=podcast_item)

        print("=" * 80)
        print("✅ PODCAST CREATED SUCCESSFULLY")
        print(f"   Podcast ID: {podcast_id}")
        print(f"   Audio URL: {audio_url[:80]}...")
        print(f"   Saved to DynamoDB: podcasts table")
        print("=" * 80)

        return {
            "podcast_id": podcast_id,
            "audio_url": audio_url,
            "transcript": transcript,
            "paper_title": final_title,
            "stats": {
                "audio_url": audio_url,
                "created_at": podcast_item['created_at'],
                "voice_config": {
                    "preset": voice_preset,
                    "host_voice": host_voice_key,
                    "expert_voice": expert_voice_key
                }
            }
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

@app.get("/api/admin/elevenlabs-voices")
async def get_elevenlabs_voices():
    """Fetch ALL voices from user's ElevenLabs account"""
    try:
        voices = podcast_service.get_elevenlabs_voices_from_api()
        return {"voices": voices}
    except Exception as e:
        print(f"Error fetching ElevenLabs voices: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching ElevenLabs voices: {str(e)}")

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

@app.get("/api/admin/voice-preview-by-id/{voice_id}")
async def get_voice_preview_by_id(voice_id: str):
    """Generate audio preview for ANY ElevenLabs voice by ID"""
    import requests
    try:
        print(f"🎤 Generating preview for voice ID: {voice_id}")

        sample_text = "Hey! So I'm really excited to dive into this topic. It's one of those things that sounds complex at first, but once you get it, it's actually pretty cool!"

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": os.getenv('ELEVENLABS_API_KEY'),
            "Content-Type": "application/json"
        }
        payload = {
            "text": sample_text,
            "model_id": "eleven_turbo_v2_5",
            "voice_settings": {
                "stability": 0.3,
                "similarity_boost": 0.85,
                "style": 0.7,
                "use_speaker_boost": True
            }
        }
        params = {"output_format": "mp3_44100_128"}

        response = requests.post(url, json=payload, headers=headers, params=params, stream=True)
        response.raise_for_status()

        audio_bytes = b''
        for chunk in response.iter_content(chunk_size=4096):
            if chunk:
                audio_bytes += chunk

        print(f"   ✓ Generated {len(audio_bytes)} bytes")
        return Response(content=audio_bytes, media_type="audio/mpeg")

    except Exception as e:
        print(f"   ✗ Error: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generating voice preview: {str(e)}")

@app.get("/api/admin/users")
async def get_all_users():
    """Get all users from DynamoDB"""
    try:
        print("=" * 80)
        print("👥 FETCHING ALL USERS FROM DATABASE")
        print("=" * 80)

        # Scan all users from email table
        response = email_table.scan()
        users = response.get('Items', [])
        scan_count = 1

        # Handle pagination if there are many users
        while 'LastEvaluatedKey' in response:
            response = email_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            users.extend(response.get('Items', []))
            scan_count += 1

        print(f"📊 Database Scans: {scan_count} (paginated)")
        print(f"📊 Total Users Found: {len(users)}")
        print("-" * 80)

        # Sort by signup timestamp (most recent first)
        users.sort(key=lambda x: x.get('signup_timestamp', 0), reverse=True)

        # Calculate statistics
        subscribed_count = sum(1 for u in users if u.get('subscribed', False))
        unsubscribed_count = len(users) - subscribed_count

        # Subscription tier breakdown
        tier_counts = {}
        for user in users:
            tier = user.get('subscription_tier', 'free')
            tier_counts[tier] = tier_counts.get(tier, 0) + 1

        # Source breakdown
        source_counts = {}
        for user in users:
            source = user.get('source', 'organic')
            source_counts[source] = source_counts.get(source, 0) + 1

        print(f"📈 User Statistics:")
        print(f"   Active (subscribed): {subscribed_count}")
        print(f"   Unsubscribed: {unsubscribed_count}")
        print(f"   Subscription Rate: {(subscribed_count / len(users) * 100):.1f}%")
        print("-" * 80)

        print(f"💰 Subscription Tiers:")
        for tier, count in sorted(tier_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"   {tier}: {count} ({(count / len(users) * 100):.1f}%)")
        print("-" * 80)

        print(f"📍 User Sources:")
        for source, count in sorted(source_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"   {source}: {count} ({(count / len(users) * 100):.1f}%)")
        print("=" * 80)
        print("✅ USER DATA FETCHED SUCCESSFULLY")
        print("=" * 80)

        return {
            "users": users,
            "total": len(users),
            "stats": {
                "total_users": len(users),
                "subscribed": subscribed_count,
                "unsubscribed": unsubscribed_count,
                "subscription_rate": round((subscribed_count / len(users) * 100), 2) if len(users) > 0 else 0,
                "tiers": tier_counts,
                "sources": source_counts,
                "database_scans": scan_count
            }
        }
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

class ManualEmailRequest(BaseModel):
    subject: str
    message: str
    recipients: List[EmailStr]  # List of email addresses
    from_name: str = "City Secretary"

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
        print("=" * 80)
        print("📧 SENDING PODCAST TO SELECTED USERS")
        print("=" * 80)
        print(f"Podcast ID: {request.podcast_id}")
        print(f"Recipients: {len(request.recipient_emails)} selected users")
        print("-" * 80)

        # Fetch podcast
        podcast_response = podcast_table.get_item(Key={'podcast_id': request.podcast_id})

        if 'Item' not in podcast_response:
            raise HTTPException(status_code=404, detail="Podcast not found")

        podcast_data = podcast_response['Item']

        print(f"📄 Podcast Details:")
        print(f"   Title: {podcast_data.get('paper_title', 'N/A')[:60]}...")
        print(f"   Audio URL: {podcast_data.get('audio_url', 'N/A')[:60]}...")
        print("-" * 80)

        # Get user data for selected emails
        subscribers = []
        not_found_emails = []
        print(f"🔍 Fetching user data for {len(request.recipient_emails)} recipients...")

        for email in request.recipient_emails:
            try:
                user_response = email_table.get_item(Key={'email': email.lower()})
                if 'Item' in user_response:
                    subscribers.append(user_response['Item'])
                    print(f"   ✓ Found: {email.lower()}")
                else:
                    not_found_emails.append(email.lower())
                    print(f"   ✗ Not found: {email.lower()}")
            except Exception as e:
                not_found_emails.append(email.lower())
                print(f"   ✗ Error fetching {email}: {e}")

        print("-" * 80)
        print(f"👥 User Lookup Results:")
        print(f"   Found: {len(subscribers)}")
        print(f"   Not Found: {len(not_found_emails)}")
        if not_found_emails:
            print(f"   Missing emails: {', '.join(not_found_emails[:5])}")
            if len(not_found_emails) > 5:
                print(f"   ... and {len(not_found_emails) - 5} more")
        print("-" * 80)

        if not subscribers:
            print("⚠️  No valid subscribers found")
            print("=" * 80)
            return {
                "message": "No valid subscribers found",
                "sent": 0,
                "failed": 0,
                "stats": {
                    "requested": len(request.recipient_emails),
                    "found": 0,
                    "not_found": len(not_found_emails),
                    "sent": 0,
                    "failed": 0,
                    "not_found_emails": not_found_emails
                }
            }

        # Send emails
        print(f"📤 Starting email send to {len(subscribers)} users...")
        result = email_service.send_bulk_podcast_emails(subscribers, podcast_data)

        print("-" * 80)
        print(f"✉️  Email Send Results:")
        print(f"   Sent: {result['sent']}")
        print(f"   Failed: {result['failed']}")
        print(f"   Success Rate: {(result['sent'] / len(subscribers) * 100):.1f}%")
        print("=" * 80)
        print("✅ TARGETED SEND COMPLETED SUCCESSFULLY")
        print("=" * 80)

        return {
            "message": "Podcast sent to selected users",
            "sent": result['sent'],
            "failed": result['failed'],
            "total_subscribers": len(subscribers),
            "stats": {
                "podcast_id": request.podcast_id,
                "podcast_title": podcast_data.get('paper_title', 'N/A'),
                "requested": len(request.recipient_emails),
                "found": len(subscribers),
                "not_found": len(not_found_emails),
                "sent_count": result['sent'],
                "failed_count": result['failed'],
                "success_rate": round((result['sent'] / len(subscribers) * 100), 2) if len(subscribers) > 0 else 0,
                "not_found_emails": not_found_emails
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending podcast to users: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error sending podcast to users: {str(e)}")

class SendTestEmailRequest(BaseModel):
    template_type: str  # welcome, podcast, or custom
    test_email: EmailStr

class CustomWorkflowGenerateAudioRequest(BaseModel):
    transcript: str
    podcast_hosts: str
    category: str
    host_voice_key: str
    expert_voice_key: str
    target_words: int = 0  # 0 = no shortening, otherwise target word count (e.g., 1000, 1500, 2000)

class CustomWorkflowPreviewEmailRequest(BaseModel):
    podcast_id: str
    template_type: str

class CustomWorkflowSendRequest(BaseModel):
    podcast_id: str
    recipient_emails: List[EmailStr]
    template_type: str

@app.post("/api/admin/send-test-email")
async def send_test_email(request: SendTestEmailRequest):
    """Send test email with sample data"""
    try:
        print(f"📧 Sending test {request.template_type} email to {request.test_email}")

        if request.template_type == "welcome":
            success = email_service.send_welcome_email(request.test_email, "Test User")

        elif request.template_type == "podcast":
            # Create sample podcast data
            sample_podcast = {
                "podcast_id": "test-podcast-123",
                "paper_title": "Sample Research Paper: Advances in Machine Learning",
                "paper_authors": "Dr. Jane Smith, Dr. John Doe",
                "paper_url": "https://example.com/paper.pdf",
                "audio_url": "https://example.com/sample-audio.mp3",
                "sent_at": datetime.now().isoformat()
            }
            success = email_service.send_podcast_email(request.test_email, sample_podcast, "Test User")

        elif request.template_type == "custom":
            success = email_service.send_custom_email(
                to_email=request.test_email,
                subject="Test Custom Email",
                message="This is a test custom email message.\n\nYou can customize this content for any purpose.",
                from_name="City Secretary"
            )

        elif request.template_type == "weekly":
            # Create sample weekly digest data
            sample_podcasts = [
                {
                    "podcast_id": "test-1",
                    "paper_title": "Advances in Quantum Computing",
                    "paper_authors": "Dr. Sarah Chen, Dr. Michael Wong",
                    "paper_url": "https://example.com/paper1.pdf",
                    "audio_url": "https://example.com/audio1.mp3",
                    "duration": "8"
                },
                {
                    "podcast_id": "test-2",
                    "paper_title": "Machine Learning in Healthcare",
                    "paper_authors": "Dr. Jane Smith",
                    "paper_url": "https://example.com/paper2.pdf",
                    "audio_url": "https://example.com/audio2.mp3",
                    "duration": "6"
                },
                {
                    "podcast_id": "test-3",
                    "paper_title": "Climate Change Modeling with AI",
                    "paper_authors": "Dr. Robert Lee, Dr. Emma Davis",
                    "paper_url": "https://example.com/paper3.pdf",
                    "audio_url": "https://example.com/audio3.mp3",
                    "duration": "7"
                },
            ]
            success = email_service.send_weekly_digest_email(request.test_email, sample_podcasts, "Test User")

        else:
            raise HTTPException(status_code=400, detail=f"Unknown template type: {request.template_type}")

        if success:
            print(f"✅ Test {request.template_type} email sent successfully to {request.test_email}")
            return {
                "message": f"Test {request.template_type} email sent successfully",
                "recipient": request.test_email,
                "template_type": request.template_type
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send test email")

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending test email: {e}")
        raise HTTPException(status_code=500, detail=f"Error sending test email: {str(e)}")

@app.post("/api/admin/custom-workflow/generate-audio")
async def custom_workflow_generate_audio(request: CustomWorkflowGenerateAudioRequest):
    """Generate audio for custom workflow with hosts and category"""
    try:
        print("=" * 80)
        print("🎙️ CUSTOM WORKFLOW: GENERATE AUDIO REQUEST")
        print("=" * 80)
        print(f"📊 INPUT PARAMETERS:")
        print(f"   Hosts: {request.podcast_hosts}")
        print(f"   Category: {request.category}")
        print(f"   Host Voice: {request.host_voice_key}")
        print(f"   Expert Voice: {request.expert_voice_key}")
        print(f"   Transcript Length: {len(request.transcript)} characters")
        print(f"   Transcript Preview: {request.transcript[:200]}...")
        print("-" * 80)

        # Generate podcast ID
        podcast_id = f"custom-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        print(f"🆔 Generated Podcast ID: {podcast_id}")
        print("-" * 80)

        # Get voice IDs from all_voices dictionary
        host_voice_data = podcast_service.all_voices.get(request.host_voice_key)
        expert_voice_data = podcast_service.all_voices.get(request.expert_voice_key)

        if not host_voice_data:
            raise HTTPException(status_code=400, detail=f"Invalid host voice key: {request.host_voice_key}")
        if not expert_voice_data:
            raise HTTPException(status_code=400, detail=f"Invalid expert voice key: {request.expert_voice_key}")

        host_voice_id = host_voice_data['id']
        expert_voice_id = expert_voice_data['id']

        print(f"🎤 VOICE MAPPING:")
        print(f"   Host: {request.host_voice_key} ({host_voice_data['name']}) → {host_voice_id}")
        print(f"   Expert: {request.expert_voice_key} ({expert_voice_data['name']}) → {expert_voice_id}")
        print("-" * 80)

        # Generate audio using podcast service with individual voices
        from services.podcast_service import analyze_text_emotion

        print(f"🔊 STARTING AUDIO GENERATION...")
        print(f"   This may take several minutes depending on transcript length")
        audio_generation_start = datetime.now()

        # Pass target_words to generate_audio (0 = no shortening)
        audio_result = podcast_service.generate_audio(
            script=request.transcript,
            podcast_id=podcast_id,
            host_voice_key=request.host_voice_key,
            expert_voice_key=request.expert_voice_key,
            target_words=request.target_words
        )

        audio_generation_end = datetime.now()
        audio_duration = (audio_generation_end - audio_generation_start).total_seconds()
        print(f"⏱️  Audio Generation Time: {audio_duration:.2f} seconds")
        print("-" * 80)

        if not audio_result or 'audio_url' not in audio_result:
            print("❌ Audio generation returned empty result")
            raise HTTPException(status_code=500, detail="Failed to generate audio")

        print(f"✅ AUDIO GENERATED SUCCESSFULLY:")
        print(f"   Audio URL: {audio_result['audio_url']}")
        print("-" * 80)

        # Generate AI title from transcript
        print(f"🤖 GENERATING AI TITLE FROM TRANSCRIPT...")
        from services.email_service import EmailService
        email_service = EmailService()
        ai_title = email_service.generate_title_from_transcript(request.transcript)
        print(f"   ✓ Generated title: {ai_title}")
        print("-" * 80)

        # Calculate actual audio duration
        print(f"⏱️  CALCULATING AUDIO DURATION...")
        duration_minutes = "5-10"  # Default
        try:
            # Download audio temporarily to get duration
            import requests
            from mutagen.mp3 import MP3
            import tempfile

            response = requests.get(audio_result['audio_url'], stream=True)
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
                for chunk in response.iter_content(chunk_size=8192):
                    tmp_file.write(chunk)
                tmp_path = tmp_file.name

            audio = MP3(tmp_path)
            duration_seconds = int(audio.info.length)
            duration_minutes = str(int(duration_seconds / 60))  # Just the minutes

            import os
            os.unlink(tmp_path)  # Clean up temp file

            print(f"   ✓ Duration: {duration_minutes} minutes ({duration_seconds} seconds)")
        except Exception as e:
            print(f"   ⚠️  Could not calculate duration: {e}")
            print(f"   Using default: {duration_minutes} minutes")
        print("-" * 80)

        # Store in DynamoDB with AI-generated title and actual duration
        print(f"💾 STORING TO DYNAMODB:")
        podcast_item = {
            'podcast_id': podcast_id,
            'audio_url': audio_result['audio_url'],
            'transcript': request.transcript,
            'podcast_hosts': request.podcast_hosts,
            'category': request.category,
            'paper_title': ai_title,  # AI-generated title instead of hardcoded
            'paper_authors': request.podcast_hosts,
            'duration': duration_minutes,  # Actual duration in minutes
            'created_at': int(datetime.now().timestamp()),  # Unix timestamp as number
            'sent_at': None,
        }
        print(f"   Table: podcasts")
        print(f"   Item Keys: {list(podcast_item.keys())}")
        print(f"   Title: {ai_title}")

        podcast_table.put_item(Item=podcast_item)
        print(f"   ✓ Stored successfully")
        print("=" * 80)
        print(f"✅ CUSTOM WORKFLOW AUDIO GENERATION COMPLETE")
        print(f"   Podcast ID: {podcast_id}")
        print(f"   Total Time: {audio_duration:.2f}s")
        print("=" * 80)

        return {
            "podcast_id": podcast_id,
            "audio_url": audio_result['audio_url'],
            "message": "Audio generated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating audio: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")

@app.post("/api/admin/custom-workflow/preview-email")
async def custom_workflow_preview_email(request: CustomWorkflowPreviewEmailRequest):
    """Generate email preview HTML for the selected template"""
    try:
        print("=" * 80)
        print("👁️ CUSTOM WORKFLOW: PREVIEW EMAIL REQUEST")
        print("=" * 80)
        print(f"📊 INPUT PARAMETERS:")
        print(f"   Podcast ID: {request.podcast_id}")
        print(f"   Template Type: {request.template_type}")
        print("-" * 80)

        # Get podcast data
        print(f"🔍 FETCHING PODCAST FROM DYNAMODB:")
        print(f"   Table: podcasts")
        print(f"   Key: podcast_id={request.podcast_id}")

        podcast_response = podcast_table.get_item(Key={'podcast_id': request.podcast_id})

        if 'Item' not in podcast_response:
            print(f"❌ Podcast not found in DynamoDB")
            raise HTTPException(status_code=404, detail="Podcast not found")

        podcast_data = podcast_response['Item']
        print(f"✅ PODCAST DATA RETRIEVED:")
        print(f"   Title: {podcast_data.get('paper_title', 'N/A')}")
        print(f"   Hosts: {podcast_data.get('podcast_hosts', 'N/A')}")
        print(f"   Category: {podcast_data.get('category', 'N/A')}")
        print(f"   Audio URL: {podcast_data.get('audio_url', 'N/A')[:50]}...")
        print("-" * 80)

        # Generate HTML based on template type
        print(f"🎨 GENERATING HTML FOR TEMPLATE: {request.template_type}")

        if request.template_type == "weekly":
            # For weekly digest, generate the EXACT HTML that will be sent
            import re

            # Get podcast data
            duration = podcast_data.get('duration', '5-10')
            category = podcast_data.get('category', 'AI')
            authors = podcast_data.get('podcast_hosts', podcast_data.get('paper_authors', 'Host'))[:50]
            audio_url = podcast_data.get('audio_url', '#')
            transcript = podcast_data.get('transcript', '')
            title = podcast_data.get('paper_title', 'Research Podcast')

            # Remove HOST:/EXPERT: labels from transcript
            clean_transcript = re.sub(r'\b(HOST|EXPERT|Host|Expert)\s*:\s*', '', transcript)

            # Split into paragraphs
            transcript_paragraphs = clean_transcript.split('\n\n') if clean_transcript else []

            # Create HTML with paragraphs
            transcript_html = ''.join([
                f'<p style="margin-bottom: 12px; line-height: 1.7; color: #374151; font-size: 14px;">{p.strip()}</p>'
                for p in transcript_paragraphs if p.strip()
            ])

            # Build the podcast item HTML (same as in send_weekly_digest_email)
            podcast_item = f"""
            <div style="border: 2px solid #e5e7eb; padding: 24px; margin-bottom: 32px; background: #ffffff; border-radius: 12px;">
              <!-- Title -->
              <div style="margin-bottom: 16px;">
                <span style="display: inline-block; background: #ea580c; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">{category}</span>
                <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 8px 0 8px 0; line-height: 1.3;">{title}</h2>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">{authors} • {duration} min listen</p>
              </div>

              <!-- BIG AUDIO PLAYER -->
              <div style="background: linear-gradient(to bottom, #fef3c7 0%, #fef9e7 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; border: 2px solid #fbbf24;">
                <h3 style="font-size: 16px; font-weight: 700; color: #92400e; margin-bottom: 16px;">🎧 Listen to Episode</h3>

                <!-- HTML5 Audio Player -->
                <audio controls style="width: 100%; max-width: 100%; margin-bottom: 16px;">
                  <source src="{audio_url}" type="audio/mpeg">
                  Your browser does not support the audio element.
                </audio>

                <!-- Big Play Button Link -->
                <a href="{audio_url}" style="display: inline-block; background: #ea580c; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-top: 8px;">
                  ▶️ PLAY NOW
                </a>
              </div>

              <!-- FULL TRANSCRIPT -->
              <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 12px;">📄 Full Transcript</h3>
                <div style="color: #374151; line-height: 1.7; font-size: 14px;">
                  {transcript_html}
                </div>
              </div>
            </div>
            """

            # Estimate duration
            if isinstance(duration, str) and '-' in duration:
                avg = sum(int(x) for x in duration.split('-')) / 2
                total_duration = int(avg)
            else:
                total_duration = 7

            # Build unsubscribe URL (using dummy email for preview)
            import urllib.parse
            preview_email = "user@example.com"
            frontend_url = os.getenv('FRONTEND_URL', 'https://four0k-arr-saas.onrender.com')
            unsubscribe_url = f"{frontend_url}/unsubscribe?email={urllib.parse.quote(preview_email)}"

            # Build the full email HTML (same as send_weekly_digest_email)
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #ffffff; }}
                    .container {{ max-width: 600px; margin: 0 auto; }}
                    .header {{ background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 20px; text-align: center; }}
                    .header h1 {{ color: white; font-size: 24px; font-weight: 700; margin: 0; }}
                    .header p {{ color: rgba(255,255,255,0.9); margin-top: 8px; font-size: 14px; }}
                    .content {{ padding: 24px 20px; }}
                    .footer {{ text-align: center; padding: 24px 20px; color: #666; font-size: 13px; border-top: 1px solid #e5e7eb; }}
                    .footer a {{ color: #3b82f6; text-decoration: none; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📚 Your Weekly Digest</h1>
                        <p>1 episode from this week</p>
                    </div>
                    <div class="content">
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Hi there,</p>
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Here's everything from this week in one place:</p>

                        {podcast_item}

                        <p style="color: #374151; line-height: 1.6; margin-top: 24px;">That's {int(total_duration)} minutes of cutting-edge research. See you next week!</p>
                    </div>
                    <div class="footer">
                        <p>Next digest arrives same time next week.</p>
                        <p style="margin-top: 12px;"><a href="{unsubscribe_url}">Unsubscribe</a></p>
                    </div>
                </div>
            </body>
            </html>
            """
        elif request.template_type == "podcast":
            html = f"""
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 24px 20px; text-align: center;">
                    <h1 style="color: white; font-size: 20px; font-weight: 700; margin: 0;">🎧 Your Daily Research Podcast</h1>
                </div>
                <div style="padding: 20px;">
                    <h2 style="font-size: 22px; font-weight: 700; color: #000; margin-bottom: 12px; line-height: 1.3;">{podcast_data.get('paper_title', 'Podcast Title')}</h2>
                    <p style="color: #666; font-size: 14px; margin-bottom: 8px;">Hosted by: <strong>{podcast_data.get('podcast_hosts', 'AI Hosts')}</strong></p>
                    <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Category: <strong>{podcast_data.get('category', 'General')}</strong></p>

                    <div style="background: #f9fafb; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
                        <audio controls style="width: 100%; margin: 16px 0;">
                            <source src="{podcast_data.get('audio_url', '#')}" type="audio/mpeg">
                        </audio>
                        <a href="{podcast_data.get('audio_url', '#')}" style="display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 12px 0;">▶ Play Now</a>
                    </div>
                </div>
            </div>
            """
        elif request.template_type == "welcome":
            html = f"""
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 32px 20px; text-align: center;">
                    <h1 style="color: white; font-size: 24px; font-weight: 700; margin: 0;">🎧 Welcome!</h1>
                </div>
                <div style="padding: 24px 20px;">
                    <p style="color: #374151; line-height: 1.6;">Hi there,</p>
                    <p style="color: #374151; line-height: 1.6; margin: 16px 0;">Welcome! Here's a preview of our {podcast_data.get('category', 'General')} podcast.</p>
                    <audio controls style="width: 100%; margin: 20px 0;">
                        <source src="{podcast_data.get('audio_url', '#')}" type="audio/mpeg">
                    </audio>
                </div>
            </div>
            """
        else:
            # Default template
            html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>{podcast_data.get('paper_title', 'Podcast')}</h2>
                <p>Hosted by: {podcast_data.get('podcast_hosts', 'AI Hosts')}</p>
                <p>Category: {podcast_data.get('category', 'General')}</p>
                <audio controls style="width: 100%;">
                    <source src="{podcast_data.get('audio_url', '#')}" type="audio/mpeg">
                </audio>
            </div>
            """

        print(f"✅ EMAIL PREVIEW GENERATED:")
        print(f"   HTML Length: {len(html)} characters")
        print(f"   Template: {request.template_type}")
        print("=" * 80)
        print(f"✅ PREVIEW EMAIL COMPLETE")
        print("=" * 80)

        return {"html": html, "message": "Preview generated"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating preview: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating preview: {str(e)}")

@app.post("/api/admin/custom-workflow/send-custom-podcast")
async def custom_workflow_send_podcast(request: CustomWorkflowSendRequest):
    """Send custom podcast with selected template to specific users"""
    try:
        print("=" * 80)
        print("📧 CUSTOM WORKFLOW: SEND PODCAST REQUEST")
        print("=" * 80)
        print(f"📊 INPUT PARAMETERS:")
        print(f"   Podcast ID: {request.podcast_id}")
        print(f"   Template Type: {request.template_type}")
        print(f"   Total Recipients: {len(request.recipient_emails)}")
        print(f"   Recipient List: {', '.join(request.recipient_emails)}")
        print("-" * 80)

        # Get podcast data
        print(f"🔍 FETCHING PODCAST FROM DYNAMODB:")
        podcast_response = podcast_table.get_item(Key={'podcast_id': request.podcast_id})
        if 'Item' not in podcast_response:
            print(f"❌ Podcast not found")
            raise HTTPException(status_code=404, detail="Podcast not found")

        podcast_data = podcast_response['Item']
        print(f"✅ Podcast data retrieved")
        print("-" * 80)

        # Get user data
        print(f"👥 FETCHING USER DATA:")
        subscribers = []
        not_found = []

        for email in request.recipient_emails:
            try:
                user_response = email_table.get_item(Key={'email': email.lower()})
                if 'Item' in user_response:
                    subscribers.append(user_response['Item'])
                    print(f"   ✓ Found: {email.lower()}")
                else:
                    not_found.append(email.lower())
                    print(f"   ✗ Not found: {email.lower()}")
            except Exception as e:
                not_found.append(email.lower())
                print(f"   ✗ Error fetching {email}: {e}")

        print("-" * 80)
        print(f"📊 USER LOOKUP RESULTS:")
        print(f"   Valid subscribers: {len(subscribers)}")
        print(f"   Not found: {len(not_found)}")

        if not subscribers:
            print(f"❌ No valid subscribers found")
            print("=" * 80)
            return {"message": "No valid subscribers found", "sent": 0, "failed": 0}

        print("-" * 80)

        # Send emails using the selected template
        print(f"📤 SENDING EMAILS (Template: {request.template_type}):")
        sent = 0
        failed = 0
        send_start = datetime.now()

        for i, subscriber in enumerate(subscribers, 1):
            email = subscriber['email']
            name = subscriber.get('name')

            print(f"   [{i}/{len(subscribers)}] Sending to {email}...")

            try:
                if request.template_type == "welcome":
                    success = email_service.send_welcome_email(email, name)
                elif request.template_type == "weekly":
                    success = email_service.send_weekly_digest_email(email, [podcast_data], name)
                else:  # podcast or custom
                    success = email_service.send_podcast_email(email, podcast_data, name)

                if success:
                    sent += 1
                    print(f"      ✓ Success")
                else:
                    failed += 1
                    print(f"      ✗ Failed")
            except Exception as e:
                failed += 1
                print(f"      ✗ Error: {e}")

        send_end = datetime.now()
        send_duration = (send_end - send_start).total_seconds()
        print("-" * 80)
        print(f"📊 SENDING COMPLETE:")
        print(f"   Sent: {sent}")
        print(f"   Failed: {failed}")
        print(f"   Success Rate: {(sent/len(subscribers)*100):.1f}%")
        print(f"   Duration: {send_duration:.2f}s")
        print("-" * 80)

        # Update sent_at timestamp
        print(f"💾 UPDATING PODCAST METADATA:")
        podcast_table.update_item(
            Key={'podcast_id': request.podcast_id},
            UpdateExpression='SET sent_at = :sent_at',
            ExpressionAttributeValues={':sent_at': datetime.now().isoformat()}
        )
        print(f"   ✓ Updated sent_at timestamp")
        print("=" * 80)
        print(f"✅ SEND CUSTOM PODCAST COMPLETE")
        print(f"   Total Recipients: {len(subscribers)}")
        print(f"   Sent: {sent} | Failed: {failed}")
        print("=" * 80)

        return {
            "message": f"Sent to {sent} user(s)",
            "sent": sent,
            "failed": failed
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending custom podcast: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error sending custom podcast: {str(e)}")

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
