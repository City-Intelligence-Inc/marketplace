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
                .play-btn {{ display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 12px 0; }}
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
                        <a href="{podcast_data['audio_url']}" class="play-btn">▶ Play Now</a>
                        <br>
                        <a href="{podcast_data['paper_url']}" class="link-btn">📄 Read Full Paper →</a>
                    </div>
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
