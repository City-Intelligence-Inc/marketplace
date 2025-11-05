import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center md:justify-start">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Research Cafe
          </Link>
        </div>
      </div>
    </nav>
  );
}
