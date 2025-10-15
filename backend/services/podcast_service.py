import os
import uuid
import re
from typing import Dict, List, Tuple
from openai import OpenAI
import boto3
from elevenlabs.client import ElevenLabs
from io import BytesIO

class PodcastService:
    """Service for generating podcasts from research papers"""

    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.elevenlabs_client = ElevenLabs(api_key=os.getenv('ELEVENLABS_API_KEY'))
        self.s3_client = boto3.client('s3', region_name=os.getenv('AWS_REGION', 'us-east-1'))
        self.bucket_name = os.getenv('S3_BUCKET_NAME', '40k-arr-saas-podcasts')

        # Voice configuration for natural conversation
        self.host_voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel - warm, curious host
        self.expert_voice_id = "pNInz6obpgDQGcFmaJgB"  # Adam - knowledgeable expert

    def generate_podcast_script_from_text(self, text: str, title: str = "Custom Content") -> str:
        """Generate podcast script from any text using OpenAI with CRAFT prompt framework"""

        # Determine length based on text size
        text_length = len(text)
        if text_length > 2000:
            length_guidance = "7-10 minute"
            word_count = "1000-1400 words"
        else:
            length_guidance = "5-7 minute"
            word_count = "700-900 words"

        prompt = f"""# CONTEXT & ROLE
You are an award-winning podcast producer creating a {length_guidance} conversational podcast episode about the following content. Your specialty is making complex topics accessible and engaging for curious listeners.

The podcast features two distinct personalities:
- HOST (Alex): Curious, asks questions listeners would ask, represents the audience's perspective. Enthusiastic but not afraid to say "wait, explain that again." Conversational and relatable.
- EXPERT (Dr. Chen): Knowledgeable expert who explains concepts clearly without condescension. Uses analogies, avoids jargon, shows genuine excitement about the topic. Friendly teacher vibe.

# ACTION & TASK
Create a complete podcast script that transforms this content into an engaging, natural conversation between Alex (Host) and Dr. Chen (Expert).

## Content to Discuss:
Title: {title}
Content: {text}

## Script Requirements:
Your script must be {word_count} and follow this three-act structure:

**ACT 1 - THE HOOK (10% of script, ~70-140 words):**
- Alex opens with a relatable scenario or current event that connects to the content
- Immediately establish why listeners should care (personal impact, societal relevance)
- Dr. Chen validates the excitement with a compelling "why now" statement
- Create intrigue without revealing everything upfront

**ACT 2 - THE EXPLORATION (70% of script, ~490-980 words):**
- Alex asks progressively deeper questions that build understanding
- Dr. Chen explains:
  * What problem or topic does this address?
  * What's the key insight or innovation?
  * How does it actually work? (use analogies)
  * What are the important takeaways?
- Keep exchanges dynamic: question → concise answer → follow-up → deeper explanation
- Include natural reactions: "Wait, that's huge!" / "Okay so let me make sure I understand..."
- Maximum 2-3 sentences per speaking turn before switching speakers

**ACT 3 - THE IMPACT (20% of script, ~140-280 words):**
- Discuss real-world applications and implications
- Alex asks about practical applications
- Dr. Chen provides balanced perspective (exciting but honest)
- Alex summarizes key takeaways in plain language
- End with forward-looking statement or question that leaves listeners thinking

# FORMAT & CONSTRAINTS

**Critical Formatting Rules:**
1. Use ONLY these exact labels: "Host:" and "Expert:"
2. NO stage directions, NO asterisks, NO parentheticals, NO bold/italics
3. Write EXACTLY how people speak: contractions, filler words, natural pauses
4. Every speaking turn must be 1-3 sentences maximum (conversational ping-pong)
5. Never write labels like [Host] or (Host) - always "Host:" at start of line

**Dialogue Style Rules:**
- Use conversational markers: "you know", "I mean", "right?", "actually", "so"
- Include thinking sounds when natural: "hmm", "oh!", "wait"
- Sentence fragments are okay: "Exactly." / "Not quite."
- Questions should sound spontaneous: "But how does that even work?" not "Can you explain the mechanism?"
- Avoid formal transitions: Say "So what's wild about this..." not "Another interesting aspect is..."

**Content Rules:**
- NO jargon without immediate plain-language explanation
- NO reading of technical details or data tables
- Use analogies for complex concepts (compare to everyday things)
- Show personality: excitement, surprise, "mind blown" moments

# TONE & STYLE
- Enthusiastic but credible
- Conversational but informative
- Accessible but respecting listener intelligence
- Natural humor when appropriate
- Genuine curiosity and discovery

Now generate the complete {word_count} podcast script following ALL the rules above."""

        response = self.openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert podcast scriptwriter specializing in making any topic accessible and engaging. You create natural dialogue that sounds like two real people having an enthusiastic conversation, not reading from notes. You follow formatting rules precisely and never include stage directions or labels that should not be spoken aloud."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.85,
            max_tokens=3000
        )

        return response.choices[0].message.content

    def generate_podcast_script(self, paper_data: Dict, use_full_text: bool = False) -> str:
        """Generate podcast script from paper using OpenAI with CRAFT prompt framework"""

        # Determine content to use
        if use_full_text and 'full_text' in paper_data:
            content = f"Full Paper Text (excerpt):\n{paper_data['full_text']}"
            length_guidance = "7-10 minute"
            word_count = "1000-1400 words"
        else:
            content = f"Abstract: {paper_data['abstract']}"
            length_guidance = "5-7 minute"
            word_count = "700-900 words"

        # CRAFT Framework Prompt
        prompt = f"""# CONTEXT & ROLE
You are an award-winning podcast producer creating a {length_guidance} conversational podcast episode about cutting-edge AI research. Your specialty is making complex academic papers accessible and engaging for curious listeners who want to stay informed about AI advances but don't have time to read full papers.

The podcast features two distinct personalities:
- HOST (Alex): Curious, asks questions listeners would ask, represents the audience's perspective. Enthusiastic but not afraid to say "wait, explain that again." Conversational and relatable.
- EXPERT (Dr. Chen): Knowledgeable researcher who explains concepts clearly without condescension. Uses analogies, avoids jargon, shows genuine excitement about breakthroughs. Friendly teacher vibe.

# ACTION & TASK
Create a complete podcast script for this research paper that transforms dense academic content into an engaging, natural conversation between Alex (Host) and Dr. Chen (Expert).

## Paper Details:
Title: {paper_data['title']}
Authors: {', '.join(paper_data['authors'])}
{content}

## Script Requirements:
Your script must be {word_count} and follow this three-act structure:

**ACT 1 - THE HOOK (10% of script, ~70-140 words):**
- Alex opens with a relatable scenario or current event that connects to the paper
- Immediately establish why listeners should care (personal impact, societal relevance)
- Dr. Chen validates the excitement with a compelling "why now" statement
- Create intrigue without revealing everything upfront

**ACT 2 - THE EXPLORATION (70% of script, ~490-980 words):**
- Alex asks progressively deeper questions that build understanding
- Dr. Chen explains:
  * What problem does this research solve?
  * What's the key innovation or breakthrough?
  * How does it actually work? (use analogies)
  * What did they discover/achieve?
- Keep exchanges dynamic: question → concise answer → follow-up → deeper explanation
- Include natural reactions: "Wait, that's huge!" / "Okay so let me make sure I understand..."
- Maximum 2-3 sentences per speaking turn before switching speakers

**ACT 3 - THE IMPACT (20% of script, ~140-280 words):**
- Discuss real-world applications and implications
- Alex asks about timeline/feasibility
- Dr. Chen provides balanced perspective (exciting but honest about challenges)
- Alex summarizes key takeaways in plain language
- End with forward-looking statement or question that leaves listeners thinking

# FORMAT & CONSTRAINTS

**Critical Formatting Rules:**
1. Use ONLY these exact labels: "Host:" and "Expert:"
2. NO stage directions, NO asterisks, NO parentheticals, NO bold/italics
3. Write EXACTLY how people speak: contractions, filler words, natural pauses
4. Every speaking turn must be 1-3 sentences maximum (conversational ping-pong)
5. Never write labels like [Host] or (Host) - always "Host:" at start of line

**Dialogue Style Rules:**
- Use conversational markers: "you know", "I mean", "right?", "actually", "so"
- Include thinking sounds when natural: "hmm", "oh!", "wait"
- Sentence fragments are okay: "Exactly." / "Not quite."
- Questions should sound spontaneous: "But how does that even work?" not "Can you explain the mechanism?"
- Avoid formal transitions: Say "So what's wild about this..." not "Another interesting aspect is..."

**Content Rules:**
- NO jargon without immediate plain-language explanation
- NO reading of equations or formulas
- NO listing of author names or institutional affiliations in dialogue
- Use analogies for complex concepts (compare to everyday things)
- Show personality: excitement, surprise, "mind blown" moments

# EXAMPLES OF GOOD DIALOGUE

**GOOD - Natural & Engaging:**
Host: Okay, so AI models forgetting old skills when they learn new ones. That sounds like me trying to learn Spanish while my French gets rusty.
Expert: Ha! Yeah, that's exactly it. It's called catastrophic forgetting, and it's been a huge problem. But this paper tackles it in a really clever way.
Host: I'm listening. How?
Expert: So instead of trying to remember everything, they basically teach the model what's safe to forget and what's critical to keep. Think of it like cleaning out your closet but keeping your favorite jacket.

**BAD - Too formal, too long:**
Host: Could you explain the concept of catastrophic forgetting and how this research addresses it?
Expert: Catastrophic forgetting is a phenomenon in machine learning where artificial neural networks tend to forget previously learned information when trained on new tasks. The researchers in this paper have developed a novel approach that utilizes selective memory consolidation to mitigate this issue through a sophisticated weighting mechanism.

**GOOD - Shows personality:**
Host: Wait wait wait. You're telling me it works with any model?
Expert: Any model.
Host: That's huge!
Expert: Right? That's what got me excited. It's not just some specialized technique. This is plug-and-play.

# TONE & STYLE
- Enthusiastic but credible
- Conversational but informative
- Accessible but respecting listener intelligence
- Natural humor when appropriate
- Genuine curiosity and discovery

Now generate the complete {word_count} podcast script following ALL the rules above."""

        response = self.openai_client.chat.completions.create(
            model="gpt-4o",  # Using full GPT-4 for better quality
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert podcast scriptwriter specializing in making academic research accessible and engaging. You create natural dialogue that sounds like two real people having an enthusiastic conversation, not reading from notes. You follow formatting rules precisely and never include stage directions or labels that should not be spoken aloud."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.85,
            max_tokens=3000
        )

        return response.choices[0].message.content

    def parse_script_by_speaker(self, script: str) -> List[Tuple[str, str]]:
        """Parse script into (speaker, text) tuples, removing speaker labels"""
        import re

        # Split by speaker labels using regex
        # This will catch "Host:" or "Expert:" at the beginning of a line
        pattern = r'^(Host|Expert):\s*(.*)$'

        lines = script.strip().split('\n')
        segments = []
        current_speaker = None
        current_text = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check if line matches speaker pattern
            match = re.match(pattern, line, re.IGNORECASE)

            if match:
                # Save previous segment
                if current_speaker and current_text:
                    text = ' '.join(current_text).strip()
                    if text:  # Only add non-empty segments
                        segments.append((current_speaker, text))

                # Start new segment
                speaker_label = match.group(1).lower()
                text_content = match.group(2).strip()

                current_speaker = 'host' if speaker_label == 'host' else 'expert'
                current_text = [text_content] if text_content else []
            else:
                # Continuation of current speaker's text
                if current_speaker:
                    current_text.append(line)

        # Add final segment
        if current_speaker and current_text:
            text = ' '.join(current_text).strip()
            if text:
                segments.append((current_speaker, text))

        # Debug logging
        print(f"\n=== PARSED {len(segments)} SEGMENTS ===")
        for i, (speaker, text) in enumerate(segments[:5]):  # Show first 5
            print(f"{i+1}. [{speaker.upper()}]: {text[:80]}...")

        return segments

    def generate_audio(self, script: str, podcast_id: str) -> str:
        """Generate multi-voice audio from script using ElevenLabs and upload to S3"""
        temp_file = f"/tmp/{podcast_id}.mp3"

        try:
            print(f"Starting multi-voice audio generation for podcast {podcast_id}...")
            print(f"Script length: {len(script)} characters")

            # Parse script into segments by speaker
            segments = self.parse_script_by_speaker(script)
            print(f"Parsed {len(segments)} speech segments")

            if not segments:
                raise ValueError("No speech segments found in script")

            # Generate audio for each segment and concatenate MP3 bytes directly
            all_audio_bytes = b''
            voice_usage_count = {'host': 0, 'expert': 0}

            for i, (speaker, text) in enumerate(segments):
                if not text.strip():
                    continue

                voice_id = self.host_voice_id if speaker == 'host' else self.expert_voice_id
                speaker_label = "Host (Rachel)" if speaker == 'host' else "Expert (Adam)"
                voice_usage_count[speaker] += 1

                print(f"\nSegment {i+1}/{len(segments)} - {speaker_label}")
                print(f"  Voice ID: {voice_id}")
                print(f"  Text: {text[:80]}...")

                try:
                    # Generate audio for this segment
                    audio_generator = self.elevenlabs_client.text_to_speech.convert(
                        text=text,
                        voice_id=voice_id,
                        model_id="eleven_turbo_v2_5",
                        output_format="mp3_44100_128"
                    )

                    # Collect audio chunks for this segment
                    segment_bytes = b''
                    for chunk in audio_generator:
                        if chunk:
                            segment_bytes += chunk

                    # Append to final audio (simple MP3 concatenation)
                    all_audio_bytes += segment_bytes
                    print(f"  ✓ Generated {len(segment_bytes)} bytes of audio")

                except Exception as e:
                    print(f"  ✗ Error generating segment {i+1}: {e}")
                    raise

            # Summary of voice usage
            print(f"\n=== VOICE USAGE SUMMARY ===")
            print(f"Host (Rachel) segments: {voice_usage_count['host']}")
            print(f"Expert (Adam) segments: {voice_usage_count['expert']}")
            print(f"Total segments: {len(segments)}")

            # Write concatenated audio to file
            print(f"Writing final audio to {temp_file}...")
            with open(temp_file, 'wb') as f:
                f.write(all_audio_bytes)
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
        print(f"Generating multi-voice audio...")
        audio_url = self.generate_audio(script, podcast_id)

        return {
            "podcast_id": podcast_id,
            "script": script,
            "audio_url": audio_url
        }
