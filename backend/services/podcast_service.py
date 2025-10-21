import os
import uuid
import re
from typing import Dict, List, Tuple, Optional
from openai import OpenAI
import boto3
from elevenlabs.client import ElevenLabs
from io import BytesIO
import google.generativeai as genai

def analyze_text_emotion(text: str) -> Dict[str, float]:
    """
    Analyze text to determine emotional tone and adjust voice settings dynamically.
    Returns voice settings optimized for the content.

    This makes the TTS sound MORE HUMAN and LESS ROBOTIC by:
    - Detecting excitement/questions/technical content
    - Adjusting expressiveness (stability)
    - Adding personality (style)
    - Making it more natural (similarity_boost)
    """
    text_lower = text.lower()

    # Count emotional indicators
    excitement_words = ['amazing', 'incredible', 'fascinating', 'wow', 'exciting', 'breakthrough',
                        'revolutionary', 'extraordinary', 'fantastic', 'awesome', '!']
    question_words = ['?', 'what', 'why', 'how', 'when', 'where', 'which', 'who']
    technical_words = ['algorithm', 'equation', 'theorem', 'hypothesis', 'methodology',
                       'coefficient', 'variable', 'function', 'parameter', 'matrix']
    conversational_words = ['you know', 'i mean', 'right?', 'well', 'so', 'actually',
                            'basically', 'honestly', 'really', 'totally', 'literally']
    examples_words = ['for example', 'like when', 'imagine', 'let\'s say', 'think about',
                      'picture this', 'suppose']

    # Calculate scores
    excitement_score = sum(1 for word in excitement_words if word in text_lower)
    question_score = sum(1 for word in question_words if word in text_lower)
    technical_score = sum(1 for word in technical_words if word in text_lower)
    conversational_score = sum(1 for word in conversational_words if word in text_lower)
    example_score = sum(1 for word in examples_words if word in text_lower)

    # Count punctuation
    exclamation_count = text.count('!')
    question_count = text.count('?')

    # Determine voice settings based on analysis
    # Base settings (neutral)
    stability = 0.35
    similarity_boost = 0.85
    style = 0.65
    emotion_details = "neutral tone"

    # Adjust based on content type
    if excitement_score > 2 or exclamation_count > 2:
        # Excited, enthusiastic content
        stability = 0.20  # Very expressive
        style = 0.85      # Lots of personality
        similarity_boost = 0.88
        emotion_details = f"EXCITED ({excitement_score} excitement words, {exclamation_count} exclamations)"

    elif question_score > 2 or question_count > 2:
        # Questioning, curious content
        stability = 0.25  # Expressive with variation
        style = 0.75      # Good personality
        similarity_boost = 0.87
        emotion_details = f"QUESTIONING ({question_score} question words, {question_count} question marks)"

    elif technical_score > 3:
        # Technical, detailed explanation
        stability = 0.45  # More stable for clarity
        style = 0.55      # Less exaggerated
        similarity_boost = 0.85
        emotion_details = f"TECHNICAL ({technical_score} technical terms)"

    elif conversational_score > 3 or example_score > 1:
        # Conversational, storytelling
        stability = 0.22  # Very natural variation
        style = 0.80      # Strong personality
        similarity_boost = 0.90  # Very human-like
        emotion_details = f"CONVERSATIONAL ({conversational_score} casual phrases, {example_score} examples)"

    # Long sentences = more stability for clarity
    if len(text) > 200:
        stability = min(stability + 0.05, 0.5)
        emotion_details += f" [long text: +stability]"

    return {
        "stability": stability,
        "similarity_boost": similarity_boost,
        "style": style,
        "use_speaker_boost": True,
        # Metadata for debugging
        "_emotion_type": (
            "excited" if excitement_score > 2 else
            "questioning" if question_score > 2 else
            "technical" if technical_score > 3 else
            "conversational" if conversational_score > 3 else
            "neutral"
        ),
        "_emotion_details": emotion_details
    }

