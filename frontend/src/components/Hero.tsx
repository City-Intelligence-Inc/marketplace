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

    setTimeout(() => {
      toast.success("Thanks for subscribing! Check your inbox.");
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
          Research Cafe:
        </h1>
        <p className="text-2xl md:text-3xl text-gray-700 mb-4 leading-relaxed">
          The latest academic research, explained in plain English.
        </p>
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Research Cafe is a premium daily newsletter and podcast. Each episode is lovingly crafted by hand, and delivered to your inbox every morning.
        </p>

        {/* Email Subscription Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center items-stretch max-w-lg mx-auto mb-8">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 h-12 px-4 text-base rounded-md bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-8 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>

        <p className="text-sm text-gray-500">
          Already a member?{" "}
          <a href="#" className="text-gray-900 hover:underline font-medium">
            Click here to login
          </a>
        </p>
      </div>

      {/* Features Section */}
      <div className="border-t border-gray-200 bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Episodes</h3>
              <p className="text-gray-600">New research explained every morning, delivered straight to your inbox.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Plain English</h3>
              <p className="text-gray-600">Complex academic papers translated into clear, accessible language.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert-Curated</h3>
              <p className="text-gray-600">Each episode is carefully crafted by subject-matter experts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
