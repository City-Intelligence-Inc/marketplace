"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TrustedBy } from "@/components/TrustedBy";

const categories = [
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Reinforcement Learning",
  "Generative AI",
  "Neural Networks",
  "Large Language Models",
  "AI Safety & Alignment",
  "Robotics",
  "AI Ethics",
  "Multimodal AI",
  "Transformers",
  "Diffusion Models",
  "AI Hardware",
  "Edge AI",
  "Autonomous Systems",
  "Speech Recognition",
  "Recommendation Systems",
  "AI in Healthcare",
];

export function Hero() {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Thanks for your interest! We'll be in touch soon.");
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="relative flex items-start justify-center overflow-hidden bg-background pt-16 sm:pt-20 md:pt-32 pb-24 sm:pb-32 md:pb-40">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Gradient Orbs - Pastel colors */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-[80px] sm:blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-br from-blue-300/25 to-purple-300/25 rounded-full blur-[100px] sm:blur-[120px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-br from-pink-300/25 to-violet-300/25 rounded-full blur-[80px] sm:blur-[100px] animate-pulse-slow" />

        {/* Additional subtle accent orbs */}
        <div className="absolute top-10 right-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-gradient-to-br from-indigo-300/20 to-purple-300/20 rounded-full blur-[60px] sm:blur-[80px] animate-float-slow" />
        <div className="absolute bottom-20 left-1/3 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-br from-violet-300/18 to-pink-300/18 rounded-full blur-[70px] sm:blur-[90px] animate-float" />
        <div className="absolute top-1/3 right-1/2 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-[60px] sm:blur-[70px] animate-float-delayed" />

        {/* Animated Grid with depth */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] animate-grid-flow" />

        {/* Animated light beams - pastel tones */}
        <div className="absolute top-0 left-1/4 w-[2px] h-full bg-gradient-to-b from-transparent via-purple-400/25 to-transparent animate-beam blur-sm" />
        <div className="absolute top-0 right-1/3 w-[2px] h-full bg-gradient-to-b from-transparent via-pink-400/25 to-transparent animate-beam-delayed blur-sm" />
        <div className="absolute top-0 left-2/3 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-beam blur-sm" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 sm:space-y-8">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            <span className="block text-foreground">
              Daily podcasts on #1 trending
            </span>
            <span className="block text-foreground">
              research and news in
            </span>
            <span className="block mt-6 sm:mt-8 mb-6 sm:mb-8 min-h-[7rem] sm:min-h-[10rem] py-6 sm:py-8 flex items-center justify-center overflow-visible">
              <span
                className={`inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 bg-clip-text text-transparent transition-all duration-500 leading-tight ${
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
          <p className="text-lg sm:text-xl md:text-2xl text-foreground max-w-2xl mx-auto leading-relaxed px-4">
            <span className="whitespace-nowrap">Expert-curated research podcasts</span> delivered daily.
            <br className="hidden sm:block" />
            <span className="block sm:inline mt-1 sm:mt-0">Never miss. <span className="whitespace-nowrap">10 minutes a day.</span></span>
          </p>

          {/* Email Subscription Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center items-stretch pt-4 max-w-md mx-auto w-full px-2 sm:px-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-14 sm:h-12 px-6 text-base sm:text-sm rounded-lg bg-card border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-14 sm:h-12 px-8 text-base sm:text-sm bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 hover:from-purple-600 hover:via-pink-600 hover:to-violet-600 text-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-purple-500/30"
            >
              {isSubmitting ? "Entering..." : "Enter the Club"}
            </Button>
          </form>

          {/* Trusted By Section */}
          <div className="mt-12 sm:mt-16">
            <TrustedBy />
          </div>
        </div>
      </div>

    </div>
  );
}
