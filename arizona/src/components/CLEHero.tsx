"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CLEHero() {
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
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/40 to-pink-300/30 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="text-center mb-16">
            {/* CLE Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="animate-pulse">●</span>
              CLE Accreditation In Progress • Available Now Without CLE
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              Federal Circuit Updates. <br />
              <span className="text-gray-600">Soon: CLE Credits Too.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Weekly Federal Circuit patent law case summaries delivered as podcasts. Currently working toward CLE accreditation for Q2 2026. Subscribe now to get grandfathered pricing when CLE launches.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a href="#subscribe" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors">
                Subscribe Now ($10/mo)
              </a>
              <a href="#roadmap" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg transition-colors">
                CLE Roadmap
              </a>
            </div>

            {/* Key Features */}
            <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Weekly episodes
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Full transcripts
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                CLE coming Q2 2026
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Episode Showcase */}
      <div className="bg-white py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest Episode</h2>
            <p className="text-lg text-gray-600">Available Now</p>
          </div>

          {/* Episode Card */}
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Amgen v. Sanofi Revisited
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  Federal Circuit clarifies enablement requirements for antibody patents post-Amgen
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>23 min</span>
                  <span>•</span>
                  <span>Nov 1, 2025</span>
                  <span>•</span>
                  <span className="font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">§ 112(a)</span>
                </div>
              </div>
            </div>
            <Button className="w-full bg-gray-900 hover:bg-gray-700 text-white py-6 text-lg font-semibold">
              Listen Now
            </Button>
          </div>

          {/* More Episodes */}
          <div className="max-w-3xl mx-auto mt-8 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <h4 className="font-semibold text-gray-900">Claim Construction Update</h4>
                <p className="text-sm text-gray-600">18 min • Oct 25</p>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <h4 className="font-semibold text-gray-900">IPR Estoppel Boundaries</h4>
                <p className="text-sm text-gray-600">21 min • Oct 18</p>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-2xl font-bold text-gray-900 mb-2">$10/mo</p>
            <p className="text-gray-600">Current pricing</p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📅</span>
                <span>Weekly</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎙️</span>
                <span>New episodes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Staying Current on Federal Circuit Law Is Hard
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Between client work, court deadlines, and patent prosecution, reading every Federal Circuit decision feels impossible. But you need to stay current.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Time to Read Cases</h3>
              <p className="text-gray-600">
                Federal Circuit publishes 100+ patent opinions per year. Reading full decisions takes hours you don&apos;t have.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Precedent Changes Fast</h3>
              <p className="text-gray-600">
                Miss one key case on § 101 or claim construction and you could give clients outdated advice.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Need Quick Summaries</h3>
              <p className="text-gray-600">
                You need the holdings, rationale, and practical implications—without wading through 50-page opinions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Solution/Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Federal Circuit Updates. On Your Schedule.
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to stay current. CLE accreditation coming Q2 2026.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border-2 border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                🎓
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">CLE Accreditation Coming</h3>
              <p className="text-gray-600 leading-relaxed">
                We&apos;re actively pursuing CLE accreditation for California (target: Q2 2026). Subscribe now to get grandfathered pricing when CLE launches.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl border-2 border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                💡
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Actionable Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Not just case summaries—strategic analysis of how new precedent affects your practice and client counseling.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl border-2 border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                ⏱️
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">15-25 Minutes</h3>
              <p className="text-gray-600 leading-relaxed">
                Perfect for your commute, gym session, or lunch break. Get the key holdings and takeaways without the fluff.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-xl border-2 border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                ✨
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Clear Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Created by a CS educator with 7 years teaching experience at Berkeley. Advisory input from patent litigation attorney Guy Rutenberg.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-xl border-2 border-pink-100">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                📚
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Organized by Topic</h3>
              <p className="text-gray-600 leading-relaxed">
                Episodes organized by legal topic (claim construction, § 101, enablement). When CLE launches, quarterly bundles will offer 3-4 credits.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-xl border-2 border-indigo-100">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                📝
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Full Transcripts</h3>
              <p className="text-gray-600 leading-relaxed">
                Every episode includes a detailed transcript with case citations for easy reference and quote extraction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Embed */}
      <div className="bg-gray-50 py-20" id="episodes">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">All Episodes</h2>
            <p className="text-lg text-gray-600">Browse our complete archive of Federal Circuit case analyses</p>
          </div>
          <div className="transform transition-all duration-700 ease-out opacity-0 translate-y-8 animate-fade-in-up">
            <iframe
              src="https://terminus.complete.city/p/b21ae987-5b7d-4b0a-844b-b3562358e3e8"
              className="w-full h-[600px] sm:h-[700px] md:h-[800px] shadow-2xl"
              style={{ border: '1px solid #e5e7eb', borderRadius: '12px' }}
              scrolling="no"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      {/* CLE Roadmap Section */}
      <div className="bg-white py-20" id="roadmap">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Path to CLE Accreditation
            </h2>
            <p className="text-xl text-gray-600">
              We&apos;re committed to making these podcasts CLE-eligible. Here&apos;s our realistic timeline.
            </p>
          </div>

          <div className="space-y-8">
            {/* Phase 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold">
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Phase 1: Content Creation</h3>
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Complete</span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Weekly Federal Circuit case summaries with full transcripts. Currently producing high-quality content for subscribers at $10/month.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> Live and publishing weekly. Growing subscriber base provides proof of demand.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Phase 2: Build CLE Infrastructure</h3>
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Dec 2025 - Jan 2026</span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Implement verification system (embedded codes, quiz questions), develop certificate generation, and create attendance tracking dashboard.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Investment needed:</strong> $2,000-3,000 for technical infrastructure and legal review of materials.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Phase 3: California Accreditation Application</h3>
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Feb 2026</span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Submit application to California State Bar 60 days before intended launch. Bundle 6-8 episodes into quarterly course offerings (3-4 CLE credits each).
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Timeline:</strong> 30-45 day review period. Application fee: $90.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-orange-600 text-white flex items-center justify-center text-2xl font-bold">
                  4
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Phase 4: Launch CLE Version</h3>
                    <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Target: Q2 2026</span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Once approved, launch premium tier at $35/month with CLE credits. Existing $10/month subscribers grandfathered at current pricing.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Your advantage:</strong> Subscribe now at $10/month, keep this rate even when CLE launches.
                  </p>
                </div>
              </div>
            </div>

            {/* Phase 5 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-pink-600 text-white flex items-center justify-center text-2xl font-bold">
                  5
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Phase 5: Expand to Additional States</h3>
                    <span className="bg-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Q3 2026+</span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Apply for accreditation in New York and Texas based on subscriber demand. Each state requires separate application and fees.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Arizona available immediately via self-certification (no pre-approval needed).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Subscribe Now Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Subscribe Now?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-3">💰 Lock in $10/month forever</h3>
              <p className="text-gray-200">
                When CLE launches at $35/month, you keep your current rate
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-3">🚀 Stay current right now</h3>
              <p className="text-gray-200">
                Don&apos;t wait for CLE—start getting Federal Circuit updates today
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-3">🎯 Help shape the product</h3>
              <p className="text-gray-200">
                Early subscribers get input on CLE bundle topics and format
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-3">✅ Zero risk</h3>
              <p className="text-gray-200">
                Cancel anytime. No commitment required
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-20" id="pricing">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple Pricing. Lock In Now.
            </h2>
            <p className="text-xl text-gray-600">
              Subscribe now at $10/month and keep this rate forever—even when CLE launches at $35/month.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                  "Full transcripts with citations",
                  "Access to episode archive",
                  "Keep $10/month when CLE launches",
                  "Automatic upgrade to CLE credits (Q2 2026)",
                  "Cancel anytime"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <a href="#subscribe" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-lg font-bold text-lg transition-colors">
                Subscribe Now
              </a>
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

          <div className="mt-12 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-xl p-8 max-w-4xl mx-auto">
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
        </div>
      </div>

      {/* Subscribe Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20" id="subscribe">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Subscribe Now. Lock In $10/Month Forever.
            </h2>
            <p className="text-xl text-gray-300">
              Get weekly Federal Circuit updates starting today. When CLE launches in Q2 2026, you keep your $10/month rate (vs. $35/month for new subscribers). That&apos;s $300/year in savings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 h-14 px-6 text-lg rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500 disabled:opacity-50"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold whitespace-nowrap disabled:opacity-50"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe Now"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                $10/month
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Rate locked forever
              </div>
            </div>
          </form>

          <div className="text-center mt-8 space-y-2">
            <p className="text-3xl font-bold">$10/mo</p>
            <p className="text-gray-400">Current rate</p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div>
                <p className="font-semibold">Weekly</p>
                <p className="text-sm text-gray-400">New episodes</p>
              </div>
              <div className="w-px h-12 bg-gray-700"></div>
              <div>
                <p className="font-semibold">Q2 &apos;26</p>
                <p className="text-sm text-gray-400">CLE launch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
