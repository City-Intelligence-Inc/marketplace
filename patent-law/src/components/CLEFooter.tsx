"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CLEFooter() {
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviterName, setInviterName] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subscribeEmail) {
      toast.error("Please enter an email address");
      return;
    }

    if (!subscribeEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubscribing(true);

    try {
      const apiUrl = `https://dhzmiptmem.us-east-1.awsapprunner.com/podcast/agents/b21ae987-5b7d-4b0a-844b-b3562358e3e8/subscribe-email?email=${encodeURIComponent(subscribeEmail)}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success("Thanks for subscribing! Check your inbox.");
        setSubscribeEmail("");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Unable to connect. Please try again later.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail || !inviterName) {
      toast.error("Please enter both name and email");
      return;
    }

    if (!inviteEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsInviting(true);

    try {
      const apiUrl = `https://dhzmiptmem.us-east-1.awsapprunner.com/podcast/agents/b21ae987-5b7d-4b0a-844b-b3562358e3e8/invite-email?email=${encodeURIComponent(inviteEmail)}&inviter_name=${encodeURIComponent(inviterName)}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success("Invitation sent successfully!");
        setInviteEmail("");
        setInviterName("");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Unable to connect. Please try again later.");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Subscribe & Invite Section */}
        <div className="mb-16 grid md:grid-cols-2 gap-8">
          {/* Subscribe Form */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Subscribe to Updates</h3>
            <p className="text-gray-400 mb-6">
              Join the first batch and get access for free
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                disabled={isSubscribing}
                className="h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50"
              >
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>

          {/* Invite Form */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Invite a Colleague</h3>
            <p className="text-gray-400 mb-6">
              Share this with other patent attorneys
            </p>
            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={inviterName}
                onChange={(e) => setInviterName(e.target.value)}
                disabled={isInviting}
                className="h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <input
                type="email"
                placeholder="Colleague's email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isInviting}
                className="h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={isInviting}
                className="h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold disabled:opacity-50"
              >
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">Research Club</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Making continuing legal education work with your schedule, not against it.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="/episodes" className="text-gray-400 hover:text-white transition-colors">
                  Episodes
                </a>
              </li>
              <li>
                <a href="/states" className="text-gray-400 hover:text-white transition-colors">
                  State Requirements
                </a>
              </li>
              <li>
                <a href="/cle" className="text-gray-400 hover:text-white transition-colors">
                  CLE Roadmap
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company/Legal Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  CLE Accreditation
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Research Club. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="mailto:contact@researchclub.com"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Email"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
