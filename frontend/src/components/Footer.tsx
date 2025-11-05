export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* About Section */}
        <div className="mb-8">
          <p className="text-gray-700 text-base leading-relaxed max-w-3xl">
            Research Cafe is a members-only podcast and streaming platform. Each episode is lovingly crafted by hand, by a team of subject-matter experts.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Episodes</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Hosts</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">FAQs</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Sign Up</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Login</a></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Refunds</a></li>
            </ul>
          </div>
        </div>

        {/* Support Section */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Support / Feedback</h3>
          <p className="text-sm text-gray-600 mb-2">
            If you have any questions about the platform, or would like support with a purchase, feel free to reach out anytime:
          </p>
          <a href="mailto:support@researchcafe.io" className="text-sm text-gray-900 hover:underline font-medium">
            support@researchcafe.io
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} ResearchCafe.io &nbsp;&nbsp;•&nbsp;&nbsp; All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
