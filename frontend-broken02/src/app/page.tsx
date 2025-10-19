'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/config/api';
import Link from 'next/link';

export default function Home() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [podcastText, setPodcastText] = useState('');
  const [podcastTitle, setPodcastTitle] = useState('');
  const [podcastEmail, setPodcastEmail] = useState('');
  const [voicePreset, setVoicePreset] = useState('default');
  const [generatingPodcast, setGeneratingPodcast] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState<any>(null);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    loadEpisodes();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const payload: any = { email };
      if (name) payload.name = name;

      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Success! Check your email for confirmation.' });
        setEmail('');
        setName('');
        setTimeout(() => {
          document.getElementById('episodes')?.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.detail || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const loadEpisodes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/episodes`);
      const data = await response.json();
      setEpisodes(data.episodes || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
    }
  };

  const generatePodcast = async () => {
    if (!podcastText) {
      alert('Please paste some text');
      return;
    }

    if (podcastText.length < 100) {
      alert('Please provide at least 100 characters of text');
      return;
    }

    setGeneratingPodcast(true);
    setGeneratedPodcast(null);
    setStatusText('Creating your podcast... This takes 30-60 seconds.');

    try {
      const formData = new FormData();
      formData.append('text', podcastText);
      formData.append('title', podcastTitle || 'Custom Content');
      formData.append('voice_preset', voicePreset);
      if (podcastEmail) formData.append('email', podcastEmail);

      const response = await fetch(`${API_URL}/api/create-podcast-from-text`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate podcast');
      }

      setGeneratedPodcast(data);
      setPodcastText('');
      setPodcastTitle('');
      setStatusText('');

      if (podcastEmail) {
        alert('✅ Podcast created! Check your email for the welcome message.');
      }

      setTimeout(() => {
        document.getElementById('podcastResult')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error: any) {
      alert(error.message || 'Failed to generate podcast. Please try again.');
    } finally {
      setGeneratingPodcast(false);
    }
  };

  return (
    <>
      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; color: #1a202c; line-height: 1.6; }
        nav { background: white; padding: 20px 0; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); position: sticky; top: 0; z-index: 100; }
        .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
        .logo { font-size: 24px; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-decoration: none; }
        .nav-links a { color: #4a5568; text-decoration: none; margin-left: 30px; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: #667eea; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 80px 20px; text-align: center; }
        .hero-content { max-width: 800px; margin: 0 auto; }
        .hero h1 { font-size: 48px; margin-bottom: 20px; font-weight: 700; }
        .hero p { font-size: 20px; margin-bottom: 40px; opacity: 0.95; }
        .signup-form { max-width: 500px; margin: 0 auto; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .signup-form input { flex: 1; min-width: 250px; padding: 16px 20px; font-size: 16px; border: none; border-radius: 8px; }
        .signup-form button { padding: 16px 32px; font-size: 16px; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
        .signup-form button:hover { transform: scale(1.05); }
        .signup-form button:disabled { opacity: 0.7; cursor: not-allowed; }
        .form-message { margin-top: 20px; padding: 15px; border-radius: 8px; font-weight: 500; }
        .form-message.success { background: rgba(255, 255, 255, 0.2); color: white; }
        .form-message.error { background: rgba(255, 100, 100, 0.2); color: white; }
        .section { padding: 80px 20px; }
        .section-content { max-width: 1200px; margin: 0 auto; }
        .section h2 { font-size: 36px; margin-bottom: 40px; text-align: center; color: #2d3748; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
        .feature-card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: transform 0.2s; }
        .feature-card:hover { transform: translateY(-5px); }
        .feature-icon { font-size: 48px; margin-bottom: 20px; }
        .feature-card h3 { font-size: 24px; margin-bottom: 15px; color: #2d3748; }
        .feature-card p { color: #4a5568; line-height: 1.6; }
        .episodes-grid { display: grid; gap: 30px; margin-top: 40px; }
        .episode-card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden; }
        .episode-header { padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .episode-header h3 { font-size: 22px; margin-bottom: 10px; }
        .episode-authors { font-size: 14px; opacity: 0.9; margin-bottom: 5px; }
        .episode-date { font-size: 14px; opacity: 0.8; }
        .episode-body { padding: 25px; }
        .audio-player { width: 100%; margin-bottom: 20px; }
        .episode-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; text-align: center; transition: transform 0.2s; cursor: pointer; border: none; }
        .btn-primary { background: #667eea; color: white; }
        .btn-primary:hover { background: #5568d3; transform: scale(1.05); }
        .btn-secondary { background: #e2e8f0; color: #2d3748; }
        .btn-secondary:hover { background: #cbd5e0; transform: scale(1.05); }
        .no-episodes { text-align: center; padding: 60px 20px; color: #4a5568; }
        .generator-section { background: #f7fafc; }
        .generator-card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); max-width: 800px; margin: 0 auto; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #2d3748; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; font-family: inherit; }
        .form-group textarea { min-height: 200px; resize: vertical; }
        .spinner-container { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 40px; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .result-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-top: 20px; }
        .result-card h3 { font-size: 24px; margin-bottom: 20px; }
        footer { background: #2d3748; color: white; padding: 40px 20px; text-align: center; }
        .footer-content { max-width: 1200px; margin: 0 auto; }
      `}</style>

      <nav>
        <div className="nav-container">
          <Link href="/" className="logo">🎙️ City Secretary</Link>
          <div className="nav-links">
            <Link href="/pricing">Pricing</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-content">
          <h1>Keep Up With Latest Research</h1>
          <p>Research papers and news as engaging podcast summaries delivered to your inbox</p>

          <form className="signup-form" onSubmit={handleSignup}>
            <input type="text" placeholder="Your Name (Optional)" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={loading}>{loading ? 'Subscribing...' : 'Subscribe Free'}</button>
          </form>

          {message && (
            <div className={`form-message ${message.type}`}>{message.text}</div>
          )}
        </div>
      </div>

      <section className="section">
        <div className="section-content">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📰</div>
              <h3>Curated Research</h3>
              <p>We find the most important papers and news from top sources</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎙️</div>
              <h3>AI-Generated Podcasts</h3>
              <p>Converted into natural, conversational audio you can listen anywhere</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📧</div>
              <h3>Delivered Daily</h3>
              <p>Get the latest research summaries in your inbox every morning</p>
            </div>
          </div>
        </div>
      </section>

      <section id="episodes" className="section" style={{background: '#f7fafc'}}>
        <div className="section-content">
          <h2>Recent Episodes</h2>
          <div className="episodes-grid">
            {episodes.length === 0 ? (
              <div className="no-episodes">
                <h3>No episodes yet</h3>
                <p>Be the first to subscribe and get notified when we publish our first episode!</p>
              </div>
            ) : (
              episodes.map((episode, i) => (
                <div key={i} className="episode-card">
                  <div className="episode-header">
                    <h3>{episode.paper_title}</h3>
                    <div className="episode-authors">{episode.paper_authors}</div>
                    <div className="episode-date">
                      {episode.sent_at ? new Date(episode.sent_at * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently published'}
                    </div>
                  </div>
                  <div className="episode-body">
                    <audio className="audio-player" controls>
                      <source src={episode.audio_url} type="audio/mpeg" />
                    </audio>
                    <div className="episode-actions">
                      <a href={episode.audio_url} className="btn btn-primary" download>Download MP3</a>
                      <a href={episode.paper_url} className="btn btn-secondary" target="_blank">Read Paper</a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section generator-section">
        <div className="section-content">
          <h2>🎧 Convert Any Text to Podcast (Free)</h2>
          <div className="generator-card">
            <div className="form-group">
              <label>Paste Your Text (Article, Paper, Blog Post, etc.)</label>
              <textarea placeholder="Paste any text here... minimum 100 characters" value={podcastText} onChange={(e) => setPodcastText(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Title (Optional)</label>
              <input type="text" placeholder="e.g., Climate Change Research" value={podcastTitle} onChange={(e) => setPodcastTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Voice Style</label>
              <select value={voicePreset} onChange={(e) => setVoicePreset(e.target.value)}>
                <option value="default">Warm & Professional</option>
                <option value="energetic">Energetic & Authoritative</option>
                <option value="calm">Calm & Wise</option>
                <option value="dynamic">Dynamic & Engaging</option>
                <option value="professional">Professional British</option>
                <option value="storyteller">Storyteller Style</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email (Optional - get notified)</label>
              <input type="email" placeholder="your@email.com" value={podcastEmail} onChange={(e) => setPodcastEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{width: '100%'}} onClick={generatePodcast} disabled={generatingPodcast}>
              {generatingPodcast ? '⏳ Generating...' : '🎧 Generate Podcast (Free)'}
            </button>

            {generatingPodcast && (
              <div className="spinner-container">
                <div className="spinner"></div>
                <p>{statusText}</p>
              </div>
            )}

            {generatedPodcast && (
              <div id="podcastResult" className="result-card">
                <h3>🎉 &quot;{generatedPodcast.title}&quot; is Ready!</h3>
                <audio id="audioPlayer" className="audio-player" controls>
                  <source id="audioSource" src={generatedPodcast.audio_url} type="audio/mpeg" />
                </audio>
                <a href={generatedPodcast.audio_url} className="btn btn-secondary" download={`${generatedPodcast.title.replace(/[^a-z0-9]/gi, '_')}.mp3`}>
                  Download MP3
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <p>&copy; 2025 City Secretary. All rights reserved.</p>
          <p style={{marginTop: '10px', opacity: 0.8}}>Powered by OpenAI & ElevenLabs</p>
        </div>
      </footer>
    </>
  );
}
