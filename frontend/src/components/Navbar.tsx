"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Radio } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navbar - Top */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-200/50">
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

      {/* Mobile Navbar - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200/50">
        <div className="flex items-center justify-around h-16 px-4">
          <Link href="/" className="flex flex-col items-center gap-1 flex-1">
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-4 ${
                pathname === "/" ? "text-orange-600" : "text-gray-600"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Button>
          </Link>

          <Link href="/episodes" className="flex flex-col items-center gap-1 flex-1">
            <Button
              variant="ghost"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-4 ${
                pathname === "/episodes" ? "text-orange-600" : "text-gray-600"
              }`}
            >
              <Radio className="h-5 w-5" />
              <span className="text-xs font-medium">Episodes</span>
            </Button>
          </Link>
        </div>
      </nav>
    </>
  );
}
