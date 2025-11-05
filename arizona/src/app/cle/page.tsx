import Link from "next/link";

export default function CLEPage() {
  return (
    <div className="bg-white min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Our Path to CLE Accreditation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;re committed to making these podcasts CLE-eligible. Here&apos;s our realistic timeline.
          </p>
        </div>

        <div className="space-y-8 mb-20">
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

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Why start before CLE accreditation?</h3>
              <p className="text-gray-700">
                Patent attorneys need Federal Circuit updates <em>now</em>, not in 2026. By subscribing today at $10/month, you get immediate value (case summaries, transcripts) plus guaranteed CLE credits when we launch—all at your locked-in rate.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What if accreditation is delayed?</h3>
              <p className="text-gray-700">
                Our Q2 2026 timeline is realistic but not guaranteed. State bar review can take longer. If delayed, your subscription continues at $10/month until CLE launches. You lose nothing and keep getting Federal Circuit updates.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Can past episodes earn CLE credit?</h3>
              <p className="text-gray-700">
                No. State CLE boards require content to be accredited <em>before</em> delivery. Episodes published before our accreditation date won&apos;t qualify for credit. But you&apos;re still getting valuable Federal Circuit analysis now.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Who creates the content?</h3>
              <p className="text-gray-700">
                Episodes are created by Arihant (Research Club founder), who has 7 years of CS education experience at Berkeley. Advisory review from Guy Rutenberg, a patent litigation attorney. When CLE launches, Guy serves as co-faculty to meet state bar instructor requirements.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-8 rounded-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe now at $10/month. Get Federal Circuit updates today, CLE credits in Q2 2026.
          </p>
          <Link href="/pricing" className="inline-block bg-white hover:bg-gray-100 text-gray-900 px-10 py-4 rounded-lg font-bold text-lg transition-colors">
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
