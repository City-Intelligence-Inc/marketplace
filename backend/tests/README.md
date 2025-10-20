# Backend API Tests

Comprehensive test suite for City Secretary backend API.

## Setup

Install test dependencies:

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Running Tests

### Run All Tests
```bash
pytest tests/ -v
```

### Run Specific Test Classes
```bash
# Test public endpoints
pytest tests/test_api.py::TestPublicEndpoints -v

# Test admin endpoints
pytest tests/test_api.py::TestAdminEndpoints -v

# Test podcast workflow
pytest tests/test_api.py::TestPodcastWorkflow -v

# Test voice/persona endpoints
pytest tests/test_api.py::TestVoiceAndPersonas -v
```

### Run Specific Tests
```bash
# Test complete workflow integration
pytest tests/test_api.py::TestPodcastWorkflow::test_complete_workflow_integration -v

# Test step-by-step podcast generation
pytest tests/test_api.py::TestPodcastWorkflow::test_step1_upload_pdf -v
pytest tests/test_api.py::TestPodcastWorkflow::test_step2_generate_transcript -v
pytest tests/test_api.py::TestPodcastWorkflow::test_step3_convert_to_audio -v
pytest tests/test_api.py::TestPodcastWorkflow::test_step4_send_podcast_all_users -v
```

### Run with Coverage
```bash
pytest tests/ --cov=. --cov-report=html --cov-report=term
```

View coverage report:
```bash
open htmlcov/index.html
```

## Test Structure

### Test Classes

1. **TestPublicEndpoints**
   - Health check
   - User signup (new and duplicate)
   - Unsubscribe

2. **TestAdminEndpoints**
   - Dashboard stats
   - User management (list, add, bulk import)
   - Quick add user

3. **TestPodcastWorkflow** (Main workflow tests)
   - Step 1: Upload PDF with OCR
   - Step 2: Generate transcript
   - Step 3: Convert to audio
   - Step 4a: Send to all subscribers
   - Step 4b: Send to selected users
   - **Integration test**: Complete end-to-end workflow

4. **TestVoiceAndPersonas**
   - Available voices
   - Individual voices
   - Technical levels
   - Personas

## Workflow Integration Test

The main integration test (`test_complete_workflow_integration`) tests the complete podcast generation pipeline:

```
PDF Upload → Generate Transcript → Convert to Audio → Send to Subscribers
```

This test:
- Uploads a PDF and extracts metadata with LLM
- Generates a conversational transcript
- Converts transcript to audio with ElevenLabs
- Uploads audio to S3
- Sends podcast email to all subscribers

## Mocking Strategy

All external services are mocked:
- **DynamoDB**: Mocked table operations (get, put, scan, update)
- **OpenAI**: Mocked transcript generation
- **OpenRouter**: Mocked PDF metadata extraction
- **ElevenLabs**: Mocked TTS audio generation
- **S3**: Mocked file uploads
- **Mailgun**: Mocked email sending

This allows tests to run fast without hitting real APIs or incurring costs.

## Example Test Output

```
tests/test_api.py::TestPublicEndpoints::test_health_check PASSED
tests/test_api.py::TestPublicEndpoints::test_signup_new_user PASSED
tests/test_api.py::TestPodcastWorkflow::test_step1_upload_pdf PASSED
  ✅ Step 1: PDF uploaded, paper_id = upload-1234567890
tests/test_api.py::TestPodcastWorkflow::test_step2_generate_transcript PASSED
  ✅ Step 2: Transcript generated, length = 1234 chars
tests/test_api.py::TestPodcastWorkflow::test_step3_convert_to_audio PASSED
  ✅ Step 3: Audio generated, podcast_id = abc-123-def
tests/test_api.py::TestPodcastWorkflow::test_step4_send_podcast_all_users PASSED
  ✅ Step 4a: Podcast sent to 2 subscribers
tests/test_api.py::TestPodcastWorkflow::test_complete_workflow_integration PASSED
  🎉 INTEGRATION TEST PASSED: Complete workflow successful!
```

## CI/CD Integration

Add to your CI pipeline (e.g., GitHub Actions):

```yaml
- name: Run tests
  run: |
    pip install -r requirements.txt
    pip install -r requirements-dev.txt
    pytest tests/ -v --cov=. --cov-report=xml

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Import Errors
Make sure you're in the `backend/` directory:
```bash
cd backend
pytest tests/ -v
```

### Environment Variable Errors
Tests set their own test environment variables. If you see AWS/API key errors, ensure mocks are working correctly.

### Fixture Errors
If fixtures aren't working, verify all patches are targeting the correct module paths.
