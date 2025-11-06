"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export function SimpleHero() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = `https://dhzmiptmem.us-east-1.awsapprunner.com/podcast/agents/b21ae987-5b7d-4b0a-844b-b3562358e3e8/subscribe-email?email=${encodeURIComponent(email)}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success("Thanks for subscribing! Check your inbox.");
        setEmail("");
      } else {
        console.error("API Error:", response.status, response.statusText);
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Unable to connect. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/40 to-pink-300/30 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-48">
          <div className="text-center mb-16">
            {/* CLE Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="animate-pulse">●</span>
              CLE Accreditation In Progress • Available Now
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 tracking-tight">
              Stay Current with <br />
              <span className="text-gray-600">Patent Law</span>
            </h1>

            <p className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Federal Circuit case summaries for patent attorneys with zero spare time. 15-25 minutes per week. CLE credits coming Q2 2026.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 h-16 px-6 text-lg rounded-lg bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-16 px-10 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold whitespace-nowrap disabled:opacity-50"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe - First Batch Free"}
                </Button>
              </form>
            </div>

            <div className="flex flex-wrap gap-8 justify-center text-base text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Weekly Episodes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Full Transcripts</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">CLE Q2 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Link href="/episodes" className="group bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-2xl p-8 hover:shadow-xl transition-all">
            <div className="text-5xl mb-4">🎙️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Browse Episodes</h3>
            <p className="text-gray-600 mb-4">
              Weekly Federal Circuit case analysis. Listen or read full transcripts.
            </p>
            <span className="text-blue-600 font-semibold group-hover:underline">View All Episodes →</span>
          </Link>

          <Link href="/states" className="group bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100 rounded-2xl p-8 hover:shadow-xl transition-all">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">State Requirements</h3>
            <p className="text-gray-600 mb-4">
              See how our podcasts satisfy CLE requirements in your state.
            </p>
            <span className="text-purple-600 font-semibold group-hover:underline">Check Your State →</span>
          </Link>

          <Link href="/cle" className="group bg-gradient-to-br from-green-50 to-white border-2 border-green-100 rounded-2xl p-8 hover:shadow-xl transition-all">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">CLE Roadmap</h3>
            <p className="text-gray-600 mb-4">
              Our path to accreditation. Q2 2026 launch target for California.
            </p>
            <span className="text-green-600 font-semibold group-hover:underline">View Timeline →</span>
          </Link>
        </div>
      </div>

      {/* Why Subscribe Now */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Join the First Batch - Free Access</h2>
            <p className="text-xl text-gray-300">
              Early subscribers get free access to help shape the future of patent law CLE
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">📅 Available Now</h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Start getting Federal Circuit updates immediately</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Full transcripts with case citations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>15-25 minute episodes perfect for commutes</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">🎯 Coming Soon</h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>CLE credits (Q2 2026 target)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>12-15 credits per year included</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Early access to new features</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/cle" className="inline-block bg-white hover:bg-gray-100 text-gray-900 px-10 py-4 rounded-lg font-bold text-lg transition-colors">
              View CLE Roadmap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
