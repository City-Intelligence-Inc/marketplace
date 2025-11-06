import { USAMap } from "@/components/USAMap";
import Link from "next/link";

export default function StatesPage() {
  return (
    <div className="bg-white min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            State CLE Requirements
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how City Intelligence, Inc podcasts satisfy CLE requirements in your state. Select your state below for specific details.
          </p>
        </div>

        <USAMap />

        {/* General CLE Info */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">📚 Quarterly Bundles</h3>
              <p className="text-gray-700">
                When CLE launches, we&apos;ll bundle 6-8 related episodes into quarterly courses. Each bundle provides 3-4 CLE credits focusing on a specific topic (e.g., &quot;Q1 2026 Enablement Updates&quot; or &quot;Q2 2026 Claim Construction&quot;).
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">✅ Verification System</h3>
              <p className="text-gray-700">
                Each episode includes 2-3 verification codes at key points. Listen to the full episode, enter the codes in your dashboard (takes ~2 minutes), and instantly download your CLE certificate. Simple and fraud-proof.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 Credit Type</h3>
              <p className="text-gray-700">
                Our podcasts qualify as <strong>general skills/substantive law CLE</strong>. They do <strong>not</strong> cover ethics, elimination of bias, or attorney wellness requirements. You&apos;ll still need to complete those separately.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">📝 Self-Study Format</h3>
              <p className="text-gray-700">
                All states that accept podcast/audio CLE classify it as &quot;self-study&quot; or &quot;recorded&quot; CLE. Most states cap self-study credits at 50-60% of total requirements. Our 12-15 annual credits fit well within these limits.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">🗓️ Accreditation Timeline</h3>
              <p className="text-gray-700 mb-3">
                <strong>Phase 1 (Now):</strong> Content creation. Subscribe at $10/month to start getting Federal Circuit updates immediately.
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Phase 2 (Q2 2026):</strong> California launch. Existing subscribers keep $10/month rate, new subscribers pay $35/month.
              </p>
              <p className="text-gray-700">
                <strong>Phase 3 (Q3 2026+):</strong> Expansion to NY, TX, and other states based on demand.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16 px-8 rounded-2xl">
          <h2 className="text-4xl font-bold mb-4">Lock In Your Rate Now</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe today at $10/month. When CLE launches in your state, you keep this rate forever (vs. $35/month for new subscribers).
          </p>
          <Link href="/" className="inline-block bg-white hover:bg-gray-100 text-blue-900 px-10 py-4 rounded-lg font-bold text-lg transition-colors">
            Subscribe Now
          </Link>
        </div>
      </div>
    </div>
  );
}
