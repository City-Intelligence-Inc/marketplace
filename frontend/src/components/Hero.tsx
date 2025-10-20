"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { subscribeEmail } from "@/lib/api";
import { TrustedBy } from "@/components/TrustedBy";

const categories = [
  "Mathematics",
  "AI",
  "Crypto",
  "Quantum Computing",
  "Education",
  "Patent Law",
  "IP Law",
  "Constitutional Law",
  "Corporate Law",
  "Healthcare",
  "Climate Science",
  "Biotechnology",
  "Economics",
  "Psychology",
  "Space Exploration",
  "Neuroscience",
  "Physics",
  "Finance",
  "Cybersecurity",
  "Data Science",
  "Politics",
  "Philosophy",
  "Engineering",
  "Chemistry",
  "Antitrust Law",
  "Securities Law",
  "UI/UX Design",
  "Product Design",
  "Architecture",
  "Graphic Design",
  "Industrial Design",
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

    try {
      const result = await subscribeEmail(email);

      if (result.success) {
        toast.success(result.message);
        setEmail("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-start justify-center overflow-hidden bg-white pt-20 md:pt-32 pb-20 md:pb-0">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden bg-white">
        {/* Large Gradient Orbs - Subtle */}
        <div className="absolute top-1/4 -left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-red-600/15 to-orange-600/15 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/15 to-red-500/15 rounded-full blur-[100px] animate-pulse-slow" />

        {/* Additional subtle accent orbs */}
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-orange-400/12 to-red-400/12 rounded-full blur-[80px] animate-float-slow" />
        <div className="absolute bottom-20 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-amber-600/10 to-orange-600/10 rounded-full blur-[90px] animate-float" />
        <div className="absolute top-1/3 right-1/2 w-[350px] h-[350px] bg-gradient-to-br from-red-500/12 to-amber-500/12 rounded-full blur-[70px] animate-float-delayed" />

        {/* Animated Grid with depth */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.08] animate-grid-flow" />

        {/* Animated light beams - orange/red tones */}
        <div className="absolute top-0 left-1/4 w-[2px] h-full bg-gradient-to-b from-transparent via-orange-500/30 to-transparent animate-beam blur-sm" />
        <div className="absolute top-0 right-1/3 w-[2px] h-full bg-gradient-to-b from-transparent via-red-500/30 to-transparent animate-beam-delayed blur-sm" />
        <div className="absolute top-0 left-2/3 w-[1px] h-full bg-gradient-to-b from-transparent via-amber-500/20 to-transparent animate-beam blur-sm" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="block text-black">
              Keep up with the latest
            </span>
            <span className="block text-black">
              research and news in
            </span>
            <span className="block mt-8 mb-8 min-h-[10rem] py-8 flex items-center justify-center overflow-visible">
              <span
                className={`inline-block bg-gradient-to-r from-orange-500 via-red-500 to-amber-600 bg-clip-text text-transparent transition-all duration-500 leading-tight ${
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
          <p className="text-xl md:text-2xl text-black max-w-2xl mx-auto leading-relaxed">
            Curated podcasts, delivered daily.
          </p>

          {/* Email Subscription Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center items-stretch pt-4 max-w-md mx-auto w-full px-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 px-6 rounded-lg bg-white border-2 border-gray-300 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>

          {/* Trusted By Section */}
          <div className="mt-16">
            <TrustedBy />
          </div>
        </div>
      </div>

    </div>
  );
}
