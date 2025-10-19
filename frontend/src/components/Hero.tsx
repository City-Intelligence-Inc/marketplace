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
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Gradient Orbs */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/40 to-blue-500/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-pink-500/25 to-purple-500/25 rounded-full blur-3xl animate-pulse-slow" />

        {/* Additional accent orbs */}
        <div className="absolute top-10 right-1/4 w-48 h-48 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl animate-float" />

        {/* Animated Grid with depth */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] animate-grid-flow" />

        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-radial-gradient" />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-noise-pattern opacity-[0.03] mix-blend-overlay" />

        {/* Animated light beams */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent animate-beam" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-beam-delayed" />

        {/* Gradient Overlay for content readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="block text-foreground">
              Keep up with the latest
            </span>
            <span className="block mt-2 min-h-[1.2em]">
              <span
                className={`inline-block bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent transition-all duration-500 ${
                  isAnimating
                    ? "opacity-0 translate-y-4 scale-95"
                    : "opacity-100 translate-y-0 scale-100"
                }`}
              >
                {categories[currentCategory]}
              </span>
            </span>
            <span className="block mt-2 text-foreground">
              research and news
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Curated podcasts, delivered daily.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3 justify-center pt-8">
            {["Daily Updates", "AI-Powered", "Personalized", "Free Trial"].map(
              (feature) => (
                <div
                  key={feature}
                  className="px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border text-sm font-medium"
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
