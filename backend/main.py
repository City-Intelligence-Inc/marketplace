from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import boto3
from datetime import datetime
import os
from botocore.exceptions import ClientError
from typing import List, Optional
from services.arxiv_service import ArxivService
from services.podcast_service import PodcastService
from services.email_service import EmailService
from services.pdf_service import PDFService

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

# Initialize services
arxiv_service = ArxivService()
podcast_service = PodcastService()
email_service = EmailService()

# Initialize DynamoDB clients
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'us-east-1'))
email_table = dynamodb.Table(os.getenv('EMAIL_TABLE_NAME', 'email-signups'))
paper_table = dynamodb.Table(os.getenv('PAPER_TABLE_NAME', 'paper-links'))
podcast_table = dynamodb.Table(os.getenv('PODCASTS_TABLE_NAME', 'podcasts'))

# ===== Models =====

class EmailSignup(BaseModel):
    email: EmailStr
    name: str = None

class SignupResponse(BaseModel):
    message: str
    email: str

class FetchPaperRequest(BaseModel):
    arxiv_url: str

class GeneratePodcastRequest(BaseModel):
    paper_id: str

class SendPodcastRequest(BaseModel):
    podcast_id: str

# ===== Public Endpoints =====

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
async def generate_podcast(request: GeneratePodcastRequest):
    """Generate podcast from paper"""
    try:
        # Fetch paper from DynamoDB
        response = paper_table.get_item(Key={'paper_id': request.paper_id})

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Paper not found")

        paper_data = response['Item']

        # Generate podcast
        podcast_result = podcast_service.create_podcast(paper_data)

        # Store podcast in DynamoDB
        podcast_item = {
            'podcast_id': podcast_result['podcast_id'],
            'paper_id': request.paper_id,
            'paper_title': paper_data['title'],
            'paper_authors': ', '.join(paper_data['authors']),
            'paper_url': paper_data['pdf_url'],
            'audio_url': podcast_result['audio_url'],
            'transcript': podcast_result['script'],
            'created_at': int(datetime.utcnow().timestamp()),
            'sent_at': None,
            'recipients_count': 0
        }

        podcast_table.put_item(Item=podcast_item)

        return {
            "podcast_id": podcast_result['podcast_id'],
            "audio_url": podcast_result['audio_url'],
            "transcript": podcast_result['script'],
            "paper_title": paper_data['title']
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating podcast: {e}")
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
        email_response = email_table.scan(
            Select='COUNT',
            FilterExpression='subscribed = :val',
            ExpressionAttributeValues={':val': True}
        )
        subscriber_count = email_response.get('Count', 0)

        # Get last podcast sent
        podcast_response = podcast_table.scan(
            FilterExpression='attribute_exists(sent_at)',
            Limit=1
        )
        podcasts = podcast_response.get('Items', [])
        last_podcast_date = None
        if podcasts:
            last_podcast_date = datetime.fromtimestamp(podcasts[0]['sent_at']).isoformat()

        # Count total podcasts
        total_podcasts = podcast_table.scan(Select='COUNT').get('Count', 0)

        return {
            "total_subscribers": subscriber_count,
            "last_podcast_date": last_podcast_date,
            "total_podcasts": total_podcasts
        }

    except Exception as e:
        print(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail="Error fetching stats")

@app.get("/api/admin/podcast-history")
async def get_podcast_history():
    """Get history of sent podcasts"""
    try:
        response = podcast_table.scan(
            FilterExpression='attribute_exists(sent_at)'
        )

        podcasts = response.get('Items', [])

        # Sort by sent_at descending
        podcasts.sort(key=lambda x: x.get('sent_at', 0), reverse=True)

        return {
            "podcasts": [{
                "podcast_id": p['podcast_id'],
                "paper_title": p['paper_title'],
                "sent_at": datetime.fromtimestamp(p['sent_at']).isoformat(),
                "recipients_count": p.get('recipients_count', 0)
            } for p in podcasts[:20]]  # Return last 20
        }

    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Error fetching history")

@app.post("/api/admin/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...)
):
    """Upload PDF and extract full text with metadata"""
    try:
        # Read PDF bytes
        pdf_bytes = await file.read()

        # Extract text from PDF
        pdf_service = PDFService()
        full_text = pdf_service.extract_text_from_bytes(pdf_bytes)

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

        # Generate paper ID from timestamp
        paper_id = f"upload-{int(datetime.utcnow().timestamp())}"

        # Prepare paper data
        paper_data = {
            'paper_id': paper_id,
            'title': title,
            'authors': authors,
            'abstract': truncated_text[:500] + "..." if len(truncated_text) > 500 else truncated_text,
            'full_text': truncated_text,
            'pdf_url': None,
            'published': datetime.utcnow().isoformat(),
            'categories': ['uploaded'],
            'created_at': int(datetime.utcnow().timestamp())
        }

        # Store in DynamoDB
        paper_table.put_item(Item=paper_data)

        return paper_data

    except Exception as e:
        print(f"Error uploading PDF: {e}")
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
    use_full_text: bool = Form(False)
):
    """Generate just the transcript/script without audio"""
    try:
        # Fetch paper from DynamoDB
        response = paper_table.get_item(Key={'paper_id': paper_id})

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Paper not found")

        paper_data = response['Item']

        # Generate only the script
        print(f"Generating transcript for {paper_data['title']}...")
        transcript = podcast_service.generate_podcast_script(paper_data, use_full_text=use_full_text)

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
    transcript: str = Form(...)
):
    """Convert transcript to audio podcast"""
    try:
        # Fetch paper from DynamoDB
        response = paper_table.get_item(Key={'paper_id': paper_id})

        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Paper not found")

        paper_data = response['Item']

        # Generate audio from transcript
        import uuid
        podcast_id = str(uuid.uuid4())
        print(f"Converting transcript to audio for podcast {podcast_id}...")
        audio_url = podcast_service.generate_audio(transcript, podcast_id)

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
