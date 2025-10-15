import os
import uuid
from typing import Dict
from openai import OpenAI
from elevenlabs import client as elevenlabs_client, save
import boto3

class PodcastService:
    """Service for generating podcasts from research papers"""

    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.elevenlabs_api_key = os.getenv('ELEVENLABS_API_KEY')
        self.s3_client = boto3.client('s3', region_name=os.getenv('AWS_REGION', 'us-east-1'))
        self.bucket_name = os.getenv('S3_BUCKET_NAME', '40k-arr-saas-podcasts')

    def generate_podcast_script(self, paper_data: Dict, use_full_text: bool = False) -> str:
        """Generate podcast script from paper using OpenAI"""

        # Determine content to use
        if use_full_text and 'full_text' in paper_data:
            content = f"Full Paper Text (excerpt):\n{paper_data['full_text']}"
            length_guidance = "7-10 minute"
            word_count = "1000-1400 words"
        else:
            content = f"Abstract: {paper_data['abstract']}"
            length_guidance = "5-7 minute"
            word_count = "700-900 words"

        prompt = f"""You are creating an engaging {length_guidance} podcast script about a research paper.

Paper Title: {paper_data['title']}
Authors: {', '.join(paper_data['authors'])}
{content}

Create a conversational podcast script with TWO speakers (Host and Expert) that:
1. Opens with an engaging hook about why this research matters
2. Explains the key problem the paper addresses
3. Describes the main methodology or approach
4. Highlights the most important findings
5. Discusses real-world implications
6. Ends with takeaways for listeners

Format as:
Host: [dialogue]
Expert: [dialogue]

Make it accessible, enthusiastic, and engaging for a technical but non-specialist audience. Keep it around {word_count}."""

        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert science communicator who creates engaging podcast scripts."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        return response.choices[0].message.content

    def generate_audio(self, script: str, podcast_id: str) -> str:
        """Generate audio from script using ElevenLabs and upload to S3"""
        from elevenlabs.client import ElevenLabs
        import httpx

        # Create client with increased timeout
        timeout = httpx.Timeout(300.0, connect=60.0, read=300.0, write=60.0)
        httpx_client = httpx.Client(timeout=timeout)
        client = ElevenLabs(
            api_key=self.elevenlabs_api_key,
            httpx_client=httpx_client
        )

        temp_file = f"/tmp/{podcast_id}.mp3"

        try:
            # Generate audio with streaming to avoid timeout
            print(f"Starting audio generation for podcast {podcast_id}...")
            print(f"Script length: {len(script)} characters")

            # Use text_to_speech.convert with streaming
            audio_generator = client.text_to_speech.convert(
                text=script,
                voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel voice ID
                model_id="eleven_monolingual_v1",
                output_format="mp3_44100_128"
            )

            # Write streaming audio to file
            print(f"Streaming audio to {temp_file}...")
            with open(temp_file, "wb") as f:
                for chunk in audio_generator:
                    if chunk:
                        f.write(chunk)

            print(f"Audio file created, size: {os.path.getsize(temp_file)} bytes")

            # Upload to S3
            s3_key = f"podcasts/{podcast_id}.mp3"
            print(f"Uploading to S3: {s3_key}...")
            self.s3_client.upload_file(
                temp_file,
                self.bucket_name,
                s3_key,
                ExtraArgs={'ContentType': 'audio/mpeg'}
            )

            # Generate public URL
            audio_url = f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}"
            print(f"Audio uploaded successfully: {audio_url}")

            # Clean up temp file
            if os.path.exists(temp_file):
                os.remove(temp_file)

            return audio_url

        except Exception as e:
            print(f"Error in generate_audio: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            # Clean up temp file on error
            if os.path.exists(temp_file):
                os.remove(temp_file)
            raise
        finally:
            httpx_client.close()

    def create_podcast(self, paper_data: Dict, use_full_text: bool = False) -> Dict:
        """Generate complete podcast from paper"""
        podcast_id = str(uuid.uuid4())

        # Generate script
        print(f"Generating script for {paper_data['title']}...")
        script = self.generate_podcast_script(paper_data, use_full_text)

        # Generate audio
        print(f"Generating audio...")
        audio_url = self.generate_audio(script, podcast_id)

        return {
            "podcast_id": podcast_id,
            "script": script,
            "audio_url": audio_url
        }
