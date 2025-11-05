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
            <Link href="/episodes" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Episodes
            </Link>
            <Link href="/states" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              States
            </Link>
            <Link href="/cle" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              CLE Info
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              Subscribe
            </Link>
          </div>

          {/* Mobile Subscribe Button */}
          <div className="md:hidden">
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
              Subscribe
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
