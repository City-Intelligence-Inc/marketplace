import os
import uuid
import re
from typing import Dict, List, Tuple
from openai import OpenAI
import boto3
from elevenlabs.client import ElevenLabs
from io import BytesIO
from pydub import AudioSegment
from pydub.effects import normalize

class PodcastService:
    """Service for generating podcasts from research papers"""

    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.elevenlabs_client = ElevenLabs(api_key=os.getenv('ELEVENLABS_API_KEY'))
        self.s3_client = boto3.client('s3', region_name=os.getenv('AWS_REGION', 'us-east-1'))
        self.bucket_name = os.getenv('S3_BUCKET_NAME', '40k-arr-saas-podcasts')

        # Voice presets - different persona combinations using 11Labs voices
        self.voice_presets = {
            'default': {
                'host_id': "21m00Tcm4TlvDq8ikWAM",  # Rachel - warm, curious
                'expert_id': "pNInz6obpgDQGcFmaJgB",  # Adam - knowledgeable
                'host_name': 'Rachel',
                'expert_name': 'Adam',
                'description': 'Warm & Professional'
            },
            'energetic': {
                'host_id': "EXAVITQu4vr4xnSDxMaL",  # Bella - enthusiastic, energetic
                'expert_id': "VR6AewLTigWG4xSOukaG",  # Arnold - deep, authoritative
                'host_name': 'Bella',
                'expert_name': 'Arnold',
                'description': 'Energetic & Authoritative'
            },
            'calm': {
                'host_id': "pNInz6obpgDQGcFmaJgB",  # Adam - calm, clear
                'expert_id': "ThT5KcBeYPX3keUQqHPh",  # Dorothy - wise, soothing
                'host_name': 'Adam',
                'expert_name': 'Dorothy',
                'description': 'Calm & Wise'
            },
            'dynamic': {
                'host_id': "ErXwobaYiN019PkySvjV",  # Antoni - clear, well-paced
                'expert_id': "21m00Tcm4TlvDq8ikWAM",  # Rachel - warm, engaging
                'host_name': 'Antoni',
                'expert_name': 'Rachel',
                'description': 'Dynamic & Engaging'
            },
            'professional': {
                'host_id': "onwK4e9ZLuTAKqWW03F9",  # Daniel - British, professional
                'expert_id': "ThT5KcBeYPX3keUQqHPh",  # Dorothy - wise, experienced
                'host_name': 'Daniel',
                'expert_name': 'Dorothy',
                'description': 'British & Sophisticated'
            },
            'youthful': {
                'host_id': "EXAVITQu4vr4xnSDxMaL",  # Bella - young, excited
                'expert_id': "ErXwobaYiN019PkySvjV",  # Antoni - friendly teacher
                'host_name': 'Bella',
                'expert_name': 'Antoni',
                'description': 'Youthful & Educational'
            },
            'deep_dive': {
                'host_id': "pNInz6obpgDQGcFmaJgB",  # Adam - analytical
                'expert_id': "VR6AewLTigWG4xSOukaG",  # Arnold - authoritative, deep voice
                'host_name': 'Adam',
                'expert_name': 'Arnold',
                'description': 'Deep & Analytical'
            },
            'conversational': {
                'host_id': "21m00Tcm4TlvDq8ikWAM",  # Rachel - conversational
                'expert_id': "ErXwobaYiN019PkySvjV",  # Antoni - friendly
                'host_name': 'Rachel',
                'expert_name': 'Antoni',
                'description': 'Friendly Conversation'
            },
            'authoritative': {
                'host_id': "onwK4e9ZLuTAKqWW03F9",  # Daniel - professional British
                'expert_id': "VR6AewLTigWG4xSOukaG",  # Arnold - deep authoritative
                'host_name': 'Daniel',
                'expert_name': 'Arnold',
                'description': 'Authoritative & Expert'
            },
            'engaging': {
                'host_id': "EXAVITQu4vr4xnSDxMaL",  # Bella - enthusiastic
                'expert_id': "21m00Tcm4TlvDq8ikWAM",  # Rachel - engaging
                'host_name': 'Bella',
                'expert_name': 'Rachel',
                'description': 'Highly Engaging'
            }
        }

        # Default voice configuration
        self.host_voice_id = self.voice_presets['default']['host_id']
        self.expert_voice_id = self.voice_presets['default']['expert_id']

        # All available individual 11Labs voices with personas
        self.all_voices = {
            'rachel': {'id': '21m00Tcm4TlvDq8ikWAM', 'name': 'Rachel', 'description': 'Warm, curious, engaging'},
            'adam': {'id': 'pNInz6obpgDQGcFmaJgB', 'name': 'Adam', 'description': 'Knowledgeable, calm, clear'},
            'bella': {'id': 'EXAVITQu4vr4xnSDxMaL', 'name': 'Bella', 'description': 'Enthusiastic, energetic, youthful'},
            'arnold': {'id': 'VR6AewLTigWG4xSOukaG', 'name': 'Arnold', 'description': 'Deep, authoritative, commanding'},
            'dorothy': {'id': 'ThT5KcBeYPX3keUQqHPh', 'name': 'Dorothy', 'description': 'Wise, soothing, experienced'},
            'antoni': {'id': 'ErXwobaYiN019PkySvjV', 'name': 'Antoni', 'description': 'Clear, well-paced, friendly teacher'},
            'daniel': {'id': 'onwK4e9ZLuTAKqWW03F9', 'name': 'Daniel', 'description': 'British, professional, sophisticated'}
        }

        # Persona templates for different host/expert personalities
        self.personas = {
            'curious_journalist': {
                'role': 'Host',
                'name': 'Curious Tech Journalist',
                'personality': 'Asks probing questions, represents audience curiosity, enthusiastic about discoveries',
                'voice_suggestions': ['rachel', 'bella', 'antoni']
            },
            'skeptical_reporter': {
                'role': 'Host',
                'name': 'Skeptical Reporter',
                'personality': 'Questions claims, plays devil\'s advocate, wants concrete evidence',
                'voice_suggestions': ['adam', 'daniel', 'arnold']
            },
            'excited_enthusiast': {
                'role': 'Host',
                'name': 'Excited Enthusiast',
                'personality': 'Passionate about tech, gets genuinely excited, lots of "wow" moments',
                'voice_suggestions': ['bella', 'rachel', 'antoni']
            },
            'thoughtful_interviewer': {
                'role': 'Host',
                'name': 'Thoughtful Interviewer',
                'personality': 'Reflective, asks deep questions, takes time to understand implications',
                'voice_suggestions': ['adam', 'rachel', 'dorothy']
            },
            'academic_expert': {
                'role': 'Expert',
                'name': 'Academic Researcher',
                'personality': 'Deep knowledge, careful with claims, loves to explain methodology',
                'voice_suggestions': ['adam', 'dorothy', 'daniel']
            },
            'industry_practitioner': {
                'role': 'Expert',
                'name': 'Industry Practitioner',
                'personality': 'Real-world focused, talks about applications, business-savvy',
                'voice_suggestions': ['arnold', 'daniel', 'adam']
            },
            'passionate_educator': {
                'role': 'Expert',
                'name': 'Passionate Educator',
                'personality': 'Loves teaching, uses great analogies, excited to share knowledge',
                'voice_suggestions': ['antoni', 'rachel', 'bella']
            },
            'wise_mentor': {
                'role': 'Expert',
                'name': 'Wise Mentor',
                'personality': 'Experienced, puts things in historical context, philosophical',
                'voice_suggestions': ['dorothy', 'daniel', 'arnold']
            },
            'contrarian_thinker': {
                'role': 'Expert',
                'name': 'Contrarian Thinker',
                'personality': 'Challenges conventional wisdom, points out limitations, critical thinking',
                'voice_suggestions': ['arnold', 'daniel', 'adam']
            }
        }

        # Technical level guidance for prompts
        self.technical_levels = {
            'baby': {
                'name': 'Explain to a Child (5 year old)',
                'description': 'Maximum simplification with everyday analogies',
                'audience': 'someone with zero technical background',
                'language': 'Use only the simplest words. Every technical term must be explained like you\'re talking to a 5-year-old. Use lots of everyday analogies (like toys, animals, food).'
            },
            'highschool': {
                'name': 'High School Level',
                'description': 'Basic concepts without heavy jargon',
                'audience': 'a curious high school student',
                'language': 'Use accessible language. Explain technical terms when first introduced. Analogies should relate to everyday experiences.'
            },
            'undergrad': {
                'name': 'Undergraduate Level',
                'description': 'Assumes basic domain knowledge',
                'audience': 'an undergraduate student with some background',
                'language': 'You can use domain terminology but still explain key concepts. Balance accessibility with technical accuracy.'
            },
            'graduate': {
                'name': 'Graduate/Professional',
                'description': 'Technical but still conversational',
                'audience': 'a graduate student or working professional in the field',
                'language': 'Use technical vocabulary freely. Focus on nuances, implications, and methodology. Still keep it conversational.'
            },
            'expert': {
                'name': 'Expert Researcher',
                'description': 'Deep technical discussion',
                'audience': 'an expert researcher in the field',
                'language': 'Full technical depth. Discuss methodology, assumptions, limitations. Reference related work. Dive into details.'
            },
            'nobel': {
                'name': 'Nobel Laureate Level',
                'description': 'Maximum technical sophistication',
                'audience': 'a Nobel laureate or world-leading expert',
                'language': 'Maximum technical sophistication. Discuss subtle implications, theoretical foundations, paradigm shifts. Challenge assumptions. Explore edge cases and theoretical limits.'
            }
        }

    def get_available_voices(self) -> List[Dict]:
        """Get list of available voice presets"""
        voices = []
        for preset_id, preset_data in self.voice_presets.items():
            voices.append({
                'id': preset_id,
                'name': preset_id.replace('_', ' ').title(),
                'description': preset_data['description'],
                'host_name': preset_data['host_name'],
                'expert_name': preset_data['expert_name']
            })
        return voices

    def get_all_individual_voices(self) -> List[Dict]:
        """Get list of all individual voices for custom selection"""
        voices = []
        for voice_key, voice_data in self.all_voices.items():
            voices.append({
                'key': voice_key,
                'id': voice_data['id'],
                'name': voice_data['name'],
                'description': voice_data['description']
            })
        return voices

    def get_technical_levels(self) -> List[Dict]:
        """Get list of available technical levels"""
        levels = []
        for level_key, level_data in self.technical_levels.items():
            levels.append({
                'key': level_key,
                'name': level_data['name'],
                'description': level_data['description']
            })
        return levels

    def get_personas(self) -> List[Dict]:
        """Get list of available personas"""
        personas = []
        for persona_key, persona_data in self.personas.items():
            personas.append({
                'key': persona_key,
                'name': persona_data['name'],
                'role': persona_data['role'],
                'personality': persona_data['personality'],
                'voice_suggestions': persona_data['voice_suggestions']
            })
        return personas

    def generate_voice_preview(self, voice_key: str, role: str = 'host') -> bytes:
        """Generate a short preview audio for a voice"""
        voice_data = self.all_voices.get(voice_key, self.all_voices['rachel'])
        voice_id = voice_data['id']
        voice_name = voice_data['name']

        # Different sample text for host vs expert
        if role == 'host':
            sample_text = "Hey! So I'm really excited to dive into this topic. It's one of those things that sounds super complex at first, but once you get it... it's actually pretty cool!"
        else:
            sample_text = "Great question! So here's the thing - the way this works is actually pretty fascinating. Let me break it down in a way that makes sense."

        print(f"Generating preview for {voice_name} ({role})...")

        try:
            # Generate preview audio with conversational settings
            audio_generator = self.elevenlabs_client.text_to_speech.convert(
                text=sample_text,
                voice_id=voice_id,
                model_id="eleven_turbo_v2_5",
                output_format="mp3_44100_128",
                voice_settings={
                    "stability": 0.35,  # Very expressive and natural
                    "similarity_boost": 0.85,  # Closer to real human voice
                    "style": 0.65,  # Higher style for more personality
                    "use_speaker_boost": True
                }
            )

            # Collect audio bytes
            audio_bytes = b''
            for chunk in audio_generator:
                if chunk:
                    audio_bytes += chunk

            print(f"✓ Preview generated: {len(audio_bytes)} bytes")
            return audio_bytes

        except Exception as e:
            print(f"Error generating voice preview: {e}")
            raise

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

    def generate_podcast_script(self, paper_data: Dict, use_full_text: bool = False,
                               technical_level: str = 'undergrad', custom_topics: str = None,
                               host_persona: str = 'curious_journalist', expert_persona: str = 'academic_expert') -> str:
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

        # Get technical level guidance
        level_config = self.technical_levels.get(technical_level, self.technical_levels['undergrad'])
        audience_description = level_config['audience']
        language_guidance = level_config['language']

        # Get persona configurations
        host_config = self.personas.get(host_persona, self.personas['curious_journalist'])
        expert_config = self.personas.get(expert_persona, self.personas['academic_expert'])

        # Build custom topics section
        custom_topics_section = ""
        if custom_topics and custom_topics.strip():
            custom_topics_section = f"""

**CUSTOM TOPICS TO COVER:**
The following specific areas MUST be addressed in the podcast (while maintaining natural flow):
{custom_topics}

IMPORTANT: Weave these topics naturally into the conversation. Don't make it feel like a checklist - integrate them organically while keeping the podcast structure and quality standards."""

        # CRAFT Framework Prompt
        prompt = f"""# CONTEXT & ROLE
You are an award-winning podcast producer creating a {length_guidance} conversational podcast episode about cutting-edge AI research for {audience_description}.

The podcast features two distinct personalities:
- HOST: {host_config['name']} - {host_config['personality']}
- EXPERT: {expert_config['name']} - {expert_config['personality']}

**CRITICAL TECHNICAL LEVEL GUIDANCE:**
{language_guidance}{custom_topics_section}

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

**CRITICAL: Make It Sound Like REAL PEOPLE Talking**

This is NOT a formal interview. This is two friends having an excited conversation at a coffee shop. Write EXACTLY how people actually speak:

**Natural Speech Patterns (USE THESE HEAVILY):**
- Filler words: "um", "uh", "like", "you know", "I mean", "so", "well", "actually"
- Reactions: "Oh!", "Wait", "Whoa", "Hmm", "Interesting", "No way!", "Really?"
- Incomplete thoughts: "So it's like... wait, how do I explain this..."
- Self-corrections: "It's kind of... well, no, it's more like..."
- Thinking out loud: "Let me think... okay so..."
- Casual agreements: "Yeah", "Totally", "Exactly", "Right", "For sure", "Absolutely"

**Conversation Flow:**
- Short bursts, not speeches (1-2 sentences MAX per turn)
- Natural interruptions and build on each other's ideas
- Questions should be casual: "Wait, so how does that work?" not "Could you explain the mechanism?"
- Avoid ANY formal transitions - just flow naturally
- Show they're listening: "Mhm", "Okay", "I see", "Got it"

**Personality & Energy:**
- Get excited! Use exclamation points naturally
- Laugh when appropriate: "Ha!", "That's wild!"
- Express confusion honestly: "Wait, I'm lost", "Hold on, back up"
- Show surprise: "No way!", "Seriously?", "That's insane!"

**What to AVOID:**
- NO perfect sentences every time
- NO formal language ("Furthermore", "Additionally", "In conclusion")
- NO reading lists or data
- NO jargon bombs without explanation
- NO paragraph-long explanations

# EXAMPLES OF REAL CONVERSATIONAL DIALOGUE

**PERFECT - Natural, Energetic, Real:**
Host: Okay, so like, AI models forgetting old stuff when they learn new things? That's literally me trying to learn Spanish while my French just... disappears.
Expert: Ha! Yeah, exactly! It's called catastrophic forgetting, and it's been driving people crazy.
Host: Okay, so what's the trick here?
Expert: Alright, so instead of trying to remember everything, which is impossible, right? They basically teach the model what's safe to forget and what you gotta keep.
Host: Oh, like... cleaning out your closet but keeping your favorite jacket?
Expert: Yes! Perfect analogy!

**BETTER - More Natural Reactions:**
Host: Wait, hold on. You're saying it works with ANY model?
Expert: Any model.
Host: Whoa. That's huge!
Expert: Right? Like, this isn't some specialized thing. It's plug-and-play.
Host: No way. So I could just... drop it in?
Expert: Pretty much, yeah.

**EVEN BETTER - Real Conversation Flow:**
Host: Okay, I gotta ask though... does it actually work?
Expert: So, um, they tested it on like five different models, and—
Host: —And it crushed it?
Expert: It crushed it! Every single one.
Host: That's insane!
Expert: I know! And the crazy part is, it's not even that complicated.
Host: Wait, really?
Expert: Well, I mean, the math is gnarly, but the concept? Super simple.

**BAD - Too Formal, Robotic:**
Host: Could you explain the concept of catastrophic forgetting and how this research addresses it?
Expert: Catastrophic forgetting is a phenomenon in machine learning where artificial neural networks tend to forget previously learned information when trained on new tasks.

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

    def generate_audio(self, script: str, podcast_id: str, voice_preset: str = 'default',
                      host_voice_key: str = None, expert_voice_key: str = None) -> str:
        """Generate multi-voice audio from script using ElevenLabs and upload to S3

        Args:
            script: The podcast script
            podcast_id: Unique podcast ID
            voice_preset: Voice preset to use (ignored if custom voices provided)
            host_voice_key: Custom host voice key (e.g., 'rachel', 'adam')
            expert_voice_key: Custom expert voice key
        """
        temp_file = f"/tmp/{podcast_id}.mp3"

        try:
            # Determine voices to use
            if host_voice_key and expert_voice_key:
                # Use custom voice selection
                host_voice_data = self.all_voices.get(host_voice_key, self.all_voices['rachel'])
                expert_voice_data = self.all_voices.get(expert_voice_key, self.all_voices['adam'])
                host_voice_id = host_voice_data['id']
                expert_voice_id = expert_voice_data['id']
                host_name = host_voice_data['name']
                expert_name = expert_voice_data['name']
                print(f"Using custom voice selection:")
            else:
                # Use voice preset
                preset = self.voice_presets.get(voice_preset, self.voice_presets['default'])
                host_voice_id = preset['host_id']
                expert_voice_id = preset['expert_id']
                host_name = preset['host_name']
                expert_name = preset['expert_name']
                print(f"Using voice preset: {voice_preset} ({preset['description']})")

            print(f"Starting multi-voice audio generation for podcast {podcast_id}...")
            print(f"Host: {host_name}, Expert: {expert_name}")
            print(f"Script length: {len(script)} characters")

            # Parse script into segments by speaker
            segments = self.parse_script_by_speaker(script)
            print(f"Parsed {len(segments)} speech segments")

            if not segments:
                raise ValueError("No speech segments found in script")

            # Generate audio for each segment with volume normalization
            audio_segments = []
            voice_usage_count = {'host': 0, 'expert': 0}
            target_dBFS = -20.0  # Target volume level in dBFS

            for i, (speaker, text) in enumerate(segments):
                if not text.strip():
                    continue

                voice_id = host_voice_id if speaker == 'host' else expert_voice_id
                speaker_label = f"Host ({host_name})" if speaker == 'host' else f"Expert ({expert_name})"
                voice_usage_count[speaker] += 1

                print(f"\nSegment {i+1}/{len(segments)} - {speaker_label}")
                print(f"  Voice ID: {voice_id}")
                print(f"  Text: {text[:80]}...")

                try:
                    # Generate audio for this segment with natural settings
                    # Lower stability (0.4-0.5) = more expressive, less robotic
                    # Similarity boost (0.7-0.8) = closer to natural voice
                    audio_generator = self.elevenlabs_client.text_to_speech.convert(
                        text=text,
                        voice_id=voice_id,
                        model_id="eleven_turbo_v2_5",
                        output_format="mp3_44100_128",
                        voice_settings={
                            "stability": 0.35,  # Much lower = very expressive and natural
                            "similarity_boost": 0.85,  # Higher = closer to real human voice
                            "style": 0.65,  # Higher style for more personality
                            "use_speaker_boost": True  # Enhanced clarity
                        }
                    )

                    # Collect audio chunks for this segment
                    segment_bytes = b''
                    for chunk in audio_generator:
                        if chunk:
                            segment_bytes += chunk

                    # Convert to AudioSegment and normalize volume
                    audio_segment = AudioSegment.from_mp3(BytesIO(segment_bytes))

                    # Normalize to target dBFS
                    change_in_dBFS = target_dBFS - audio_segment.dBFS
                    normalized_segment = audio_segment.apply_gain(change_in_dBFS)

                    audio_segments.append(normalized_segment)
                    print(f"  ✓ Generated {len(segment_bytes)} bytes | Volume: {audio_segment.dBFS:.1f} dBFS → {normalized_segment.dBFS:.1f} dBFS")

                except Exception as e:
                    print(f"  ✗ Error generating segment {i+1}: {e}")
                    raise

            # Summary of voice usage
            print(f"\n=== VOICE USAGE SUMMARY ===")
            print(f"Host ({host_name}) segments: {voice_usage_count['host']}")
            print(f"Expert ({expert_name}) segments: {voice_usage_count['expert']}")
            print(f"Total segments: {len(segments)}")

            # Concatenate all normalized audio segments
            print(f"\n=== CONCATENATING {len(audio_segments)} NORMALIZED SEGMENTS ===")
            final_audio = audio_segments[0]
            for segment in audio_segments[1:]:
                final_audio += segment

            # Export to MP3
            print(f"Exporting final audio to {temp_file}...")
            final_audio.export(temp_file, format="mp3", bitrate="128k")
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

    def create_podcast(self, paper_data: Dict, use_full_text: bool = False, voice_preset: str = 'default') -> Dict:
        """Generate complete podcast from paper"""
        podcast_id = str(uuid.uuid4())

        # Generate script
        print(f"Generating script for {paper_data['title']}...")
        script = self.generate_podcast_script(paper_data, use_full_text)

        # Generate audio
        print(f"Generating multi-voice audio...")
        audio_url = self.generate_audio(script, podcast_id, voice_preset)

        return {
            "podcast_id": podcast_id,
            "script": script,
            "audio_url": audio_url
        }
