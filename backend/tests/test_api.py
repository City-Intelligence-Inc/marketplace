"""
Complete API Tests for City Secretary Backend

Tests all endpoints including the full podcast generation workflow:
1. Upload PDF -> 2. Generate Transcript -> 3. Convert to Audio -> 4. Send Podcast

Run with: pytest tests/test_api.py -v
"""

import pytest
import os
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
import json
from datetime import datetime

# Set test environment variables before importing app
os.environ['AWS_REGION'] = 'us-east-1'
os.environ['EMAIL_TABLE_NAME'] = 'email-signups-test'
os.environ['PAPER_TABLE_NAME'] = 'paper-links-test'
os.environ['PODCASTS_TABLE_NAME'] = 'podcasts-test'
os.environ['PAPER_REQUESTS_TABLE_NAME'] = 'paper-requests-test'
os.environ['S3_BUCKET_NAME'] = 'test-bucket'
os.environ['OPENAI_API_KEY'] = 'sk-test-key'
os.environ['ELEVENLABS_API_KEY'] = 'sk-test-key'
os.environ['MAILGUN_API_KEY'] = 'test-key'
os.environ['OPENROUTER_API_KEY'] = 'sk-or-test-key'
os.environ['STRIPE_SECRET_KEY'] = 'sk_test_key'
os.environ['STRIPE_WEBHOOK_SECRET'] = 'whsec_test'

from main import app

client = TestClient(app)


# ===== Fixtures =====

@pytest.fixture
def mock_dynamodb():
    """Mock DynamoDB tables"""
    with patch('main.email_table') as email_table, \
         patch('main.paper_table') as paper_table, \
         patch('main.podcast_table') as podcast_table, \
         patch('main.paper_requests_table') as requests_table:

        # Configure mock responses
        email_table.get_item.return_value = {'Item': {
            'email': 'test@example.com',
            'signup_timestamp': 1234567890,
            'subscribed': True
        }}

        paper_table.get_item.return_value = {'Item': {
            'paper_id': 'test-paper-123',
            'title': 'Test Paper',
            'authors': ['Test Author'],
            'abstract': 'Test abstract',
            'pdf_url': 'https://example.com/test.pdf',
            'full_text': 'Full paper text here...'
        }}

        podcast_table.get_item.return_value = {'Item': {
            'podcast_id': 'test-podcast-123',
            'paper_id': 'test-paper-123',
            'paper_title': 'Test Paper',
            'paper_authors': 'Test Author',
            'paper_url': 'https://example.com/test.pdf',
            'audio_url': 'https://test-bucket.s3.amazonaws.com/podcasts/test.mp3',
            'transcript': 'Test transcript...',
            'created_at': 1234567890,
            'sent_at': None,
            'recipients_count': 0
        }}

        email_table.scan.return_value = {
            'Items': [
                {'email': 'user1@example.com', 'subscribed': True},
                {'email': 'user2@example.com', 'subscribed': True}
            ]
        }

        yield {
            'email_table': email_table,
            'paper_table': paper_table,
            'podcast_table': podcast_table,
            'requests_table': requests_table
        }


@pytest.fixture
def mock_openai():
    """Mock OpenAI API for transcript generation"""
    with patch('services.podcast_service.openai.chat.completions.create') as mock:
        mock.return_value = Mock(
            choices=[Mock(message=Mock(content='Host: Welcome!\nExpert: Thank you!'))]
        )
        yield mock


@pytest.fixture
def mock_elevenlabs():
    """Mock ElevenLabs API for audio generation"""
    with patch('services.podcast_service.requests.post') as mock:
        mock.return_value = Mock(
            status_code=200,
            content=b'fake audio data'
        )
        yield mock


@pytest.fixture
def mock_s3():
    """Mock S3 upload"""
    with patch('services.podcast_service.boto3.client') as mock:
        s3_client = Mock()
        mock.return_value = s3_client
        yield s3_client


@pytest.fixture
def mock_mailgun():
    """Mock Mailgun email sending"""
    with patch('services.email_service.requests.post') as mock:
        mock.return_value = Mock(status_code=200)
        yield mock


@pytest.fixture
def mock_openrouter():
    """Mock OpenRouter API for PDF metadata extraction"""
    with patch('services.openrouter_service.requests.post') as mock:
        mock.return_value = Mock(
            status_code=200,
            json=lambda: {
                'choices': [{
                    'message': {
                        'content': json.dumps({
                            'title': 'Extracted Paper Title',
                            'authors': ['Author One', 'Author Two'],
                            'abstract': 'This is the extracted abstract from the paper.',
                            'keywords': ['AI', 'Machine Learning', 'Research']
                        })
                    }
                }]
            }
        )
        yield mock


