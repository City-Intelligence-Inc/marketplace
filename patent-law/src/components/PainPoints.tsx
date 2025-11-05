export function PainPoints() {
  return (
    <div className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Staying Current Is Getting Harder
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Patent attorneys face unprecedented pressure to stay current on Federal Circuit developments while managing client demands.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Rising Caseload */}
          <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">📈</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  100+ Opinions Per Year
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Federal Circuit publishes over 100 precedential patent opinions annually. Each one could affect your client&apos;s prosecution strategy, litigation position, or patent portfolio value.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Missing <em>Amgen v. Sanofi</em> means outdated enablement advice for antibody claims. Missing <em>Vidal v. Elster</em> means confusion on government-related trademark rejections affecting patent prosecution analogies.
                </p>
              </div>
            </div>
          </div>

          {/* Time Pressure */}
          <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">⏰</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  2,000+ Billable Hour Targets
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Average BigLaw partner needs 2,000-2,200 billable hours per year. That&apos;s 40-45 hours per week, every week. When do you read 50-page Federal Circuit opinions?
                </p>
                <p className="text-sm text-gray-600 italic">
                  You can&apos;t bill clients for professional development time. Reading cases = lost revenue. But outdated advice = malpractice risk.
                </p>
              </div>
            </div>
          </div>

          {/* Client Pressure */}
          <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">💼</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Clients Expect Immediate Expertise
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  &quot;Have you seen the new Federal Circuit decision on § 101?&quot; Client emails arrive hours after an opinion drops. They expect you to know the implications immediately.
                </p>
                <p className="text-sm text-gray-600 italic">
                  In-house counsel monitors Federal Circuit decisions via alerts. They assume you do too. Saying &quot;I haven&apos;t read it yet&quot; damages credibility.
                </p>
              </div>
            </div>
          </div>

          {/* Standard Changes */}
          <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-4xl">⚖️</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Standards Shift Without Warning
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <em>Alice</em> changed § 101 overnight. <em>KSR</em> redefined obviousness. <em>Therasense</em> tightened inequitable conduct. Miss one case, give outdated advice for years.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Prosecution work you did 6 months ago might not meet today&apos;s enablement standards post-<em>Amgen</em>. Clients don&apos;t care that the law changed—they care about patent strength.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Pain Points */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-2">🔍 Search Burden</h4>
            <p className="text-sm text-gray-700">
              No single source covers Federal Circuit patent law comprehensively. You check Bloomberg Law, Westlaw, IPWatchdog, Patent Docs, and SCOTUS Blog. 30+ minutes per day just finding updates.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-2">📊 Practice Area Silos</h4>
            <p className="text-sm text-gray-700">
              Litigators miss prosecution updates. Prosecutors miss litigation trends. But Federal Circuit decisions affect both. You need cross-practice awareness.
            </p>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h4 className="font-bold text-gray-900 mb-2">💰 CLE Credit Crunch</h4>
            <p className="text-sm text-gray-700">
              Most states require 12-25 CLE hours annually. Live conferences cost $500-1,200 + travel + lost billable time. Webinars are boring and generic. You need efficient, relevant CLE.
            </p>
          </div>
        </div>

        {/* Solution Teaser */}
        <div className="mt-16 bg-gradient-to-br from-blue-900 to-blue-800 text-white p-12 rounded-2xl text-center">
          <h3 className="text-3xl font-bold mb-4">
            15-25 Minutes Per Week. Stay Current on Everything.
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Weekly Federal Circuit case summaries designed for patent attorneys with zero spare time. Get the holdings, rationale, and practice implications—without wading through 50-page opinions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#subscribe" className="inline-block bg-white hover:bg-gray-100 text-blue-900 px-10 py-4 rounded-lg font-bold text-lg transition-colors">
              Subscribe Now ($10/mo)
            </a>
            <a href="/episodes" className="inline-block bg-blue-700 hover:bg-blue-600 text-white border-2 border-white px-10 py-4 rounded-lg font-bold text-lg transition-colors">
              Browse Episodes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
