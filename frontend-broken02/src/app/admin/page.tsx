'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/config/api';
import Link from 'next/link';

const ADMIN_PASSWORD = 'podcast2025';

export default function Admin() {
  // Auth
  const [authenticated, setAuthenticated] = useState(false);

  // Tab state
  const [addPaperTab, setAddPaperTab] = useState('arxiv');

  // Paper/Podcast state
  const [currentPaperId, setCurrentPaperId] = useState<string | null>(null);
  const [currentPodcastId, setCurrentPodcastId] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string | null>(null);
  const [hasFullText, setHasFullText] = useState(false);

  // Paper data
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAuthors, setPaperAuthors] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Form inputs
  const [arxivUrl, setArxivUrl] = useState('');
  const [extractFullText, setExtractFullText] = useState(false);
  const [paperUrl, setPaperUrl] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [customTopics, setCustomTopics] = useState('');
  const [technicalLevel, setTechnicalLevel] = useState('undergraduate');
  const [useFullTextForTranscript, setUseFullTextForTranscript] = useState(false);

  // Personas & Voices
  const [allPersonas, setAllPersonas] = useState<any[]>([]);
  const [hostPersona, setHostPersona] = useState('');
  const [expertPersona, setExpertPersona] = useState('');
  const [individualVoices, setIndividualVoices] = useState<any>({});
  const [hostVoice, setHostVoice] = useState('');
  const [expertVoice, setExpertVoice] = useState('');

  // Stats
  const [stats, setStats] = useState({ totalSubscribers: 0, totalPodcasts: 0, lastSentAt: null });

  // Users
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userSearch, setUserSearch] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  // History
  const [history, setHistory] = useState<any[]>([]);

  // Loading states
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [messages, setMessages] = useState<{[key: string]: {text: string, type: string}}>({});

  // Email composer
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailFromName, setEmailFromName] = useState('City Secretary');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    // Check auth
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('adminPassword') : null;
    if (saved === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      const password = prompt('Enter admin password:');
      if (password === ADMIN_PASSWORD) {
        if (typeof window !== 'undefined') sessionStorage.setItem('adminPassword', password);
        setAuthenticated(true);
      } else {
        alert('Incorrect password');
        window.location.href = '/';
      }
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadStats();
      loadPersonas();
      loadIndividualVoices();
      loadHistory();
      loadUsers();
    }
  }, [authenticated]);

  useEffect(() => {
    filterUsers();
  }, [userSearch, allUsers]);

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadPersonas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/personas`);
      const data = await res.json();
      setAllPersonas(data.personas || []);
      if (data.personas?.length > 0) {
        const hosts = data.personas.filter((p: any) => p.role === 'Host');
        const experts = data.personas.filter((p: any) => p.role === 'Expert');
        if (hosts.length > 0) setHostPersona(hosts[0].id);
        if (experts.length > 0) setExpertPersona(experts[0].id);
      }
    } catch (err) {
      console.error('Error loading personas:', err);
    }
  };

  const loadIndividualVoices = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/individual-voices`);
      const data = await res.json();
      setIndividualVoices(data.voices || {});
    } catch (err) {
      console.error('Error loading voices:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/podcast-history`);
      const data = await res.json();
      setHistory(data.podcasts || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`);
      const data = await res.json();
      setAllUsers(data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const filterUsers = () => {
    if (!userSearch.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const search = userSearch.toLowerCase();
      setFilteredUsers(allUsers.filter((u: any) =>
        u.email.toLowerCase().includes(search) ||
        (u.name && u.name.toLowerCase().includes(search))
      ));
    }
  };

  const fetchPaper = async () => {
    if (!arxivUrl) {
      alert('Please enter arXiv URL');
      return;
    }
    setLoading({...loading, fetchPaper: true});
    try {
      const res = await fetch(`${API_URL}/api/admin/fetch-paper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arxiv_url: arxivUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setCurrentPaperId(data.paper_id);
      setPaperTitle(data.title);
      setPaperAuthors(data.authors);
      setPaperAbstract(data.abstract);
      setMessages({...messages, fetchPaper: {text: 'Paper fetched successfully!', type: 'success'}});

      if (extractFullText) {
        extractFullPDF();
      }
    } catch (err: any) {
      setMessages({...messages, fetchPaper: {text: err.message, type: 'error'}});
    } finally {
      setLoading({...loading, fetchPaper: false});
    }
  };

  const extractFullPDF = async () => {
    setLoading({...loading, extractPDF: true});
    try {
      const res = await fetch(`${API_URL}/api/admin/extract-pdf-from-arxiv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arxiv_url: arxivUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setHasFullText(true);
      setMessages({...messages, extractPDF: {text: 'Full PDF text extracted!', type: 'success'}});
    } catch (err: any) {
      setMessages({...messages, extractPDF: {text: err.message, type: 'error'}});
    } finally {
      setLoading({...loading, extractPDF: false});
    }
  };

  const generateTranscript = async () => {
    if (!currentPaperId) {
      alert('Please fetch a paper first');
      return;
    }
    setLoading({...loading, generateTranscript: true});
    try {
      const res = await fetch(`${API_URL}/api/admin/generate-transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paper_id: currentPaperId,
          paper_title: paperTitle,
          paper_authors: paperAuthors,
          paper_abstract: paperAbstract,
          host_persona_id: hostPersona,
          expert_persona_id: expertPersona,
          technical_level: technicalLevel,
          custom_topics: customTopics || null,
          use_full_text: useFullTextForTranscript
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setCurrentTranscript(data.transcript);
      setCurrentPodcastId(data.podcast_id);
      setMessages({...messages, generateTranscript: {text: 'Transcript generated!', type: 'success'}});
    } catch (err: any) {
      setMessages({...messages, generateTranscript: {text: err.message, type: 'error'}});
    } finally {
      setLoading({...loading, generateTranscript: false});
    }
  };

  const convertToAudio = async () => {
    if (!currentTranscript || !currentPodcastId) {
      alert('Please generate transcript first');
      return;
    }
    setLoading({...loading, convertToAudio: true});
    try {
      const res = await fetch(`${API_URL}/api/admin/convert-to-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podcast_id: currentPodcastId,
          transcript: currentTranscript,
          host_voice_key: hostVoice,
          expert_voice_key: expertVoice
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setAudioUrl(data.audio_url);
      setMessages({...messages, convertToAudio: {text: 'Audio generated!', type: 'success'}});
    } catch (err: any) {
      setMessages({...messages, convertToAudio: {text: err.message, type: 'error'}});
    } finally {
      setLoading({...loading, convertToAudio: false});
    }
  };

  const sendPodcast = async () => {
    if (!currentPodcastId) {
      alert('Please generate podcast first');
      return;
    }
    if (!confirm('Send to ALL subscribers?')) return;

    setLoading({...loading, sendPodcast: true});
    try {
      const res = await fetch(`${API_URL}/api/admin/send-podcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podcast_id: currentPodcastId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      alert(`Sent to ${data.recipients_count} subscribers!`);
      loadStats();
      loadHistory();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading({...loading, sendPodcast: false});
    }
  };

  const quickAddUser = async () => {
    const email = (document.getElementById('quickAddEmail') as HTMLInputElement)?.value;
    const name = (document.getElementById('quickAddName') as HTMLInputElement)?.value;
    if (!email) return alert('Email required');

    try {
      const res = await fetch(`${API_URL}/api/admin/quick-add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      alert('User added!');
      loadUsers();
      (document.getElementById('quickAddEmail') as HTMLInputElement).value = '';
      (document.getElementById('quickAddName') as HTMLInputElement).value = '';
    } catch (err: any) {
      alert(err.message);
    }
  };

  const sendTestEmail = async () => {
    const email = prompt('Enter test email:');
    if (!email || !currentPodcastId) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/send-podcast-to-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podcast_id: currentPodcastId, user_emails: [email] })
      });
      if (!res.ok) throw new Error('Failed');
      alert('Test email sent!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!authenticated) {
    return <div style={{padding: '20px', textAlign: 'center'}}>Authenticating...</div>;
  }

  const hosts = allPersonas.filter(p => p.role === 'Host');
  const experts = allPersonas.filter(p => p.role === 'Expert');

  return (
    <>
      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #f5f7fa; }
        nav { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 15px 0; margin-bottom: 20px; }
        .nav-container { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
        .logo { color: white; font-size: 20px; font-weight: 600; text-decoration: none; }
        .nav-links a { color: white; text-decoration: none; margin-left: 30px; font-weight: 500; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
        .stat-card .value { font-size: 32px; font-weight: bold; color: #667eea; }
        .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .card h2 { margin-bottom: 20px; color: #333; }
        input[type="text"], input[type="url"], input[type="email"], select, textarea { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 5px; font-size: 16px; margin-bottom: 15px; }
        textarea { min-height: 150px; font-family: inherit; }
        button { padding: 12px 30px; font-size: 16px; font-weight: 600; color: white; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 5px; cursor: pointer; margin-right: 10px; }
        button:hover { transform: translateY(-2px); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { background: #48bb78; }
        .btn-danger { background: #f56565; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
        .tab { padding: 10px 20px; background: #e2e8f0; border: none; border-radius: 5px; cursor: pointer; }
        .tab.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .paper-preview { background: #f7fafc; padding: 20px; border-radius: 5px; margin: 15px 0; }
        .paper-preview h3 { color: #2d3748; margin-bottom: 10px; }
        .message { padding: 15px; border-radius: 5px; margin: 15px 0; }
        .message.success { background: #c6f6d5; color: #22543d; }
        .message.error { background: #fed7d7; color: #742a2a; }
        .audio-player { background: #f7fafc; padding: 20px; border-radius: 5px; margin: 15px 0; text-align: center; }
        .transcript { background: #f7fafc; padding: 20px; border-radius: 5px; margin: 15px 0; max-height: 400px; overflow-y: auto; white-space: pre-wrap; font-family: monospace; font-size: 14px; }
        .user-item { padding: 10px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; }
        .user-item input[type="checkbox"] { width: auto; margin: 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f7fafc; font-weight: 600; color: #2d3748; }
      `}</style>

      <nav>
        <div className="nav-container">
          <Link href="/" className="logo">🎙️ City Secretary Admin</Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="header">
          <h1>Admin Dashboard</h1>
          <p>Manage podcasts and subscribers</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Subscribers</h3>
            <div className="value">{stats.totalSubscribers}</div>
          </div>
          <div className="stat-card">
            <h3>Total Podcasts</h3>
            <div className="value">{stats.totalPodcasts}</div>
          </div>
          <div className="stat-card">
            <h3>Last Sent</h3>
            <div className="value" style={{fontSize: '18px'}}>
              {stats.lastSentAt ? new Date(stats.lastSentAt * 1000).toLocaleDateString() : 'Never'}
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Step 1: Add Paper</h2>
          <div className="tabs">
            <button className={`tab ${addPaperTab === 'arxiv' ? 'active' : ''}`} onClick={() => setAddPaperTab('arxiv')}>arXiv URL</button>
            <button className={`tab ${addPaperTab === 'text' ? 'active' : ''}`} onClick={() => setAddPaperTab('text')}>Custom Text</button>
          </div>

          <div className={`tab-content ${addPaperTab === 'arxiv' ? 'active' : ''}`}>
            <input type="url" placeholder="https://arxiv.org/abs/..." value={arxivUrl} onChange={(e) => setArxivUrl(e.target.value)} />
            <label style={{display: 'block', marginBottom: '15px'}}>
              <input type="checkbox" checked={extractFullText} onChange={(e) => setExtractFullText(e.target.checked)} style={{width: 'auto', marginRight: '10px'}} />
              Extract full PDF text (7-10 min vs 5-7 min)
            </label>
            <button onClick={fetchPaper} disabled={loading.fetchPaper}>
              {loading.fetchPaper ? 'Fetching...' : 'Fetch Paper'}
            </button>
            {messages.fetchPaper && <div className={`message ${messages.fetchPaper.type}`}>{messages.fetchPaper.text}</div>}
          </div>

          <div className={`tab-content ${addPaperTab === 'text' ? 'active' : ''}`}>
            <input type="text" placeholder="Title" value={textTitle} onChange={(e) => setTextTitle(e.target.value)} />
            <textarea placeholder="Paste text here..." value={customText} onChange={(e) => setCustomText(e.target.value)} />
            <button onClick={async () => {
              if (!customText) return alert('Text required');
              setCurrentPaperId('text-' + Date.now());
              setPaperTitle(textTitle || 'Custom Content');
              setPaperAbstract(customText);
              setPaperAuthors('Custom');
              alert('Text loaded!');
            }}>Load Text</button>
          </div>

          {currentPaperId && (
            <div className="paper-preview">
              <h3>Paper Preview</h3>
              <p><strong>Title:</strong></p>
              <input type="text" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} />
              <p><strong>Authors:</strong></p>
              <input type="text" value={paperAuthors} onChange={(e) => setPaperAuthors(e.target.value)} />
              <p><strong>Abstract:</strong></p>
              <textarea value={paperAbstract} onChange={(e) => setPaperAbstract(e.target.value)} />
            </div>
          )}
        </div>

        <div className="card">
          <h2>Step 2: Generate Transcript</h2>
          <label>Host Persona:</label>
          <select value={hostPersona} onChange={(e) => setHostPersona(e.target.value)}>
            {hosts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <label>Expert Persona:</label>
          <select value={expertPersona} onChange={(e) => setExpertPersona(e.target.value)}>
            {experts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <label>Technical Level:</label>
          <select value={technicalLevel} onChange={(e) => setTechnicalLevel(e.target.value)}>
            <option value="baby">Baby (Simple explanations)</option>
            <option value="highschool">High School</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="expert">Expert</option>
          </select>
          <label>Custom Topics (optional):</label>
          <textarea placeholder="Specific topics to cover..." value={customTopics} onChange={(e) => setCustomTopics(e.target.value)} />
          <button onClick={generateTranscript} disabled={loading.generateTranscript}>
            {loading.generateTranscript ? 'Generating...' : 'Generate Transcript'}
          </button>
          {messages.generateTranscript && <div className={`message ${messages.generateTranscript.type}`}>{messages.generateTranscript.text}</div>}
          {currentTranscript && (
            <div className="transcript">{currentTranscript}</div>
          )}
        </div>

        <div className="card">
          <h2>Step 3: Convert to Audio</h2>
          <label>Host Voice:</label>
          <select value={hostVoice} onChange={(e) => setHostVoice(e.target.value)}>
            <option value="">Select voice...</option>
            {Object.keys(individualVoices).map(key => (
              <option key={key} value={key}>{individualVoices[key]?.name || key}</option>
            ))}
          </select>
          <label>Expert Voice:</label>
          <select value={expertVoice} onChange={(e) => setExpertVoice(e.target.value)}>
            <option value="">Select voice...</option>
            {Object.keys(individualVoices).map(key => (
              <option key={key} value={key}>{individualVoices[key]?.name || key}</option>
            ))}
          </select>
          <button onClick={convertToAudio} disabled={loading.convertToAudio}>
            {loading.convertToAudio ? 'Converting...' : 'Convert to Audio'}
          </button>
          {messages.convertToAudio && <div className={`message ${messages.convertToAudio.type}`}>{messages.convertToAudio.text}</div>}
          {audioUrl && (
            <div className="audio-player">
              <h3>Preview Audio</h3>
              <audio controls src={audioUrl} style={{width: '100%', marginTop: '10px'}} />
            </div>
          )}
        </div>

        <div className="card">
          <h2>Step 4: Send to Subscribers</h2>
          <button onClick={sendPodcast} disabled={loading.sendPodcast} className="btn-danger">
            {loading.sendPodcast ? 'Sending...' : 'Send to ALL Subscribers'}
          </button>
          <button onClick={sendTestEmail} className="btn-secondary">Send Test Email</button>
          <p style={{marginTop: '15px', color: '#666'}}>
            Quick add user: <input type="email" id="quickAddEmail" placeholder="email@example.com" style={{width: '250px', marginRight: '10px'}} />
            <input type="text" id="quickAddName" placeholder="Name (optional)" style={{width: '150px', marginRight: '10px'}} />
            <button onClick={quickAddUser} className="btn-secondary">Add User</button>
          </p>
        </div>

        <div className="card">
          <h2>Podcast History</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Sent At</th>
                <th>Recipients</th>
              </tr>
            </thead>
            <tbody>
              {history.map((p, i) => (
                <tr key={i}>
                  <td>{p.paper_title}</td>
                  <td>{p.sent_at ? new Date(p.sent_at * 1000).toLocaleString() : 'Not sent'}</td>
                  <td>{p.recipients_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>User Management ({allUsers.length} users)</h2>
          <input type="text" placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
          <div style={{maxHeight: '400px', overflowY: 'auto'}}>
            {filteredUsers.map((u, i) => (
              <div key={i} className="user-item">
                <input type="checkbox" checked={selectedUsers.has(u.email)} onChange={(e) => {
                  const newSet = new Set(selectedUsers);
                  if (e.target.checked) newSet.add(u.email);
                  else newSet.delete(u.email);
                  setSelectedUsers(newSet);
                }} />
                <span>{u.email} {u.name && `(${u.name})`}</span>
              </div>
            ))}
          </div>
          <p style={{marginTop: '15px'}}>{selectedUsers.size} users selected</p>
        </div>
      </div>
    </>
  );
}
