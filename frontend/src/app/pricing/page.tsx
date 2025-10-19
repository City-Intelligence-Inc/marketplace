'use client';

import { useState } from 'react';
import { API_URL } from '@/config/api';
import Link from 'next/link';

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [individualEmail, setIndividualEmail] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftName, setGiftName] = useState('');
  const [loading, setLoading] = useState(false);

  const checkout = async (plan: 'individual' | 'team') => {
    const email = plan === 'team' ? teamEmail : individualEmail;

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    let planType = plan === 'team' ? 'team' : billingPeriod === 'yearly' ? 'individual_yearly' : 'individual_monthly';

    let giftData = { is_gift: false, gift_recipient_email: null, gift_recipient_name: null };
    if (plan === 'individual' && billingPeriod === 'yearly' && isGift) {
      if (!giftEmail) {
        alert('Please enter the recipient\\'s email address');
        return;
      }
      if (!emailRegex.test(giftEmail)) {
        alert('Please enter a valid recipient email address');
        return;
      }
      giftData = { is_gift: true, gift_recipient_email: giftEmail, gift_recipient_name: giftName };
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: planType, ...giftData })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create checkout session');
      }

      const data = await response.json();
      window.location.href = data.checkout_url;
    } catch (error: any) {
      alert('Error creating checkout session: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; color: white; margin-bottom: 60px; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; font-weight: 700; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .billing-toggle { display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 40px; }
        .billing-toggle button { padding: 12px 30px; border: 2px solid white; background: transparent; color: white; border-radius: 30px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; }
        .billing-toggle button.active { background: white; color: #667eea; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; margin-bottom: 40px; }
        .pricing-card { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); transition: transform 0.3s ease, box-shadow 0.3s ease; position: relative; }
        .pricing-card:hover { transform: translateY(-5px); box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .pricing-card.featured { border: 3px solid #667eea; transform: scale(1.05); }
        .pricing-card.featured::before { content: "MOST POPULAR"; position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 20px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; }
        .plan-name { font-size: 1.5rem; font-weight: 700; color: #333; margin-bottom: 10px; }
        .plan-price { font-size: 3rem; font-weight: 800; color: #667eea; margin-bottom: 5px; }
        .plan-price span { font-size: 1rem; color: #666; font-weight: 400; }
        .plan-savings { color: #10b981; font-weight: 600; margin-bottom: 20px; font-size: 0.9rem; }
        .plan-description { color: #666; margin-bottom: 30px; line-height: 1.6; }
        .plan-features { list-style: none; margin-bottom: 30px; }
        .plan-features li { padding: 12px 0; color: #444; display: flex; align-items: center; }
        .plan-features li::before { content: "✓"; color: #10b981; font-weight: 700; margin-right: 12px; font-size: 1.2rem; }
        .cta-button { width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
        .cta-button:disabled { opacity: 0.6; cursor: not-allowed; }
        .email-input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .gift-option { margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; }
        .gift-checkbox { display: flex; align-items: center; gap: 10px; cursor: pointer; margin-bottom: 10px; }
        .gift-checkbox input { width: 18px; height: 18px; cursor: pointer; }
        .gift-inputs { margin-top: 10px; }
        .gift-inputs input { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; }
        .back-link { text-align: center; margin-top: 40px; }
        .back-link a { color: white; text-decoration: none; font-weight: 600; opacity: 0.9; transition: opacity 0.3s ease; }
        .back-link a:hover { opacity: 1; }
        .loading { text-align: center; color: white; margin-top: 20px; }
        @media (max-width: 768px) {
          .header h1 { font-size: 2rem; }
          .pricing-card.featured { transform: scale(1); }
          .plan-price { font-size: 2.5rem; }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>Choose Your Plan</h1>
          <p>Get research paper podcasts delivered to your inbox</p>
        </div>

        <div className="billing-toggle">
          <button className={billingPeriod === 'monthly' ? 'active' : ''} onClick={() => setBillingPeriod('monthly')}>Monthly</button>
          <button className={billingPeriod === 'yearly' ? 'active' : ''} onClick={() => setBillingPeriod('yearly')}>Yearly (Save 17%)</button>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="plan-name">Free</div>
            <div className="plan-price">$0<span>/month</span></div>
            <div className="plan-description">Perfect for getting started</div>
            <ul className="plan-features">
              <li>Weekly podcast episodes</li>
              <li>Curated research papers</li>
              <li>Email delivery</li>
              <li>Community access</li>
            </ul>
            <Link href="/" className="cta-button" style={{display: 'block', textAlign: 'center', textDecoration: 'none'}}>Get Started Free</Link>
          </div>

          <div className="pricing-card featured">
            <div className="plan-name">Individual</div>
            <div className="plan-price">
              {billingPeriod === 'yearly' ? '$99' : '$9.99'}
              <span>/{billingPeriod === 'yearly' ? 'year' : 'month'}</span>
            </div>
            {billingPeriod === 'yearly' && <div className="plan-savings">Save $20/year</div>}
            <div className="plan-description">For serious researchers</div>
            <ul className="plan-features">
              <li>Everything in Free</li>
              <li>Request 5 papers/month</li>
              <li>Priority processing</li>
              <li>Ad-free emails</li>
              <li>Transcript downloads</li>
              <li>Early access to episodes</li>
            </ul>
            <input type="email" className="email-input" placeholder="Your email" value={individualEmail} onChange={(e) => setIndividualEmail(e.target.value)} />
            <button className="cta-button" onClick={() => checkout('individual')} disabled={loading}>
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>

            {billingPeriod === 'yearly' && (
              <div className="gift-option">
                <label className="gift-checkbox">
                  <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} />
                  <span>Give as a gift</span>
                </label>
                {isGift && (
                  <div className="gift-inputs">
                    <input type="email" placeholder="Recipient's email" value={giftEmail} onChange={(e) => setGiftEmail(e.target.value)} />
                    <input type="text" placeholder="Recipient's name (optional)" value={giftName} onChange={(e) => setGiftName(e.target.value)} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pricing-card">
            <div className="plan-name">Team</div>
            <div className="plan-price">$299<span>/year</span></div>
            <div className="plan-savings">$59.88/person/year</div>
            <div className="plan-description">For research teams (5 seats)</div>
            <ul className="plan-features">
              <li>Everything in Individual</li>
              <li>5 team member seats</li>
              <li>Unlimited paper requests</li>
              <li>Team collaboration tools</li>
              <li>Dedicated support</li>
              <li>Custom topics</li>
            </ul>
            <input type="email" className="email-input" placeholder="Your email" value={teamEmail} onChange={(e) => setTeamEmail(e.target.value)} />
            <button className="cta-button" onClick={() => checkout('team')} disabled={loading}>
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        </div>

        {loading && <div className="loading">Processing... Please wait</div>}

        <div className="back-link">
          <Link href="/">← Back to Home</Link>
        </div>
      </div>
    </>
  );
}
