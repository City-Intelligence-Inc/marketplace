export default function EpisodesPage() {
  return (
    <div className="bg-white min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            All Episodes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Weekly Federal Circuit patent law case summaries. Each episode includes full transcripts with case citations.
          </p>
        </div>

        {/* Episodes Embed */}
        <div className="transform transition-all duration-700 ease-out">
          <iframe
            src="https://terminus.complete.city/p/b21ae987-5b7d-4b0a-844b-b3562358e3e8"
            className="w-full h-[800px] shadow-2xl"
            style={{ border: '1px solid #e5e7eb', borderRadius: '12px' }}
            scrolling="yes"
            allowFullScreen
          />
        </div>

        {/* Episode Topics */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Topics Covered</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Claim Construction</h3>
              <p className="text-gray-600 text-sm">
                Analysis of how courts interpret patent claim language and apply the Phillips standard.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-3">§ 101 Eligibility</h3>
              <p className="text-gray-600 text-sm">
                Alice/Mayo framework updates and software patent eligibility developments.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Enablement & Written Description</h3>
              <p className="text-gray-600 text-sm">
                § 112(a) requirements including post-Amgen antibody patent guidance.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Obviousness</h3>
              <p className="text-gray-600 text-sm">
                KSR motivation to combine, secondary considerations, and Graham factor analysis.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-3">IPR Proceedings</h3>
              <p className="text-gray-600 text-sm">
                PTAB practice, estoppel issues, and institution decisions.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Damages & Litigation</h3>
              <p className="text-gray-600 text-sm">
                Reasonable royalty calculations, apportionment, and procedural issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