class PodcastService:
    """Service for generating podcasts from research papers"""

    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.elevenlabs_client = ElevenLabs(api_key=os.getenv('ELEVENLABS_API_KEY'))
        self.s3_client = boto3.client('s3', region_name=os.getenv('AWS_REGION', 'us-east-1'))
        self.bucket_name = os.getenv('S3_BUCKET_NAME', '40k-arr-saas-podcasts')

        # Initialize Gemini if API key is available
        self.gemini_available = False
        gemini_api_key = os.getenv('GOOGLE_API_KEY')
        if gemini_api_key:
            try:
                genai.configure(api_key=gemini_api_key)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash-latest')
                self.gemini_available = True
                print("✓ Gemini API initialized successfully")
            except Exception as e:
                print(f"⚠ Gemini initialization failed: {e}")
                self.gemini_available = False
        else:
            print("ℹ No GOOGLE_API_KEY found - Gemini unavailable")

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

    def get_elevenlabs_voices_from_api(self) -> List[Dict]:
        """Fetch ALL voices from user's ElevenLabs account via API"""
        import requests

        try:
            url = "https://api.elevenlabs.io/v1/voices"
            headers = {
                "xi-api-key": os.getenv('ELEVENLABS_API_KEY')
            }

            print("🎤 Fetching voices from ElevenLabs API...")
            response = requests.get(url, headers=headers)
            response.raise_for_status()

            data = response.json()
            voices = []

            for voice in data.get('voices', []):
                voices.append({
                    'id': voice['voice_id'],
                    'name': voice['name'],
                    'category': voice.get('category', 'unknown'),
                    'labels': voice.get('labels', {}),
                    'preview_url': voice.get('preview_url'),
                    'description': voice.get('description', ''),
                })

            print(f"   ✓ Fetched {len(voices)} voices from your account")
            return voices

        except Exception as e:
            print(f"   ✗ Error fetching voices: {e}")
            return []

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
            # Generate preview audio with DYNAMIC settings based on content
            dynamic_settings = analyze_text_emotion(sample_text)
            print(f"   Dynamic settings: {dynamic_settings['_emotion_type']} "
                  f"(stability={dynamic_settings['stability']:.2f}, "
                  f"style={dynamic_settings['style']:.2f})")

            audio_generator = self.elevenlabs_client.text_to_speech.convert(
                text=sample_text,
                voice_id=voice_id,
                model_id="eleven_turbo_v2_5",
                output_format="mp3_44100_128",
                voice_settings={
                    "stability": dynamic_settings["stability"],
                    "similarity_boost": dynamic_settings["similarity_boost"],
                    "style": dynamic_settings["style"],
                    "use_speaker_boost": dynamic_settings["use_speaker_boost"]
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
You are an award-winning podcast producer creating a {length_guidance} conversational podcast episode about cutting-edge research for {audience_description}.

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

    def generate_podcast_script_with_gemini(self, paper_data: Dict, use_full_text: bool = False,
                                           technical_level: str = 'undergrad', custom_topics: str = None,
                                           host_persona: str = 'curious_journalist',
                                           expert_persona: str = 'academic_expert') -> str:
        """Generate podcast script using Gemini (handles much larger contexts than GPT-4)"""

        if not self.gemini_available:
            raise ValueError("Gemini API not available - falling back to GPT-4")

        # Determine content to use (NO TRUNCATION with Gemini!)
        if use_full_text and 'full_text' in paper_data:
            content = f"Full Paper Text:\n{paper_data['full_text']}"
            length_guidance = "10-15 minute"
            word_count = "1400-2000 words"
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

        # CRAFT Framework Prompt (same structure as GPT-4 but optimized for Gemini)
        prompt = f"""# CONTEXT & ROLE
You are an award-winning podcast producer creating a {length_guidance} conversational podcast episode about cutting-edge research for {audience_description}.

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

**ACT 1 - THE HOOK (10% of script):**
- Alex opens with a relatable scenario or current event that connects to the paper
- Immediately establish why listeners should care (personal impact, societal relevance)
- Dr. Chen validates the excitement with a compelling "why now" statement
- Create intrigue without revealing everything upfront

**ACT 2 - THE EXPLORATION (70% of script):**
- Alex asks progressively deeper questions that build understanding
- Dr. Chen explains:
  * What problem does this research solve?
  * What's the key innovation or breakthrough?
  * How does it actually work? (use analogies)
  * What did they discover/achieve?
- Keep exchanges dynamic: question → concise answer → follow-up → deeper explanation
- Include natural reactions: "Wait, that's huge!" / "Okay so let me make sure I understand..."
- Maximum 2-3 sentences per speaking turn before switching speakers

**ACT 3 - THE IMPACT (20% of script):**
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

# TONE & STYLE
- Enthusiastic but credible
- Conversational but informative
- Accessible but respecting listener intelligence
- Natural humor when appropriate
- Genuine curiosity and discovery

Now generate the complete {word_count} podcast script following ALL the rules above."""

        print(f"Generating script with Gemini (content length: {len(content)} chars)...")

        try:
            # Generate with Gemini
            response = self.gemini_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.9,  # Higher temperature for more creative, natural dialogue
                    max_output_tokens=4000,  # Enough for long scripts
                ),
            )

            script = response.text
            print(f"✓ Gemini generated {len(script)} character script")
            return script

        except Exception as e:
            print(f"✗ Gemini generation failed: {e}")
            raise

    def clean_transcript(self, script: str) -> str:
        """Clean transcript by removing junk, markdown, headers, and speaker labels"""
        import re

        # Remove common junk patterns
        lines = script.split('\n')
        cleaned_lines = []

        for line in lines:
            line_stripped = line.strip()

            # Skip empty lines (but preserve paragraph breaks for now)
            if not line_stripped:
                cleaned_lines.append('')
                continue

            # Skip separator lines (---, ===, ***)
            if re.match(r'^[\s\-_=*#]+$', line_stripped):
                continue

            # Skip markdown headers (# Header, ## Subheader, etc.)
            if re.match(r'^#{1,6}\s+', line_stripped):
                continue

            # Skip time markers like (60 seconds), (2 minutes), **TOTAL RUNTIME: 10 minutes**
            if re.search(r'\(\d+\s*(seconds?|minutes?|mins?)\)', line_stripped, re.IGNORECASE):
                continue
            if re.search(r'(total|runtime|duration).*:\s*\d+\s*(seconds?|minutes?|mins?)', line_stripped, re.IGNORECASE):
                continue

            # DON'T skip speaker lines - we need them for parsing!
            # Just keep them as-is, the parser will handle them

            # Skip system instruction lines
            system_patterns = [
                r'respond as helpfully',
                r'do not reproduce',
                r'copyrighted material',
                r'however.*if you were given',
                r'making minor changes',
                r'summarize or quote'
            ]
            if any(re.search(pattern, line_stripped.lower()) for pattern in system_patterns):
                continue

            # Skip very short junk (less than 15 chars with no real content)
            if len(line_stripped) < 15 and not re.search(r'[.!?]', line_stripped):
                continue

            # Clean markdown formatting from the line
            # Remove bold: **text** -> text
            line_stripped = re.sub(r'\*\*([^*]+)\*\*', r'\1', line_stripped)
            # Remove italic: *text* -> text (but not if it's part of longer asterisk sequence)
            line_stripped = re.sub(r'(?<!\*)\*(?!\*)([^*]+)\*(?!\*)', r'\1', line_stripped)

            # DON'T remove HOST:/EXPERT: here - the parser needs them!
            # They'll be removed during parsing

            cleaned_lines.append(line_stripped)

        # Join and collapse multiple blank lines into single paragraph breaks
        cleaned_script = '\n'.join(cleaned_lines)
        cleaned_script = re.sub(r'\n\s*\n\s*\n+', '\n\n', cleaned_script)  # Max 2 newlines
        cleaned_script = cleaned_script.strip()

        print(f"🧹 CLEANED TRANSCRIPT: {len(script)} → {len(cleaned_script)} chars")

        return cleaned_script

    def shorten_transcript(self, script: str, target_words: int = 1000) -> str:
        """Shorten transcript to target word count (default 1000 words ≈ 5-7 minutes audio)

        Args:
            script: The cleaned transcript
            target_words: Target word count (0 = no shortening, 1000 = ~5-7 mins, 1500 = ~8-10 mins)
        """
        words = script.split()
        current_word_count = len(words)

        print(f"📏 TRANSCRIPT LENGTH CHECK:")
        print(f"   Current: {current_word_count} words (~{current_word_count // 150}-{current_word_count // 130} minutes)")

        if target_words == 0:
            print(f"   ✓ NO SHORTENING (target_words=0) - using full transcript")
            return script

        print(f"   Target: {target_words} words (~{target_words // 150}-{target_words // 130} minutes)")

        if current_word_count <= target_words:
            print(f"   ✓ Within limit, no shortening needed")
            return script

        print(f"   ⚠️  Exceeds limit by {current_word_count - target_words} words")
        print(f"   ✂️  Shortening to {target_words} words...")

        # Simple approach: truncate to target words, then back up to last sentence
        truncated_words = words[:target_words]
        truncated_text = ' '.join(truncated_words)

        # Find the last complete sentence
        last_sentence_end = max(
            truncated_text.rfind('.'),
            truncated_text.rfind('!'),
            truncated_text.rfind('?')
        )

        if last_sentence_end > 0:
            shortened = truncated_text[:last_sentence_end + 1]
        else:
            shortened = truncated_text

        final_word_count = len(shortened.split())
        print(f"   ✓ Shortened to {final_word_count} words (~{final_word_count // 150}-{final_word_count // 130} minutes)")

        return shortened

    def parse_script_by_speaker(self, script: str, target_words: int = 1000) -> List[Tuple[str, str]]:
        """Parse script into (speaker, text) tuples, removing speaker labels

        Supports multiple formats:
        1. "Host:" and "Expert:" labels (preferred) - can be mid-line or start of line
        2. Plain text with paragraph breaks (alternates speakers)
        3. Plain text as single block (uses expert voice only for monologue)

        Args:
            script: Raw transcript
            target_words: Target word count for shortening (1000 = ~5-7 mins)
        """
        import re

        # First, clean the transcript (remove markdown, headers, speaker labels)
        script = self.clean_transcript(script)

        # Second, shorten if too long
        script = self.shorten_transcript(script, target_words=target_words)

        # CRITICAL FIX: Split by HOST:/EXPERT: labels ANYWHERE in the text, not just at line start
        # This handles both:
        # 1. Multi-line format:
        #    HOST: text
        #    EXPERT: text
        # 2. Single-line format:
        #    HOST: text EXPERT: text HOST: text

        print(f"🔍 PARSING SCRIPT BY SPEAKER:")
        print(f"   Script length: {len(script)} chars")

        # Split the entire script by HOST: or EXPERT: labels
        # Pattern: (HOST|EXPERT):\s* - captures the label and splits on it
        parts = re.split(r'\b(HOST|EXPERT|Host|Expert)\s*:\s*', script, flags=re.IGNORECASE)

        # parts will be like: ['', 'HOST', 'text1', 'EXPERT', 'text2', 'HOST', 'text3', ...]
        # Every odd index is a speaker label, every even index is the text

        segments = []
        i = 0
        while i < len(parts):
            part = parts[i].strip()

            # Skip empty parts
            if not part:
                i += 1
                continue

            # Check if this is a speaker label
            if re.match(r'^(HOST|EXPERT|Host|Expert)$', part, re.IGNORECASE):
                # Next part should be the text
                if i + 1 < len(parts):
                    speaker_label = part.lower()
                    text = parts[i + 1].strip()

                    if text:  # Only add non-empty segments
                        speaker = 'host' if speaker_label == 'host' else 'expert'
                        segments.append((speaker, text))
                        print(f"   ✓ Found {speaker.upper()} segment ({len(text)} chars)")

                    i += 2  # Skip both label and text
                else:
                    i += 1
            else:
                # This shouldn't happen if the split worked correctly, but handle it
                i += 1

        print(f"   ✓ Parsed {len(segments)} segments from script")

        # CRITICAL CLEANUP: Remove ANY stray HOST:/EXPERT: labels from the actual text
        print(f"\n🔧 FINAL CLEANUP PASS (removing any stray labels from text):")
        cleaned_segments = []
        for speaker, text in segments:
            # Remove any HOST: or EXPERT: that might be embedded in the text
            original_text = text
            text = re.sub(r'\b(HOST|EXPERT|Host|Expert)\s*:\s*', '', text, flags=re.IGNORECASE)
            text = text.strip()

            if text != original_text:
                print(f"   ⚠️  Found and removed label from {speaker.upper()} text")
                print(f"      BEFORE: {original_text[:100]}...")
                print(f"      AFTER:  {text[:100]}...")

            cleaned_segments.append((speaker, text))

        segments = cleaned_segments

        # FALLBACK: If no segments found (no Host:/Expert: labels), handle plain text
        if not segments:
            print("\n⚠️  No Host:/Expert: labels found. Using fallback parsing...")

            # Try splitting by double line breaks (paragraph breaks)
            paragraphs = re.split(r'\n\s*\n', script.strip())
            paragraphs = [p.strip() for p in paragraphs if p.strip()]

            if len(paragraphs) > 1:
                # Multiple paragraphs - use expert voice only (monologue style)
                print(f"   Found {len(paragraphs)} paragraphs. Using expert voice (monologue).")
                for paragraph in paragraphs:
                    segments.append(('expert', paragraph))
            else:
                # Single block of text - split into chunks for better pacing
                print("   Single block text. Splitting into chunks for expert voice (monologue).")

                # Split into manageable chunks (around 500-800 characters each)
                text = script.strip()
                words = text.split()
                chunks = []
                current_chunk = []
                current_length = 0

                for word in words:
                    current_chunk.append(word)
                    current_length += len(word) + 1

                    # Create chunk when reaching ~600 chars or end of sentence
                    if current_length > 600 and word.endswith(('.', '!', '?')):
                        chunks.append(' '.join(current_chunk))
                        current_chunk = []
                        current_length = 0

                # Add remaining words
                if current_chunk:
                    chunks.append(' '.join(current_chunk))

                # Add all chunks as expert voice
                for chunk in chunks:
                    if chunk.strip():
                        segments.append(('expert', chunk))

        # Debug logging
        print(f"\n=== PARSED {len(segments)} SEGMENTS ===")
        for i, (speaker, text) in enumerate(segments[:5]):  # Show first 5
            print(f"{i+1}. [{speaker.upper()}]: {text[:80]}...")

        return segments

    def generate_audio(self, script: str, podcast_id: str, voice_preset: str = 'default',
                      host_voice_key: str = None, expert_voice_key: str = None, target_words: int = 1000) -> str:
        """Generate multi-voice audio from script using ElevenLabs API directly with continuity

        Args:
            script: The podcast script
            podcast_id: Unique podcast ID
            voice_preset: Voice preset to use (ignored if custom voices provided)
            host_voice_key: Custom host voice key (e.g., 'rachel', 'adam')
            expert_voice_key: Custom expert voice key
            target_words: Target word count (0 = no shortening, 1000 = ~5-7 mins, 1500 = ~8-10 mins)
        """
        import requests
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
            segments = self.parse_script_by_speaker(script, target_words=target_words)
            print(f"Parsed {len(segments)} speech segments")

            if not segments:
                raise ValueError("No speech segments found in script")

            # Generate audio for each segment using raw API with continuity
            all_audio_bytes = b''
            voice_usage_count = {'host': 0, 'expert': 0}

            for i, (speaker, text) in enumerate(segments):
                if not text.strip():
                    continue

                voice_id = host_voice_id if speaker == 'host' else expert_voice_id
                speaker_label = f"Host ({host_name})" if speaker == 'host' else f"Expert ({expert_name})"
                voice_usage_count[speaker] += 1

                print(f"\n{'='*60}")
                print(f"Segment {i+1}/{len(segments)} - {speaker_label}")
                print(f"  Voice ID: {voice_id}")
                print(f"\n  📝 EXACT TEXT BEING SENT TO ELEVENLABS TTS:")
                print(f"  {'-'*60}")
                print(f"  {text}")
                print(f"  {'-'*60}")

                try:
                    # DYNAMIC voice settings based on what's being said
                    print(f"  🎭 EMOTION ANALYSIS (making it sound human, not robotic):")
                    dynamic_settings = analyze_text_emotion(text)
                    emotion_type = dynamic_settings.pop('_emotion_type')
                    emotion_details = dynamic_settings.pop('_emotion_details')

                    # Enhanced logging to show human-like adjustments
                    print(f"     ✓ Detected: {emotion_details}")
                    print(f"     🎚️  Voice Settings (automatically optimized):")
                    print(f"        • Stability: {dynamic_settings['stability']:.2f} "
                          f"→ {'MORE expressive' if dynamic_settings['stability'] < 0.3 else 'BALANCED' if dynamic_settings['stability'] < 0.4 else 'CLEAR & stable'}")
                    print(f"        • Style: {dynamic_settings['style']:.2f} "
                          f"→ {'LOTS of personality' if dynamic_settings['style'] > 0.75 else 'Good personality' if dynamic_settings['style'] > 0.6 else 'Subtle personality'}")
                    print(f"        • Similarity Boost: {dynamic_settings['similarity_boost']:.2f} "
                          f"→ {'VERY human-like' if dynamic_settings['similarity_boost'] > 0.87 else 'Human-like'}")
                    print(f"        • Speaker Boost: ENABLED (enhanced clarity)")

                    # Build request payload with continuity parameters
                    payload = {
                        "text": text,
                        "model_id": "eleven_turbo_v2_5",
                        "voice_settings": {
                            "stability": dynamic_settings['stability'],
                            "similarity_boost": dynamic_settings['similarity_boost'],
                            "style": dynamic_settings.get('style', 0.0),
                            "use_speaker_boost": dynamic_settings.get('use_speaker_boost', True)
                        }
                    }

                    # Add previous_text for continuity (context from previous segment)
                    if i > 0:
                        prev_speaker, prev_text = segments[i-1]
                        payload["previous_text"] = prev_text[-200:]  # Last 200 chars for context
                        print(f"   + Previous context: {len(payload['previous_text'])} chars")

                    # Add next_text for continuity (context for next segment)
                    if i < len(segments) - 1:
                        next_speaker, next_text = segments[i+1]
                        payload["next_text"] = next_text[:200]  # First 200 chars for context
                        print(f"   + Next context: {len(payload['next_text'])} chars")

                    # Call ElevenLabs API directly
                    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
                    headers = {
                        "xi-api-key": os.getenv('ELEVENLABS_API_KEY'),
                        "Content-Type": "application/json"
                    }
                    params = {
                        "output_format": "mp3_44100_128"
                    }

                    response = requests.post(url, json=payload, headers=headers, params=params, stream=True)
                    response.raise_for_status()

                    # Collect audio chunks for this segment
                    segment_bytes = b''
                    for chunk in response.iter_content(chunk_size=4096):
                        if chunk:
                            segment_bytes += chunk

                    all_audio_bytes += segment_bytes
                    print(f"  ✓ Generated {len(segment_bytes)} bytes")

                except Exception as e:
                    print(f"  ✗ Error generating segment {i+1}: {e}")
                    raise

            # Summary of voice usage
            print(f"\n=== VOICE USAGE SUMMARY ===")
            print(f"Host ({host_name}) segments: {voice_usage_count['host']}")
            print(f"Expert ({expert_name}) segments: {voice_usage_count['expert']}")
            print(f"Total segments: {len(segments)}")

            # Write concatenated audio to file
            print(f"\n=== WRITING {len(all_audio_bytes)} BYTES TO {temp_file} ===")
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

            return {'audio_url': audio_url}

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
