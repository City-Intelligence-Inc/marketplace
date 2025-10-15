import os
import requests
from typing import Dict, List

class EmailService:
    """Service for sending emails via Mailgun"""

    def __init__(self):
        self.mailgun_api_key = os.getenv('MAILGUN_API_KEY')
        # Hardcoded Mailgun settings
        self.mailgun_domain = "ai.complete.city"
        self.from_email = "arihant@ai.complete.city"
        self.from_name = "City Secretary"
        self.mailgun_url = f"https://api.mailgun.net/v3/{self.mailgun_domain}/messages"

    def send_welcome_email(self, email: str, name: str = None) -> bool:
        """Send welcome email to new subscriber"""
        recipient_name = name if name else "there"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎙️ Welcome to Daily AI Research Podcasts!</h1>
                </div>
                <div class="content">
                    <p>Hi {recipient_name},</p>

                    <p>Thanks for signing up! You're now part of our community receiving the latest AI research as engaging podcasts.</p>

                    <h3>What to expect:</h3>
                    <ul>
                        <li>📅 Daily podcast delivered to your inbox</li>
                        <li>⏱️ 5-10 minute audio summaries</li>
                        <li>📄 Full transcripts included</li>
                        <li>🔬 Trending papers from arXiv</li>
                        <li>🚫 Unsubscribe anytime</li>
                    </ul>

                    <p>Your first podcast will arrive soon!</p>

                    <p>Best regards,<br>The Team</p>
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
                    "from": f"{self.from_name} <{self.from_email}>",
                    "to": email,
                    "subject": "Welcome to Daily AI Research Podcasts! 🎙️",
                    "html": html_content
                }
            )
            return response.status_code == 200
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
        """Send podcast email to subscriber"""
        recipient_name = name if name else "there"

        # Clean transcript of markdown formatting
        clean_transcript = self.clean_transcript(podcast_data['transcript'])

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 700px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; }}
                .paper-info {{ background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }}
                .audio-player {{ background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }}
                .transcript {{ background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📄 Today's AI Research Podcast</h1>
                </div>
                <div class="content">
                    <p>Hi {recipient_name},</p>

                    <div class="paper-info">
                        <h2>{podcast_data['paper_title']}</h2>
                        <p><strong>Authors:</strong> {podcast_data['paper_authors']}</p>
                        <p><a href="{podcast_data['paper_url']}" class="button">📖 Read Full Paper</a></p>
                    </div>

                    <div class="audio-player">
                        <h3>🎧 Listen Now</h3>
                        <audio controls style="width: 100%; max-width: 500px;">
                            <source src="{podcast_data['audio_url']}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                        <br>
                        <a href="{podcast_data['audio_url']}" class="button">⬇️ Download MP3</a>
                    </div>

                    <div class="transcript">
                        <h3>📝 Transcript</h3>
                        <p style="white-space: pre-wrap;">{clean_transcript}</p>
                    </div>

                    <p style="text-align: center; margin-top: 30px;">
                        <em>Tomorrow's paper arrives at the same time!</em>
                    </p>
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
                    "from": f"{self.from_name} <{self.from_email}>",
                    "to": email,
                    "subject": f"Today's Podcast: {podcast_data['paper_title'][:50]}...",
                    "html": html_content
                }
            )
            return response.status_code == 200
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
