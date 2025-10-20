"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="text-xl font-bold text-black hover:text-orange-600 transition-colors">
            Intelligent Podcasts
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" className="text-black hover:text-orange-600 hover:bg-orange-50">
                Home
              </Button>
            </Link>
            <Link href="/episodes">
              <Button variant="ghost" className="text-black hover:text-orange-600 hover:bg-orange-50">
                Episodes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
