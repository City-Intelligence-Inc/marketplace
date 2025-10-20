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
      <nav className="hidden md:flex fixed top-4 left-0 right-0 z-50 justify-center px-4">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-full shadow-sm px-6 py-3">
          <div className="flex items-center gap-8">
            {/* Logo/Brand */}
            <Link href="/" className="text-lg font-bold text-black hover:text-orange-600 transition-colors">
              Research Club
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-black hover:text-orange-600 hover:bg-orange-50 rounded-full">
                  Home
                </Button>
              </Link>
              <Link href="/episodes">
                <Button variant="ghost" size="sm" className="text-black hover:text-orange-600 hover:bg-orange-50 rounded-full">
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
