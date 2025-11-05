export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              ABOUT RESEARCH CLUB
            </h3>
            <div className="text-gray-300 text-sm leading-relaxed space-y-2">
              <p>City Intelligence Inc.</p>
              <p>Howein South Street 18 A</p>
              <p>Nanjakan Building</p>
              <p>South Tangerang, Indonesia</p>
            </div>
            <div className="flex gap-4 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-500 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://medium.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-500 transition-colors"
                aria-label="Medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-orange-500 transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* AI Subfields */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              AI SUBFIELDS
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Machine Learning</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Deep Learning</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Natural Language Processing</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Computer Vision</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Reinforcement Learning</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Generative AI</a></li>
            </ul>
          </div>

          {/* More AI Topics */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              RESEARCH AREAS
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Large Language Models</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">AI Safety & Alignment</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Robotics</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Multimodal AI</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Edge AI</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">AI in Healthcare</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              QUICK LINKS
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-orange-500 transition-colors">Register</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Sign In</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">My Account</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} City Intelligence Inc. All rights reserved.</p>
          <p className="mt-2">Research Club - Expert-curated AI research podcasts</p>
        </div>
      </div>
    </footer>
  );
}
