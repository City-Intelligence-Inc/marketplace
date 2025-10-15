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

    def generate_podcast_script(self, paper_data: Dict) -> str:
        """Generate podcast script from paper using OpenAI"""
        prompt = f"""You are creating an engaging 5-7 minute podcast script about a research paper.

Paper Title: {paper_data['title']}
Authors: {', '.join(paper_data['authors'])}
Abstract: {paper_data['abstract']}

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

Make it accessible, enthusiastic, and engaging for a technical but non-specialist audience. Keep it around 800-1000 words."""

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

        client = ElevenLabs(api_key=self.elevenlabs_api_key)

        # Generate audio - using single voice for now
        # You can enhance this to use multiple voices for dialogue
        audio = client.generate(
            text=script,
            voice="Rachel",  # Professional female voice
            model="eleven_monolingual_v1"
        )

        # Save to temporary file
        temp_file = f"/tmp/{podcast_id}.mp3"
        save(audio, temp_file)

        # Upload to S3
        s3_key = f"podcasts/{podcast_id}.mp3"
        self.s3_client.upload_file(
            temp_file,
            self.bucket_name,
            s3_key,
            ExtraArgs={'ContentType': 'audio/mpeg'}
        )

        # Generate public URL
        audio_url = f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}"

        # Clean up temp file
        os.remove(temp_file)

        return audio_url

    def create_podcast(self, paper_data: Dict) -> Dict:
        """Generate complete podcast from paper"""
        podcast_id = str(uuid.uuid4())

        # Generate script
        print(f"Generating script for {paper_data['title']}...")
        script = self.generate_podcast_script(paper_data)

        # Generate audio
        print(f"Generating audio...")
        audio_url = self.generate_audio(script, podcast_id)

        return {
            "podcast_id": podcast_id,
            "script": script,
            "audio_url": audio_url
        }
