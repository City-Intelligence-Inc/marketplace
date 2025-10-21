"""
Beautiful email templates for podcasts - JournalClub.io style
"""
from typing import Dict
from datetime import datetime


def build_podcast_email_html(podcast_data: Dict, brand_color: str = "#ea580c") -> str:
    """
    Build beautiful podcast email HTML with full transcript
    Style inspired by JournalClub.io
    """
    title = podcast_data.get('paper_title', 'Podcast Episode')
    hosts = podcast_data.get('podcast_hosts', podcast_data.get('paper_authors', 'Our Hosts'))
    category = podcast_data.get('category', 'Research')
    audio_url = podcast_data.get('audio_url', '')
    transcript = podcast_data.get('transcript', '')
    today = datetime.now().strftime('%B %d, %Y')

    # Format transcript with paragraphs
    transcript_paragraphs = transcript.split('\n\n') if transcript else []
    transcript_html = ''.join([
        f'<p style="margin-bottom: 16px; line-height: 1.7; color: #374151;">{p}</p>'
        for p in transcript_paragraphs if p.strip()
    ])

    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f9fafb; padding: 20px 0; }}
        .email-wrapper {{ background: #ffffff; max-width: 680px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
        .header {{ background: {brand_color}; padding: 32px 40px; color: white; }}
        .header h1 {{ font-size: 24px; font-weight: 700; margin: 0 0 8px 0; }}
        .header p {{ font-size: 14px; opacity: 0.95; margin: 0; }}
        .thumbnail {{ width: 100%; height: 300px; background: linear-gradient(135deg, {brand_color} 0%, #dc2626 100%); display: flex; align-items: center; justify-content: center; font-size: 72px; }}
        .content {{ padding: 40px; }}
        .category {{ display: inline-block; background: {brand_color}; color: white; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }}
        .title {{ font-size: 32px; font-weight: 800; color: #111827; margin-bottom: 20px; line-height: 1.2; }}
        .meta {{ color: #6b7280; font-size: 15px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }}
        .intro {{ font-size: 16px; line-height: 1.8; color: #374151; margin-bottom: 32px; }}
        .audio-section {{ background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%); border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0; border: 2px solid #e5e7eb; }}
        .audio-section h3 {{ font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 20px; }}
        .audio-player {{ width: 100%; max-width: 100%; margin-bottom: 20px; }}
        .listen-btns {{ display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 20px; }}
        .listen-btn {{ display: inline-block; background: {brand_color}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; }}
        .listen-btn.secondary {{ background: #f3f4f6; color: {brand_color}; border: 2px solid {brand_color}; }}
        .section-title {{ font-size: 24px; font-weight: 700; color: #111827; margin: 40px 0 20px 0; padding-top: 32px; border-top: 2px solid #e5e7eb; }}
        .transcript {{ font-size: 15px; line-height: 1.9; color: #374151; }}
        .footer {{ background: #f9fafb; padding: 40px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }}
        .footer-links {{ margin: 16px 0; }}
        .footer-links a {{ color: {brand_color}; text-decoration: none; margin: 0 12px; font-weight: 500; }}
        @media only screen and (max-width: 600px) {{
            .content {{ padding: 24px; }}
            .title {{ font-size: 26px; }}
            .thumbnail {{ height: 200px; font-size: 48px; }}
            .listen-btns {{ flex-direction: column; }}
            .listen-btn {{ width: 100%; }}
        }}
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
            <h1>🎧 {category} Podcast</h1>
            <p>{hosts} • {today}</p>
        </div>

        <!-- Thumbnail -->
        <div class="thumbnail">
            🎙️
        </div>

        <!-- Main Content -->
        <div class="content">
            <span class="category">{category}</span>
            <h2 class="title">{title}</h2>
            <p class="meta">With {hosts} • 5-10 min listen</p>

            <p class="intro">
                Today's episode explores cutting-edge research in {category}. Listen to the full breakdown below, or read the complete transcript to dive deep into the findings.
            </p>

            <!-- Audio Player Section -->
            <div class="audio-section">
                <h3>🎧 Listen to the Episode</h3>
                <audio controls class="audio-player">
                    <source src="{audio_url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <div class="listen-btns">
                    <a href="{audio_url}" class="listen-btn">▶ Play Now</a>
                    <a href="{audio_url}" download class="listen-btn secondary">⬇ Download MP3</a>
                </div>
            </div>

            <!-- Full Transcript -->
            {f'<h3 class="section-title">📄 Full Transcript</h3><div class="transcript">{transcript_html}</div>' if transcript else ''}
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>We're City Secretary</strong></p>
            <p style="margin-top: 8px;">Your daily dose of research, delivered as audio.</p>
            <div class="footer-links">
                <a href="#">Preferences</a>
                <a href="#">Unsubscribe</a>
            </div>
            <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
                © 2025 City Secretary, All Rights Reserved.
            </p>
        </div>
    </div>
</body>
</html>
"""
