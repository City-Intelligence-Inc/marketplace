"use client";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Subscribe to Your Topics",
      description: "Choose the research areas and fields that matter most to you",
      icon: "📚"
    },
    {
      number: "2",
      title: "Daily Podcasts Delivered",
      description: "Get expert-curated 10-minute podcasts every morning",
      icon: "🎧"
    },
    {
      number: "3",
      title: "Stay Ahead in Your Field",
      description: "Never miss important research and breakthroughs",
      icon: "🚀"
    }
  ];

  return (
    <section className="bg-white py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to stay informed
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-6 text-4xl">
                  {step.icon}
                </div>

                {/* Step Number */}
                <div className="absolute top-0 right-0 md:right-auto md:left-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-black mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector Line (hidden on mobile, shown on tablet+) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-orange-500/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
