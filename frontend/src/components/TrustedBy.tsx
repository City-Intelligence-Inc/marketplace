export function TrustedBy() {
  const companies = [
    "Stanford University",
    "MIT",
    "Google Research",
    "OpenAI",
    "DeepMind",
    "Harvard",
  ];

  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">
          Trusted by researchers and professionals at
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {companies.map((company) => (
            <div
              key={company}
              className="text-gray-400 hover:text-gray-600 transition-colors text-center font-medium text-sm"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
