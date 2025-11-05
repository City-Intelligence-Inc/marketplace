"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ArizonaHero() {
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
      <div className="relative bg-gradient-to-br from-red-50 via-white to-orange-50 overflow-hidden">
        {/* Arizona-themed decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-200/40 to-orange-300/30 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-orange-200/40 to-yellow-300/30 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-48">
          <div className="text-center mb-16">
            {/* Arizona Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full text-base font-bold mb-8 border-2 border-green-300">
              <span className="text-2xl">✓</span>
              ARIZONA ATTORNEYS: CLE AVAILABLE NOW
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 tracking-tight">
              Federal Circuit CLE <br />
              <span className="text-orange-600">For Arizona Attorneys</span>
            </h1>

            <p className="text-2xl md:text-3xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
              Arizona allows self-certification of CLE. Start earning credits <strong>today</strong> with our Federal Circuit podcast. No waiting for accreditation.
            </p>

            {/* Key Arizona Benefits */}
            <div className="bg-white/80 backdrop-blur-sm border-2 border-orange-300 rounded-2xl p-8 mb-12 max-w-3xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div>
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-bold text-gray-900 mb-2">Available Now</h3>
                  <p className="text-sm text-gray-700">Self-certify immediately under Arizona rules</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="font-bold text-gray-900 mb-2">$10/Month</h3>
                  <p className="text-sm text-gray-700">12-15 credits per year. Cheaper than any conference</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-bold text-gray-900 mb-2">15-25 Minutes</h3>
                  <p className="text-sm text-gray-700">Federal Circuit summaries during your commute</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto mb-8">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 h-16 px-6 text-lg rounded-lg bg-white border-2 border-orange-300 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500 focus:border-transparent disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-16 px-10 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold whitespace-nowrap disabled:opacity-50"
              >
                {isSubmitting ? "Subscribing..." : "Start Earning CLE Now"}
              </Button>
            </form>

            <p className="text-sm text-gray-600">
              ✓ Cancel anytime • ✓ No commitment • ✓ Self-certify under AZ Supreme Court Rule 45
            </p>
          </div>
        </div>
      </div>

      {/* Arizona-Specific CLE Info */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How Arizona CLE Self-Certification Works
            </h2>
            <p className="text-xl text-gray-600">
              Arizona Supreme Court Rule 45 allows attorneys to self-certify CLE compliance. Here&apos;s how to use our podcasts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Listen to Episodes</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Each week, we publish a 15-25 minute Federal Circuit case summary. Listen during your commute, at the gym, or during lunch. Full transcript available if you prefer reading.
              </p>
              <p className="text-sm text-gray-600 italic">
                Topics: Claim construction, § 101 eligibility, enablement, obviousness, IPR proceedings, damages, and litigation procedure.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Track Your Hours</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Log the time spent listening/reading in your CLE tracking system. Each episode = 0.25 to 0.5 hours of CLE credit (depending on episode length and whether you review the transcript).
              </p>
              <p className="text-sm text-gray-600 italic">
                Recommendation: Track each episode immediately after completion. Most attorneys batch 4-6 episodes into 2-hour blocks for reporting.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Self-Certify Annually</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                When filing your annual CLE compliance report with the State Bar of Arizona, self-certify the hours spent on Federal Circuit podcast education as &quot;self-study&quot; substantive law CLE.
              </p>
              <p className="text-sm text-gray-600 italic">
                Arizona requires 15 hours of CLE per year. Our 50+ annual episodes can provide 12-15 hours of substantive patent law CLE.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-900">No Pre-Approval Needed</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Unlike California, New York, or Texas, Arizona does NOT require CLE providers to be pre-approved. You determine what qualifies. Federal Circuit case analysis clearly qualifies as patent law education.
              </p>
              <p className="text-sm text-gray-600 italic">
                Audit risk is low if you maintain good records: episode titles, dates listened, duration, and brief notes on key takeaways.
              </p>
            </div>
          </div>

          {/* Arizona Requirements Table */}
          <div className="bg-gray-50 p-8 rounded-2xl mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Arizona CLE Requirements</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-bold text-gray-900">Requirement</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-900">Details</th>
                    <th className="text-center py-3 px-4 font-bold text-green-600">Research Club Satisfies?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4 px-4 font-medium">Total Hours</td>
                    <td className="py-4 px-4 text-gray-700">15 hours per year</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-green-600 font-bold text-xl">✓</span>
                      <span className="block text-sm text-gray-600">12-15 hours annually</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Substantive Law</td>
                    <td className="py-4 px-4 text-gray-700">Must include legal topics relevant to practice</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-green-600 font-bold text-xl">✓</span>
                      <span className="block text-sm text-gray-600">Federal Circuit patent law</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Ethics</td>
                    <td className="py-4 px-4 text-gray-700">3 hours of professional responsibility</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-red-600 font-bold text-xl">✗</span>
                      <span className="block text-sm text-gray-600">Not covered (complete separately)</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium">Self-Study Limit</td>
                    <td className="py-4 px-4 text-gray-700">No limit on self-study hours</td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-green-600 font-bold text-xl">✓</span>
                      <span className="block text-sm text-gray-600">All 12-15 hours count</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Testimonial - Arizona Attorney */}
          <div className="bg-gradient-to-br from-orange-100 to-white border-2 border-orange-300 rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                DM
              </div>
              <div>
                <p className="text-lg text-gray-800 italic mb-4">
                  &ldquo;As an Arizona patent prosecutor, I self-certify 12 hours annually from Research Club podcasts. I listen during my morning workout and while driving to client meetings. The Federal Circuit updates are immediately applicable to my prosecution practice. Arizona&apos;s self-certification makes this incredibly easy.&rdquo;
                </p>
                <p className="font-bold text-gray-900">David M.</p>
                <p className="text-sm text-gray-600">Patent Prosecutor, Phoenix, AZ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-orange-900 to-orange-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start Earning Arizona CLE Credits Today
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            $10/month. 12-15 hours per year. Self-certify under Arizona Supreme Court Rule 45. Cancel anytime.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto mb-8">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 h-16 px-6 text-lg rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-300 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-16 px-10 text-lg bg-white hover:bg-gray-100 text-orange-900 rounded-lg font-bold whitespace-nowrap disabled:opacity-50"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe Now"}
            </Button>
          </form>

          <div className="flex flex-wrap justify-center gap-8 text-orange-100">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Available Immediately</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Self-Certify</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
