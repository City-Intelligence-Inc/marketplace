import os
import uuid
from typing import Dict
from openai import OpenAI
import boto3
from elevenlabs.client import ElevenLabs

class PodcastService:
    """Service for generating podcasts from research papers"""

    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.elevenlabs_client = ElevenLabs(api_key=os.getenv('ELEVENLABS_API_KEY'))
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

        prompt = f"""You are creating a natural, conversational {length_guidance} podcast script about a research paper.

Paper Title: {paper_data['title']}
Authors: {', '.join(paper_data['authors'])}
{content}

Create a podcast script with TWO speakers (Host and Expert) having a natural conversation. Follow this structure:

OPENING (10%):
- Host opens with an intriguing hook that relates to everyday life or current events
- Make listeners immediately understand why this matters to them
- Expert briefly validates why this is exciting research

CORE CONTENT (70%):
- Host asks curious, probing questions that a listener would ask
- Expert explains concepts clearly without jargon, using analogies when helpful
- Discuss: What problem does this solve? How does it work? What did they discover?
- Keep exchanges short and dynamic - avoid long monologues
- Show enthusiasm and genuine curiosity in the conversation

CLOSING (20%):
- Discuss real-world applications and future implications
- Host summarizes key takeaways in simple terms
- End with a thought-provoking question or future outlook

STYLE GUIDELINES:
- Write like people actually talk: use contractions, natural pauses, "you know", "I mean"
- Keep sentences short and punchy
- Show personality: excitement, surprise, thoughtful pauses
- Avoid academic language - explain as if talking to a smart friend
- NO markdown formatting (no asterisks, no bold, no italics)
- Use simple speaker labels: "Host:" and "Expert:"

Target length: {word_count}

Example of good style:
Host: So what got you excited about this paper?
Expert: Well, you know how we've been talking about AI safety for years? This actually addresses a real gap.
Host: Okay, break that down for me.
Expert: Sure. Think of it like..."""

        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert podcast producer who creates natural, engaging conversations about research papers. You write scripts that sound like real people talking, not reading from a textbook."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=2500
        )

        return response.choices[0].message.content

    def generate_audio(self, script: str, podcast_id: str) -> str:
        """Generate audio from script using ElevenLabs and upload to S3"""
        temp_file = f"/tmp/{podcast_id}.mp3"

        try:
            print(f"Starting audio generation for podcast {podcast_id}...")
            print(f"Script length: {len(script)} characters")

            # Use ElevenLabs with turbo model for faster generation
            print(f"Generating audio with ElevenLabs turbo model...")
            audio_generator = self.elevenlabs_client.text_to_speech.convert(
                text=script,
                voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel's voice ID
                model_id="eleven_turbo_v2_5",  # Fast turbo model
                output_format="mp3_44100_128"
            )

            # Write streaming audio chunks to file
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
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            # Clean up temp file on error
            if os.path.exists(temp_file):
                os.remove(temp_file)
            raise

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