# ===== Public Endpoint Tests =====

class TestPublicEndpoints:
    """Test public-facing endpoints"""

    def test_health_check(self):
        """Test /api/health endpoint"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        assert 'version' in data
        assert 'features' in data

    def test_signup_new_user(self, mock_dynamodb, mock_mailgun):
        """Test /api/signup with new user"""
        mock_dynamodb['email_table'].put_item.return_value = {}

        response = client.post(
            "/api/signup",
            json={"email": "newuser@example.com", "name": "New User"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data['email'] == 'newuser@example.com'
        assert 'Successfully added' in data['message']

    def test_signup_duplicate_user(self, mock_dynamodb):
        """Test /api/signup with existing user"""
        from botocore.exceptions import ClientError

        mock_dynamodb['email_table'].put_item.side_effect = ClientError(
            {'Error': {'Code': 'ConditionalCheckFailedException'}},
            'PutItem'
        )

        response = client.post(
            "/api/signup",
            json={"email": "existing@example.com"}
        )
        assert response.status_code == 409
        assert 'already on the waitlist' in response.json()['detail']

    def test_unsubscribe(self, mock_dynamodb):
        """Test /api/unsubscribe endpoint"""
        mock_dynamodb['email_table'].update_item.return_value = {}

        response = client.post(
            "/api/unsubscribe",
            json="test@example.com",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        assert 'Successfully unsubscribed' in response.json()['message']


# ===== Admin Endpoint Tests =====

class TestAdminEndpoints:
    """Test admin-only endpoints"""

    def test_get_stats(self, mock_dynamodb):
        """Test /api/admin/stats endpoint"""
        mock_dynamodb['email_table'].scan.return_value = {
            'Count': 100,
            'Items': []
        }
        mock_dynamodb['podcast_table'].scan.return_value = {
            'Items': [{'sent_at': 1234567890}],
            'Count': 50
        }

        response = client.get("/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert 'total_subscribers' in data
        assert 'total_podcasts' in data

    def test_get_all_users(self, mock_dynamodb):
        """Test /api/admin/users endpoint"""
        mock_dynamodb['email_table'].scan.return_value = {
            'Items': [
                {
                    'email': 'user1@example.com',
                    'subscribed': True,
                    'signup_timestamp': 1234567890,
                    'subscription_tier': 'free',
                    'source': 'organic'
                },
                {
                    'email': 'user2@example.com',
                    'subscribed': False,
                    'signup_timestamp': 1234567891,
                    'subscription_tier': 'individual_monthly',
                    'source': 'bulk_import'
                }
            ]
        }

        response = client.get("/api/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert len(data['users']) == 2
        assert data['total'] == 2
        assert 'stats' in data
        assert data['stats']['subscribed'] == 1
        assert data['stats']['unsubscribed'] == 1
        assert 'tiers' in data['stats']
        assert 'sources' in data['stats']

    def test_quick_add_user(self, mock_dynamodb, mock_mailgun):
        """Test /api/admin/quick-add-user endpoint"""
        mock_dynamodb['email_table'].put_item.return_value = {}

        response = client.post(
            "/api/admin/quick-add-user",
            json={"email": "quickadd@example.com", "name": "Quick User"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data['email'] == 'quickadd@example.com'
        assert 'successfully' in data['message'].lower()

    def test_bulk_import_users(self, mock_dynamodb):
        """Test /api/admin/bulk-import-users endpoint"""
        mock_dynamodb['email_table'].put_item.return_value = {}

        response = client.post(
            "/api/admin/bulk-import-users",
            json={
                "emails": [
                    "bulk1@example.com",
                    "bulk2@example.com",
                    "bulk3@example.com"
                ]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data['added'] == 3
        assert data['total'] == 3


# ===== Podcast Generation Workflow Tests =====

class TestPodcastWorkflow:
    """Test the complete podcast generation workflow step-by-step"""

    @pytest.fixture
    def mock_pdf_upload(self):
        """Mock PDF file upload"""
        from io import BytesIO
        pdf_content = b'%PDF-1.4 fake pdf content'
        return {"file": ("test.pdf", BytesIO(pdf_content), "application/pdf")}

    def test_step1_upload_pdf(self, mock_dynamodb, mock_openrouter, mock_pdf_upload):
        """Step 1: Upload PDF and extract metadata with OCR"""
        with patch('services.pdf_service.PDFService.extract_text_from_bytes_detailed') as mock_pdf:
            mock_pdf.return_value = {
                'full_text': 'Full extracted text from PDF...',
                'pages': [
                    {'page_number': 1, 'text': 'Page 1 text', 'char_count': 100, 'line_count': 10},
                    {'page_number': 2, 'text': 'Page 2 text', 'char_count': 150, 'line_count': 15}
                ],
                'total_pages': 2,
                'total_chars': 250
            }

            mock_dynamodb['paper_table'].put_item.return_value = {}

            response = client.post(
                "/api/admin/upload-pdf",
                files=mock_pdf_upload,
                data={"paper_url": "https://example.com/paper.pdf"}
            )

            assert response.status_code == 200
            data = response.json()

            # Verify paper data
            assert 'paper_id' in data
            assert data['title'] == 'Extracted Paper Title'
            assert len(data['authors']) == 2
            assert 'abstract' in data

            # Verify OCR details
            assert 'ocr_details' in data
            assert data['ocr_details']['total_pages'] == 2
            assert data['ocr_details']['total_chars'] == 250
            assert len(data['ocr_details']['pages']) == 2

            print(f"✅ Step 1: PDF uploaded, paper_id = {data['paper_id']}")

    def test_step2_generate_transcript(self, mock_dynamodb, mock_openai):
        """Step 2: Generate podcast transcript from paper"""
        response = client.post(
            "/api/admin/generate-transcript",
            data={
                "paper_id": "test-paper-123",
                "use_full_text": "false",
                "technical_level": "undergrad",
                "host_persona": "curious_journalist",
                "expert_persona": "academic_expert"
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Verify transcript generation
        assert 'transcript' in data
        assert 'paper_id' in data
        assert data['paper_id'] == 'test-paper-123'

        # Verify stats
        assert 'stats' in data
        assert data['stats']['char_count'] > 0
        assert data['stats']['word_count'] > 0
        assert data['stats']['technical_level'] == 'undergrad'
        assert 'personas' in data['stats']

        print(f"✅ Step 2: Transcript generated, length = {data['stats']['char_count']} chars")

    def test_step3_convert_to_audio(self, mock_dynamodb, mock_elevenlabs, mock_s3):
        """Step 3: Convert transcript to audio"""
        mock_dynamodb['paper_table'].update_item.return_value = {}
        mock_dynamodb['podcast_table'].put_item.return_value = {}

        response = client.post(
            "/api/admin/convert-to-audio",
            data={
                "paper_id": "test-paper-123",
                "transcript": "Host: Welcome to the podcast!\nExpert: Thank you for having me!",
                "voice_preset": "default"
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Verify podcast creation
        assert 'podcast_id' in data
        assert 'audio_url' in data
        assert 's3.amazonaws.com' in data['audio_url']

        # Verify stats
        assert 'stats' in data
        assert 'voice_config' in data['stats']
        assert data['stats']['voice_config']['preset'] == 'default'

        print(f"✅ Step 3: Audio generated, podcast_id = {data['podcast_id']}")
        print(f"   Audio URL: {data['audio_url']}")

    def test_step4_send_podcast_all_users(self, mock_dynamodb, mock_mailgun):
        """Step 4a: Send podcast to all subscribers"""
        mock_dynamodb['podcast_table'].update_item.return_value = {}

        response = client.post(
            "/api/admin/send-podcast",
            json={"podcast_id": "test-podcast-123"}
        )

        assert response.status_code == 200
        data = response.json()

        # Verify send results
        assert 'sent' in data
        assert 'failed' in data
        assert 'total_subscribers' in data
        assert data['sent'] == 2  # From mock_dynamodb fixture

        # Verify stats
        assert 'stats' in data
        assert data['stats']['sent_count'] == 2
        assert data['stats']['success_rate'] == 100.0

        print(f"✅ Step 4a: Podcast sent to {data['sent']} subscribers")

    def test_step4_send_podcast_selected_users(self, mock_dynamodb, mock_mailgun):
        """Step 4b: Send podcast to selected users"""
        response = client.post(
            "/api/admin/send-podcast-to-users",
            json={
                "podcast_id": "test-podcast-123",
                "recipient_emails": ["user1@example.com", "user2@example.com"]
            }
        )

        assert response.status_code == 200
        data = response.json()

        # Verify targeted send
        assert 'sent' in data
        assert 'failed' in data

        # Verify stats
        assert 'stats' in data
        assert data['stats']['requested'] == 2
        assert data['stats']['found'] == 2

        print(f"✅ Step 4b: Podcast sent to {data['stats']['found']} selected users")

    def test_complete_workflow_integration(self, mock_dynamodb, mock_openrouter,
                                          mock_openai, mock_elevenlabs, mock_s3,
                                          mock_mailgun, mock_pdf_upload):
        """Integration test: Complete workflow from PDF upload to email send"""

        print("\n" + "=" * 80)
        print("🎬 INTEGRATION TEST: Complete Podcast Generation Workflow")
        print("=" * 80)

        # Step 1: Upload PDF
        with patch('services.pdf_service.PDFService.extract_text_from_bytes_detailed') as mock_pdf:
            mock_pdf.return_value = {
                'full_text': 'Research paper full text...',
                'pages': [{'page_number': 1, 'text': 'Page 1', 'char_count': 100, 'line_count': 10}],
                'total_pages': 1,
                'total_chars': 100
            }

            mock_dynamodb['paper_table'].put_item.return_value = {}

            upload_response = client.post(
                "/api/admin/upload-pdf",
                files=mock_pdf_upload,
                data={"paper_url": "https://example.com/research.pdf"}
            )
            assert upload_response.status_code == 200
            paper_id = upload_response.json()['paper_id']
            print(f"✅ Step 1: Uploaded PDF, paper_id = {paper_id}")

        # Step 2: Generate Transcript
        transcript_response = client.post(
            "/api/admin/generate-transcript",
            data={
                "paper_id": paper_id,
                "use_full_text": "false",
                "technical_level": "undergrad"
            }
        )
        assert transcript_response.status_code == 200
        transcript = transcript_response.json()['transcript']
        print(f"✅ Step 2: Generated transcript ({len(transcript)} chars)")

        # Step 3: Convert to Audio
        mock_dynamodb['paper_table'].update_item.return_value = {}
        mock_dynamodb['podcast_table'].put_item.return_value = {}

        audio_response = client.post(
            "/api/admin/convert-to-audio",
            data={
                "paper_id": paper_id,
                "transcript": transcript,
                "voice_preset": "professional"
            }
        )
        assert audio_response.status_code == 200
        podcast_id = audio_response.json()['podcast_id']
        audio_url = audio_response.json()['audio_url']
        print(f"✅ Step 3: Generated audio, podcast_id = {podcast_id}")
        print(f"   Audio URL: {audio_url}")

        # Step 4: Send Podcast
        mock_dynamodb['podcast_table'].update_item.return_value = {}

        send_response = client.post(
            "/api/admin/send-podcast",
            json={"podcast_id": podcast_id}
        )
        assert send_response.status_code == 200
        sent_count = send_response.json()['sent']
        print(f"✅ Step 4: Sent podcast to {sent_count} subscribers")

        print("=" * 80)
        print("🎉 INTEGRATION TEST PASSED: Complete workflow successful!")
        print("=" * 80)


# ===== Voice and Persona Tests =====

class TestVoiceAndPersonas:
    """Test voice preset and persona endpoints"""

    def test_get_available_voices(self):
        """Test /api/admin/voices endpoint"""
        with patch('services.podcast_service.PodcastService.get_available_voices') as mock:
            mock.return_value = [
                {"key": "default", "name": "Default", "description": "Standard voices"},
                {"key": "energetic", "name": "Energetic", "description": "High energy voices"}
            ]

            response = client.get("/api/admin/voices")
            assert response.status_code == 200
            data = response.json()
            assert len(data['voices']) == 2

    def test_get_individual_voices(self):
        """Test /api/admin/individual-voices endpoint"""
        with patch('services.podcast_service.PodcastService.get_all_individual_voices') as mock:
            mock.return_value = [
                {"key": "rachel", "name": "Rachel", "gender": "female"},
                {"key": "adam", "name": "Adam", "gender": "male"}
            ]

            response = client.get("/api/admin/individual-voices")
            assert response.status_code == 200
            data = response.json()
            assert len(data['voices']) == 2

    def test_get_technical_levels(self):
        """Test /api/admin/technical-levels endpoint"""
        with patch('services.podcast_service.PodcastService.get_technical_levels') as mock:
            mock.return_value = [
                {"key": "high_school", "name": "High School"},
                {"key": "undergrad", "name": "Undergraduate"},
                {"key": "grad", "name": "Graduate"}
            ]

            response = client.get("/api/admin/technical-levels")
            assert response.status_code == 200
            data = response.json()
            assert len(data['levels']) == 3

    def test_get_personas(self):
        """Test /api/admin/personas endpoint"""
        with patch('services.podcast_service.PodcastService.get_personas') as mock:
            mock.return_value = {
                "host": [
                    {"key": "curious_journalist", "name": "Curious Journalist"}
                ],
                "expert": [
                    {"key": "academic_expert", "name": "Academic Expert"}
                ]
            }

            response = client.get("/api/admin/personas")
            assert response.status_code == 200
            data = response.json()
            assert 'host' in data['personas']
            assert 'expert' in data['personas']


# ===== Run Tests =====

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
