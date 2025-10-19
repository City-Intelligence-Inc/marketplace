import Link from 'next/link';

export default function ThankYou() {
  return (
    <>
      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        nav { background: rgba(255, 255, 255, 0.1); padding: 15px 0; margin-bottom: 20px; }
        nav .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
        nav .logo { color: white; font-size: 20px; font-weight: 600; text-decoration: none; }
        nav .nav-links a { color: white; text-decoration: none; margin-left: 30px; font-weight: 500; transition: opacity 0.2s; }
        nav .nav-links a:hover { opacity: 0.8; }
        .main-content { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 100px); }
        .container { background: white; border-radius: 16px; padding: 60px 40px; max-width: 600px; width: 100%; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); text-align: center; }
        .checkmark { width: 80px; height: 80px; border-radius: 50%; display: inline-block; stroke-width: 2; stroke: #48bb78; stroke-miterlimit: 10; margin-bottom: 30px; box-shadow: inset 0px 0px 0px #48bb78; animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both; }
        .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #48bb78; fill: none; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
        .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
        @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 30px #48bb78; } }
        h1 { font-size: 36px; color: #1a202c; margin-bottom: 15px; }
        p { font-size: 18px; color: #4a5568; line-height: 1.6; margin-bottom: 15px; }
        .highlight { background: #f7fafc; padding: 25px; border-radius: 10px; margin: 30px 0; }
        .highlight h3 { color: #2d3748; margin-bottom: 15px; }
        .highlight ul { list-style: none; text-align: left; }
        .highlight li { padding: 10px 0; color: #4a5568; }
        .highlight li::before { content: "✓ "; color: #48bb78; font-weight: bold; margin-right: 10px; }
        .back-link { display: inline-block; margin-top: 30px; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: 600; transition: transform 0.2s; }
        .back-link:hover { transform: translateY(-2px); }
      `}</style>

      <nav>
        <div className="nav-container">
          <Link href="/" className="logo">🎙️ City Secretary</Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </nav>

      <div className="main-content">
        <div className="container">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>

          <h1>You&apos;re All Set! 🎉</h1>

          <p>Thank you for joining City Secretary!</p>

          <div className="highlight">
            <h3>📧 Check Your Inbox</h3>
            <p>We&apos;ve just sent you a welcome email with all the details.</p>
          </div>

          <div className="highlight">
            <h3>What Happens Next?</h3>
            <ul>
              <li>Your first podcast will arrive soon</li>
              <li>Each podcast is 5-10 minutes long</li>
              <li>Includes full transcript and paper links</li>
              <li>Unsubscribe anytime with one click</li>
            </ul>
          </div>

          <p style={{marginTop: '30px', fontSize: '16px', color: '#718096'}}>
            Didn&apos;t receive the email? Check your spam folder or contact us.
          </p>

          <Link href="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    </>
  );
}
