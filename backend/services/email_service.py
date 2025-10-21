import os
import requests
from typing import Dict, List
from openai import OpenAI

class EmailService:
    """Service for sending emails via Mailgun"""

    def __init__(self):
        self.mailgun_api_key = os.getenv('MAILGUN_API_KEY')
        # Configurable Mailgun settings via environment variables (with fallback defaults)
        self.mailgun_domain = os.getenv('MAILGUN_DOMAIN', 'ai.complete.city')
        self.from_email = os.getenv('FROM_EMAIL', 'arihant@ai.complete.city')
        self.from_name = os.getenv('FROM_NAME', 'City Secretary')
        self.mailgun_url = f"https://api.mailgun.net/v3/{self.mailgun_domain}/messages"
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        # Configurable frontend URL for unsubscribe links
        self.frontend_url = os.getenv('FRONTEND_URL', 'https://marketplace-wtvs.onrender.com')

        print(f"📧 Email Service Initialized:")
        print(f"   Domain: {self.mailgun_domain}")
        print(f"   From: {self.from_name} <{self.from_email}>")
        print(f"   Frontend URL: {self.frontend_url}")

    def _build_paper_references_html(self, podcast_data: Dict) -> str:
        """Build HTML for paper references section"""
        paper_references = podcast_data.get('paper_references', [])

        # If no references, check for legacy paper_url field
        if not paper_references:
            paper_url = podcast_data.get('paper_url', '')
            if paper_url and paper_url not in ['N/A', '#', '']:
                return f'''
                <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                    <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 12px;">📄 Read the Paper</h3>
                    <a href="{paper_url}" style="display: inline-block; color: #ea580c; text-decoration: none; font-weight: 600; padding: 12px 24px; border: 2px solid #ea580c; border-radius: 8px; transition: all 0.3s;">
                        View Full Paper →
                    </a>
                </div>
                '''
            return ""

        # Build references list
        references_html = ""
        for i, ref in enumerate(paper_references):
            references_html += f'''
            <div style="margin-bottom: 12px;">
                <a href="{ref['url']}" style="display: block; color: #ea580c; text-decoration: none; font-weight: 600; padding: 12px 16px; border: 2px solid #ea580c; border-radius: 8px; transition: all 0.3s;">
                    📄 {ref['title']} →
                </a>
            </div>
            '''

        return f'''
        <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 12px;">📄 Referenced Papers</h3>
            {references_html}
        </div>
        '''

    def generate_title_from_transcript(self, transcript: str) -> str:
        """Generate a catchy title from the transcript using AI"""
        try:
            # Truncate transcript to first 1000 chars for title generation
            snippet = transcript[:1000]

            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a creative title generator. Create a short, catchy, clickable title (max 8 words) that captures the main topic of this podcast transcript. Make it compelling and specific. Return ONLY the title, nothing else."
                    },
                    {
                        "role": "user",
                        "content": f"Generate a title for this podcast:\n\n{snippet}..."
                    }
                ],
                temperature=0.7,
                max_tokens=50
            )

            title = response.choices[0].message.content.strip()
            # Remove quotes if AI added them
            title = title.strip('"').strip("'")
            return title
        except Exception as e:
            print(f"Error generating title: {e}")
            return "Podcast Episode"

    def send_welcome_email(self, email: str, name: str = None) -> bool:
        """Send welcome email to new subscriber - Mobile-first design"""
        recipient_name = name if name else "there"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #ffffff; }}
                .container {{ max-width: 600px; margin: 0 auto; }}
                .header {{ background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 32px 20px; text-align: center; }}
                .header h1 {{ color: white; font-size: 24px; font-weight: 700; margin: 0; }}
                .content {{ padding: 24px 20px; }}
                .content h2 {{ font-size: 20px; color: #000; margin: 20px 0 12px; }}
                .content p {{ color: #374151; line-height: 1.6; margin-bottom: 16px; }}
                .perks {{ background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .perk {{ margin: 12px 0; font-size: 15px; color: #374151; }}
                .footer {{ text-align: center; padding: 24px 20px; color: #666; font-size: 13px; border-top: 1px solid #e5e7eb; }}
                .footer a {{ color: #ea580c; text-decoration: none; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎧 Welcome!</h1>
                </div>
                <div class="content">
                    <p>Hi {recipient_name},</p>
                    <p>You're in! Daily research podcasts start hitting your inbox soon.</p>

                    <div class="perks">
                        <div class="perk">📅 Daily delivery, every morning</div>
                        <div class="perk">⏱️ 5-10 min episodes</div>
                        <div class="perk">🎧 Listen anywhere</div>
                        <div class="perk">🔬 30+ topics to choose from</div>
                    </div>

                    <p>Your first podcast arrives tomorrow. Check your inbox!</p>
                </div>
                <div class="footer">
                    <p><a href="{{{{unsubscribe_url}}}}">Unsubscribe anytime</a></p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            print(f"📧 Sending welcome email to {email}")
            response = requests.post(
                self.mailgun_url,
                auth=("api", self.mailgun_api_key),
                data={
                    "from": f"{self.from_name} <{self.from_email}>",
                    "to": email,
                    "subject": "🎧 Welcome! Your daily podcasts start soon",
                    "html": html_content
                }
            )
            success = response.status_code == 200
            if success:
                print(f"   ✅ Welcome email sent to {email}")
            else:
                print(f"   ❌ Welcome email failed: {response.status_code}")
            return success
        except Exception as e:
            print(f"Error sending welcome email: {e}")
            return False

    def clean_transcript(self, text: str) -> str:
        """Remove markdown formatting from transcript"""
        import re
        # Remove bold markers (**text** or __text__)
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'__(.+?)__', r'\1', text)
        # Remove italic markers (*text* or _text_)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'_(.+?)_', r'\1', text)
        # Remove headers (# text)
        text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
        return text

    def send_podcast_email(self, email: str, podcast_data: Dict, name: str = None) -> bool:
        """Send podcast email to subscriber - Mobile-first design"""
        recipient_name = name if name else "there"

        # Truncate title if too long
        title = podcast_data['paper_title'][:80] + "..." if len(podcast_data['paper_title']) > 80 else podcast_data['paper_title']

        # Get transcript and clean it
        transcript = podcast_data.get('transcript', '')
        import re
        clean_transcript = re.sub(r'\b(HOST|EXPERT|Host|Expert)\s*:\s*', '', transcript)
        transcript_paragraphs = clean_transcript.split('\n\n') if clean_transcript else []
        transcript_html = ''.join([
            f'<p style="margin-bottom: 12px; line-height: 1.7; color: #374151; font-size: 14px;">{p.strip()}</p>'
            for p in transcript_paragraphs if p.strip()
        ])

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #ffffff; }}
                .container {{ max-width: 600px; margin: 0 auto; }}
                .header {{ background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); padding: 24px 20px; text-align: center; }}
                .header h1 {{ color: white; font-size: 20px; font-weight: 700; margin: 0; }}
                .content {{ padding: 20px; }}
                .title {{ font-size: 22px; font-weight: 700; color: #000; margin-bottom: 12px; line-height: 1.3; }}
                .meta {{ color: #666; font-size: 14px; margin-bottom: 20px; }}
                .player {{ background: #f9fafb; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0; }}
                .play-btn {{ display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white !important; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 12px 0; }}
                .audio {{ width: 100%; margin: 16px 0; }}
                .link-btn {{ display: inline-block; color: #ea580c; text-decoration: none; font-weight: 600; margin-top: 12px; }}
                .footer {{ text-align: center; padding: 24px 20px; color: #666; font-size: 13px; border-top: 1px solid #e5e7eb; }}
                .footer a {{ color: #ea580c; text-decoration: none; }}
                @media only screen and (max-width: 600px) {{
                    .title {{ font-size: 20px; }}
                    .play-btn {{ width: 100%; padding: 18px; }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎧 Your Daily Research Podcast</h1>
                </div>
                <div class="content">
                    <h2 class="title">{title}</h2>
                    <p class="meta">5-10 min listen • {podcast_data['paper_authors'][:50]}</p>

                    <div class="player">
                        <audio controls class="audio">
                            <source src="{podcast_data['audio_url']}" type="audio/mpeg">
                        </audio>
                        <a href="{podcast_data['audio_url']}" class="play-btn" style="color: white !important;">▶ Play Now</a>
                    </div>

                    {self._build_paper_references_html(podcast_data)}

                    {f'''
                    <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                        <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 12px;">📄 Full Transcript</h3>
                        <div style="color: #374151; line-height: 1.7; font-size: 14px;">
                            {transcript_html}
                        </div>
                    </div>
                    ''' if transcript_html else ''}
                </div>
                <div class="footer">
                    <p>Tomorrow's podcast arrives same time, same inbox.</p>
                    <p style="margin-top: 12px;"><a href="{{{{unsubscribe_url}}}}">Unsubscribe</a></p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            print(f"📧 Sending podcast email to {email}")
            print(f"   Podcast: {podcast_data.get('podcast_id', 'N/A')}")
            print(f"   Paper: {title[:50]}...")

            response = requests.post(
                self.mailgun_url,
                auth=("api", self.mailgun_api_key),
                data={
                    "from": f"{self.from_name} <{self.from_email}>",
                    "to": email,
                    "subject": f"🎧 {title[:60]}",
                    "html": html_content
                }
            )

            success = response.status_code == 200
            if success:
                print(f"   ✅ Email sent successfully to {email}")
            else:
                print(f"   ❌ Email failed to {email}: {response.status_code}")

            return success
        except Exception as e:
            print(f"Error sending podcast email to {email}: {e}")
            return False

    def send_bulk_podcast_emails(self, subscribers: List[Dict], podcast_data: Dict) -> Dict:
        """Send podcast to all subscribers"""
        sent = 0
        failed = 0

        for subscriber in subscribers:
            email = subscriber['email']
            name = subscriber.get('name')

            if self.send_podcast_email(email, podcast_data, name):
                sent += 1
            else:
                failed += 1

        return {"sent": sent, "failed": failed}

    def send_custom_email(self, to_email: str, subject: str, message: str, from_name: str = None) -> bool:
        """Send a custom email to a user"""
        sender_name = from_name if from_name else self.from_name

        # Convert plain text message to HTML with basic formatting
        html_message = message.replace('\n', '<br>')

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{subject}</h1>
                </div>
                <div class="content">
                    {html_message}
                </div>
                <div class="footer">
                    <p>Don't want these emails? <a href="{{{{unsubscribe_url}}}}">Unsubscribe</a></p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            response = requests.post(
                self.mailgun_url,
                auth=("api", self.mailgun_api_key),
                data={
                    "from": f"{sender_name} <{self.from_email}>",
                    "to": to_email,
                    "subject": subject,
                    "html": html_content
                }
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Error sending custom email to {to_email}: {e}")
            return False

    def send_weekly_digest_email(self, email: str, podcasts: List[Dict], name: str = None) -> bool:
        """Send weekly digest email with all podcasts from the week - with FULL AUDIO PLAYER and TRANSCRIPT"""
        recipient_name = name if name else "there"

        # Build podcast list HTML with audio players and transcripts
        podcast_items = ""
        total_duration = 0

        for i, podcast in enumerate(podcasts, 1):
            # Get podcast data
            duration = podcast.get('duration', '5-10')
            category = podcast.get('category', 'AI')
            authors = podcast.get('podcast_hosts', podcast.get('paper_authors', 'Host'))[:50]
            audio_url = podcast.get('audio_url', '#')
            transcript = podcast.get('transcript', '')

            # Use the saved AI-generated title (already generated when podcast was created)
            title = podcast.get('paper_title', 'Research Podcast')

            # If title is still generic and we have transcript, generate it now
            if title.startswith('Custom Podcast') and transcript:
                title = self.generate_title_from_transcript(transcript)

            # Format transcript with paragraphs, removing HOST:/EXPERT: labels
            import re

            # Remove HOST:/EXPERT: labels from transcript
            clean_transcript = re.sub(r'\b(HOST|EXPERT|Host|Expert)\s*:\s*', '', transcript)

            # Split into paragraphs
            transcript_paragraphs = clean_transcript.split('\n\n') if clean_transcript else []

            # Create HTML with paragraphs
            transcript_html = ''.join([
                f'<p style="margin-bottom: 12px; line-height: 1.7; color: #374151; font-size: 14px;">{p.strip()}</p>'
                for p in transcript_paragraphs if p.strip()  # Include all paragraphs
            ])

            podcast_items += f"""
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

              {self._build_paper_references_html(podcast)}
            </div>
            """

            # Parse duration - handle "5-10" format or single numbers
            if isinstance(duration, str) and '-' in duration:
                # Range format like "5-10" - take average
                avg = sum(int(x) for x in duration.split('-')) / 2
                total_duration += int(avg)
            elif isinstance(duration, (int, float)):
                # Already a number
                total_duration += int(duration)
            elif isinstance(duration, str) and duration.replace('.', '', 1).isdigit():
                # String number like "7" or "7.5"
                total_duration += int(float(duration))
            # If duration is invalid/missing, don't add anything (skip it)

        # Build unsubscribe URL
        import urllib.parse
        unsubscribe_url = f"{self.frontend_url}/unsubscribe?email={urllib.parse.quote(email)}"

        html_content = f"""
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
                    <p>{len(podcasts)} episodes from this week</p>
                </div>
                <div class="content">
                    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Hi {recipient_name},</p>
                    <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">Here's everything from this week in one place:</p>

                    {podcast_items}

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

        try:
            print(f"📧 Sending weekly digest to {email}")
            print(f"   From: {self.from_name} <{self.from_email}>")
            print(f"   Subject: 🎧 Your Weekly Research Digest - {len(podcasts)} Episodes")
            print(f"   HTML Length: {len(html_content)} chars")

            response = requests.post(
                self.mailgun_url,
                auth=("api", self.mailgun_api_key),
                data={
                    "from": f"{self.from_name} <{self.from_email}>",
                    "to": email,
                    "subject": f"🎧 Your Weekly Research Digest - {len(podcasts)} Episodes",
                    "html": html_content
                }
            )

            print(f"   Mailgun Response: {response.status_code}")
            if response.status_code != 200:
                print(f"   Response Body: {response.text}")

            success = response.status_code == 200
            if success:
                print(f"   ✅ Weekly digest sent to {email}")
                print(f"   Mailgun Message ID: {response.json().get('id', 'N/A')}")
            else:
                print(f"   ❌ Weekly digest failed: {response.status_code}")
                print(f"   Error: {response.text}")
            return success
        except Exception as e:
            print(f"❌ Error sending weekly digest to {email}: {e}")
            import traceback
            print(f"   Traceback: {traceback.format_exc()}")
            return False
