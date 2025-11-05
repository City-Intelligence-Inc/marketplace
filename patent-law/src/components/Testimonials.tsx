export function Testimonials() {
  const testimonials = [
    {
      text: "Finally, CLE that doesn&apos;t waste my time. I get my quarterly credits done during my commute. The analysis is spot-on and actually helps with client counseling.",
      author: "Sarah H.",
      role: "Patent Litigator, SF Bay Area",
      initials: "SH"
    },
    {
      text: "As in-house counsel, I need to stay current on Federal Circuit developments but have zero time for live webinars. This is exactly what I needed.",
      author: "Michael K.",
      role: "VP IP, Tech Company",
      initials: "MK"
    },
    {
      text: "The enablement episode after Amgen was brilliant. Immediately useful for a brief I was drafting. Worth every penny just for that one episode.",
      author: "Jennifer L.",
      role: "Patent Prosecutor, Boston",
      initials: "JL"
    }
  ];

  return (
    <div className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Patent Professionals
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">&ldquo;{testimonial.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
