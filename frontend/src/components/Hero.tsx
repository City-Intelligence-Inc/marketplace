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
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
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
