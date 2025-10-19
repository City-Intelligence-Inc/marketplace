"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const categories = [
  "AI",
  "Crypto",
  "Quantum Computing",
  "Education",
  "Legal",
  "Healthcare",
  "Climate Science",
  "Biotechnology",
];

export function Hero() {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentCategory((prev) => (prev + 1) % categories.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-start justify-center overflow-hidden bg-background pt-32">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Large Gradient Orbs - More visible */}
        <div className="absolute top-1/4 -left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-orange-500/50 to-red-500/50 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-red-600/40 to-orange-600/40 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/35 to-red-500/35 rounded-full blur-[100px] animate-pulse-slow" />

        {/* Additional smokey accent orbs */}
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-full blur-[80px] animate-float-slow" />
        <div className="absolute bottom-20 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-amber-600/25 to-orange-600/25 rounded-full blur-[90px] animate-float" />
        <div className="absolute top-1/3 right-1/2 w-[350px] h-[350px] bg-gradient-to-br from-red-500/30 to-amber-500/30 rounded-full blur-[70px] animate-float-delayed" />

        {/* Smokey layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-transparent to-red-900/10" />

        {/* Animated Grid with depth */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.08] animate-grid-flow" />

        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-radial-gradient-dark" />

        {/* Enhanced noise texture overlay */}
        <div className="absolute inset-0 bg-noise-pattern opacity-[0.15] mix-blend-overlay" />

        {/* Animated light beams - orange/red tones */}
        <div className="absolute top-0 left-1/4 w-[2px] h-full bg-gradient-to-b from-transparent via-orange-500/30 to-transparent animate-beam blur-sm" />
        <div className="absolute top-0 right-1/3 w-[2px] h-full bg-gradient-to-b from-transparent via-red-500/30 to-transparent animate-beam-delayed blur-sm" />
        <div className="absolute top-0 left-2/3 w-[1px] h-full bg-gradient-to-b from-transparent via-amber-500/20 to-transparent animate-beam blur-sm" style={{ animationDelay: '4s' }} />

        {/* Gradient Overlay for content readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="block text-white">
              Keep up with the latest
            </span>
            <span className="block text-white">
              research and news in
            </span>
            <span className="block mt-8 mb-8 min-h-[8rem] py-4 flex items-center justify-center">
              <span
                className={`inline-block bg-gradient-to-r from-orange-500 via-red-500 to-amber-600 bg-clip-text text-transparent transition-all duration-500 ${
                  isAnimating
                    ? "opacity-0 translate-y-4 scale-95"
                    : "opacity-100 translate-y-0 scale-100"
                }`}
              >
                {categories[currentCategory]}
              </span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Curated podcasts, delivered daily.
          </p>

          {/* Email Subscription Form */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4 max-w-md mx-auto w-full px-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-6 py-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
            />
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white whitespace-nowrap"
            >
              Subscribe
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center pt-8">
            {["Daily Updates", "AI-Powered", "Personalized", "Free Trial"].map(
              (feature) => (
                <div
                  key={feature}
                  className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium text-gray-200"
                >
                  {feature}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
