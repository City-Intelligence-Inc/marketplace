"use client";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Subscribe to Your Topics",
      description: "Choose from 30+ research areas including AI, Law, Healthcare, and more. Customize your daily feed.",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      number: "02",
      title: "Receive Daily Podcasts",
      description: "Get 10-minute expert-narrated podcasts every morning. Listen on your commute, at the gym, or over coffee.",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    {
      number: "03",
      title: "Stay Ahead in Your Field",
      description: "Never miss breakthrough research. Stay informed, sound smarter in meetings, and lead conversations.",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <section className="relative bg-white py-20 sm:py-28 px-6 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 via-white to-white" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Simple Process
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Three simple steps to transform how you consume research
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connector Line - Desktop Only */}
          <div className="hidden md:block absolute top-20 left-[16.66%] right-[16.66%] h-[2px]">
            <div className="h-full bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
          </div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Card */}
              <div className="relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-xl group">
                {/* Step Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">{step.number}</span>
                </div>

                {/* Icon Container */}
                <div className="mb-6 mt-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-black mb-3 leading-tight">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-transparent rounded-tl-[100px] -z-10 group-hover:scale-150 transition-transform duration-500" />
              </div>

              {/* Arrow Connector - Mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-6">
                  <svg className="w-6 h-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            Join thousands of researchers, professionals, and lifelong learners
          </p>
        </div>
      </div>
    </section>
  );
}
