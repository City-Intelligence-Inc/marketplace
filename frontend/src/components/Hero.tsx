"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TrustedBy } from "@/components/TrustedBy";

export function Hero() {
  const [mode, setMode] = useState<"subscribe" | "invite">("subscribe");
  const [email, setEmail] = useState("");
  const [inviterName, setInviterName] = useState("");
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

    if (mode === "invite" && !inviterName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsSubmitting(true);

    try {
      let apiUrl: string;
      let successMessage: string;

      if (mode === "subscribe") {
        apiUrl = `https://dhzmiptmem.us-east-1.awsapprunner.com/podcast/agents/d50c4109-cf72-4f01-9db7-80422fcf038b/subscribe-email?email=${encodeURIComponent(email)}`;
        successMessage = "Thanks for subscribing! Check your inbox.";
      } else {
        apiUrl = `https://dhzmiptmem.us-east-1.awsapprunner.com/podcast/agents/d50c4109-cf72-4f01-9db7-80422fcf038b/invite-email?email=${encodeURIComponent(email)}&inviter_name=${encodeURIComponent(inviterName)}`;
        successMessage = "Invitation sent! Your friend will receive an email soon.";
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(successMessage);
        setEmail("");
        setInviterName("");
      } else {
        console.error("API Error:", response.status, response.statusText);
        const errorText = await response.text().catch(() => '');
        console.error("Error body:", errorText);
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
    <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/40 to-pink-300/30 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-cyan-200/30 to-blue-300/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Your Daily Dose of <br />
            <span className="text-gray-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-500 cursor-default">Breakthrough Research</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We turn complex AI research papers into digestible 10-minute episodes.
            Subscribe and stay ahead of the curve.
          </p>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMode("subscribe")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "subscribe"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Subscribe Yourself
              </button>
              <button
                type="button"
                onClick={() => setMode("invite")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "invite"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Invite a Friend
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 max-w-lg mx-auto">
            {mode === "invite" && (
              <input
                type="text"
                placeholder="Your name"
                value={inviterName}
                onChange={(e) => setInviterName(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-12 px-4 text-base rounded-lg bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder={mode === "subscribe" ? "Your email address" : "Friend's email address"}
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
                {isSubmitting ? (mode === "subscribe" ? "Subscribing..." : "Sending...") : (mode === "subscribe" ? "Subscribe" : "Send Invite")}
              </Button>
            </div>
          </form>
        </div>

        {/* Trusted By Section */}
        <div className="mt-20">
          <TrustedBy />
        </div>
      </div>

      {/* Episodes Section */}
      <div className="bg-white py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <iframe
            src="https://terminus.complete.city/p/d50c4109-cf72-4f01-9db7-80422fcf038b"
            className="w-full h-[600px] sm:h-[700px] md:h-[800px]"
            style={{ border: '1px solid #e5e7eb', borderRadius: '12px' }}
            scrolling="no"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
