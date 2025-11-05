"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Footer() {
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
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center space-y-6">
          {/* Brand */}
          <h3 className="text-2xl font-bold text-white">Research Cafe</h3>
          <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Transform the way you consume research. We break down cutting-edge AI papers into clear, actionable insights delivered daily.
          </p>

          {/* Subscribe/Invite Section */}
          <div className="pt-6">
            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-gray-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setMode("subscribe")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "subscribe"
                      ? "bg-gray-700 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Subscribe Yourself
                </button>
                <button
                  type="button"
                  onClick={() => setMode("invite")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "invite"
                      ? "bg-gray-700 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
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
                  className="w-full h-12 px-4 text-base rounded-lg bg-gray-800 border-2 border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder={mode === "subscribe" ? "Your email address" : "Friend's email address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 h-12 px-4 text-base rounded-lg bg-gray-800 border-2 border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 text-base bg-white hover:bg-gray-100 text-gray-900 rounded-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  {isSubmitting ? (mode === "subscribe" ? "Subscribing..." : "Sending...") : (mode === "subscribe" ? "Subscribe" : "Send Invite")}
                </Button>
              </div>
            </form>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 mt-8">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Research Cafe. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
