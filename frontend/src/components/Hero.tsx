"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Hero() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Try as GET request with query parameter
      const apiUrl = `https://dhzmiptmem.us-east-1.awsapprunner.com/podcast/agents/d50c4109-cf72-4f01-9db7-80422fcf038b/subscribe-email?email=${encodeURIComponent(email)}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success("Thanks for subscribing! Check your inbox.");
        setEmail("");
      } else {
        console.error("API Error:", response.status, response.statusText);
        const errorText = await response.text().catch(() => '');
        console.error("Error body:", errorText);
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Unable to connect. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Your Daily Dose of <br />
            <span className="text-gray-600">Breakthrough Research</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We turn complex AI research papers into digestible 10-minute episodes.
            Subscribe and stay ahead of the curve.
          </p>

          {/* Email Subscription Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center items-stretch max-w-lg mx-auto mb-6">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 h-12 px-4 text-base rounded-lg bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 text-base bg-gray-900 hover:bg-gray-700 text-white rounded-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {isSubmitting ? "Joining..." : "Get Started"}
            </Button>
          </form>

          <p className="text-sm text-gray-500">
            Free for 7 days. Cancel anytime.{" "}
            <a href="#" className="text-gray-900 hover:text-gray-700 underline">
              Login
            </a>
          </p>
        </div>

        {/* Stats or Social Proof */}
        <div className="grid grid-cols-3 gap-8 text-center border-t border-gray-200 pt-12">
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
            <div className="text-sm text-gray-600">Episodes Published</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">10K+</div>
            <div className="text-sm text-gray-600">Active Subscribers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-1">4.9★</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Research, Made Simple
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                📊
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Curated Content</h3>
              <p className="text-gray-600 leading-relaxed">
                Our team reads hundreds of papers weekly and handpicks the most impactful discoveries for you.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                🎧
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Audio & Newsletter</h3>
              <p className="text-gray-600 leading-relaxed">
                Listen on the go or read at your desk. Every episode available in both formats.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Quick & Actionable</h3>
              <p className="text-gray-600 leading-relaxed">
                10-minute episodes that respect your time while delivering real insights you can use.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                🔬
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Expert Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Written by researchers and practitioners who know the field inside and out.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
