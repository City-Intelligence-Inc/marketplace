"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PricingPage() {
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
    <div className="bg-white min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Subscribe now at $10/month and keep this rate forever—even when CLE launches at $35/month.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {/* Current Plan */}
          <div className="bg-gradient-to-br from-blue-50 to-white border-4 border-blue-600 rounded-2xl p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold">
              AVAILABLE NOW
            </div>
            <div className="text-center mb-6 mt-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Current Subscriber</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-gray-900">$10</span>
                <span className="text-xl text-gray-600">/month</span>
              </div>
              <p className="text-sm text-blue-600 font-semibold mt-2">Lock in this rate forever</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "All weekly Federal Circuit episodes",
                "Full transcripts with case citations",
                "Access to complete episode archive",
                "Keep $10/month when CLE launches",
                "Automatic upgrade to CLE credits (Q2 2026)",
                "Cancel anytime, no commitment"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full h-14 px-6 text-base rounded-lg bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500 disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe Now"}
              </Button>
            </form>

            <p className="text-center text-sm text-green-600 font-semibold mt-4">
              Save $300/year vs. future CLE pricing
            </p>
          </div>

          {/* Future Plan */}
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-300 rounded-2xl p-8 opacity-75">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Future CLE Tier</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-gray-900">$35</span>
                <span className="text-xl text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-600 font-semibold mt-2">Launching Q2 2026</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                "Everything in Current plan",
                "12-15 CLE credits per year",
                "CLE certificates & tracking",
                "Verification system access",
                "Priority customer support",
                "Multi-state accreditation"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="w-full bg-gray-300 text-gray-600 text-center py-4 rounded-lg font-bold text-lg cursor-not-allowed">
              Coming Q2 2026
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              For new subscribers after CLE launches
            </p>
          </div>
        </div>

        {/* Value Prop */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎯</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Move: Subscribe now for $10/month</h3>
              <p className="text-gray-700 mb-4">
                When CLE accreditation launches, your rate stays locked at $10/month (vs. $35/month for new subscribers). That&apos;s $300/year in savings while getting the exact same CLE credits.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Compare:</strong> Traditional live CLE conference = $500-1,200 + travel costs + full day of lost billable hours
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How We Compare</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-4 px-4 font-bold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-bold text-blue-600">Research Club</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-500">Live Conference</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-500">Generic Webinar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-4 font-medium">Cost</td>
                  <td className="py-4 px-4 text-center text-green-600 font-bold">$10/mo ($120/year)</td>
                  <td className="py-4 px-4 text-center text-gray-600">$500-1,200/event</td>
                  <td className="py-4 px-4 text-center text-gray-600">$200-400/year</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Credits/Year</td>
                  <td className="py-4 px-4 text-center font-semibold">12-15</td>
                  <td className="py-4 px-4 text-center text-gray-600">6-8</td>
                  <td className="py-4 px-4 text-center text-gray-600">10-12</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Time Investment</td>
                  <td className="py-4 px-4 text-center text-green-600">15-25 min/episode</td>
                  <td className="py-4 px-4 text-center text-gray-600">Full day + travel</td>
                  <td className="py-4 px-4 text-center text-gray-600">1-2 hours/session</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Federal Circuit Focus</td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-green-600 text-2xl">✓</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-gray-400 text-2xl">—</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-gray-400 text-2xl">—</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Flexible Schedule</td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-green-600 text-2xl">✓</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-red-600 text-2xl">✗</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-gray-600">Partially</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
