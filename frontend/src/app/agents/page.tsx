'use client';

import { useState } from 'react';

export default function AgentsPage() {
  const [agentId, setAgentId] = useState('research_club');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://your-api.com';

  const embedCode = `<!-- City Secretary Subscribe Button -->
<div id="city-secretary-subscribe">
  <form id="subscribe-form-${agentId}" style="max-width: 400px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif;">
    <h3 style="margin-top: 0;">Subscribe to Updates</h3>
    <input
      type="email"
      id="email-input-${agentId}"
      placeholder="Enter your email"
      required
      style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"
    />
    <button
      type="submit"
      style="width: 100%; padding: 10px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
    >
      Subscribe
    </button>
    <div id="message-${agentId}" style="margin-top: 10px; padding: 10px; border-radius: 4px; display: none;"></div>
  </form>
</div>

<script>
(function() {
  const form = document.getElementById('subscribe-form-${agentId}');
  const emailInput = document.getElementById('email-input-${agentId}');
  const messageDiv = document.getElementById('message-${agentId}');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const button = form.querySelector('button');
    const originalText = button.textContent;

    button.textContent = 'Subscribing...';
    button.disabled = true;

    try {
      const response = await fetch('${apiUrl}/api/agents/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: '${agentId}',
          email: email
        })
      });

      const data = await response.json();

      if (response.ok) {
        messageDiv.textContent = data.message;
        messageDiv.style.background = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.display = 'block';
        emailInput.value = '';
      } else {
        throw new Error(data.detail || 'Subscription failed');
      }
    } catch (error) {
      messageDiv.textContent = 'Error: ' + error.message;
      messageDiv.style.background = '#f8d7da';
      messageDiv.style.color = '#721c24';
      messageDiv.style.display = 'block';
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  });
})();
</script>`;

  const reactCode = `import { useState } from 'react';

function SubscribeButton() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('${apiUrl}/api/agents/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: '${agentId}',
          email: email
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
      } else {
        setMessage('Error: ' + (data.detail || 'Subscription failed'));
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmribe}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}`;

  const curlExample = `curl -X POST ${apiUrl}/api/agents/subscribe \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "${agentId}",
    "email": "user@example.com"
  }'`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Agent Subscribe Widget</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Get embeddable subscribe buttons for your agents
      </p>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Agent ID:
        </label>
        <input
          type="text"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '300px',
            fontSize: '16px'
          }}
          placeholder="Enter your agent ID"
        />
      </div>

      <div style={{ display: 'grid', gap: '30px' }}>
        {/* HTML/JavaScript Embed */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>HTML/JavaScript Embed</h2>
            <button
              onClick={() => copyToClipboard(embedCode)}
              style={{
                padding: '8px 16px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Copy Code
            </button>
          </div>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Copy and paste this into any HTML page
          </p>
          <pre style={{
            background: '#f5f5f5',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {embedCode}
          </pre>
        </div>

        {/* React Component */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>React Component</h2>
            <button
              onClick={() => copyToClipboard(reactCode)}
              style={{
                padding: '8px 16px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Copy Code
            </button>
          </div>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Use this in your React application
          </p>
          <pre style={{
            background: '#f5f5f5',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {reactCode}
          </pre>
        </div>

        {/* cURL Example */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>API Example (cURL)</h2>
            <button
              onClick={() => copyToClipboard(curlExample)}
              style={{
                padding: '8px 16px',
                background: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Copy Code
            </button>
          </div>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Direct API call example
          </p>
          <pre style={{
            background: '#f5f5f5',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {curlExample}
          </pre>
        </div>
      </div>

      {/* API Documentation */}
      <div style={{ marginTop: '40px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>API Documentation</h2>

        <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Endpoint</h3>
        <code style={{ background: '#e0e0e0', padding: '4px 8px', borderRadius: '4px' }}>
          POST {apiUrl}/api/agents/subscribe
        </code>

        <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Request Body</h3>
        <pre style={{ background: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #ddd' }}>
{`{
  "agent_id": "your_agent_id",
  "email": "user@example.com"
}`}
        </pre>

        <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Response</h3>
        <pre style={{ background: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #ddd' }}>
{`{
  "message": "Successfully subscribed to Agent Name",
  "agent_name": "Agent Name",
  "agent_id": "your_agent_id",
  "subscriber_count": 42
}`}
        </pre>
      </div>
    </div>
  );
}
