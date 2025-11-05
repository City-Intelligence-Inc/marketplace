import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-gray-900">
            Research Club <span className="text-blue-600">Patent Law CLE</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#episodes" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Episodes
            </a>
            <a href="#roadmap" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              CLE Roadmap
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Pricing
            </a>
            <a href="#subscribe" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              Subscribe Now
            </a>
          </div>

          {/* Mobile Subscribe Button */}
          <div className="md:hidden">
            <a href="#subscribe" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
              Subscribe
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
