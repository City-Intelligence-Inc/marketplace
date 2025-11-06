"use client";

import { useState } from "react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Are you CLE accredited right now?",
      answer: "Not yet. We're actively working toward CLE accreditation with a target launch of Q2 2026 in California. The current $10/month subscription gives you weekly Federal Circuit updates now, and you'll automatically get CLE credits added when we launch—at your locked-in rate."
    },
    {
      question: "How will the CLE verification work?",
      answer: "When CLE launches, each episode will include 2-3 verification codes at key points. You'll log into your dashboard and enter these codes to confirm completion (takes ~2 minutes). Once verified, your certificate will be instantly available. We're building this system now for the Q2 2026 launch."
    },
    {
      question: "What states will you target for CLE accreditation?",
      answer: "We're starting with California (largest patent attorney population). Then we'll expand to New York and Texas based on subscriber demand. Arizona is also available via self-certification (no pre-approval needed). Let us know where you're licensed—we prioritize states based on subscriber requests."
    },
    {
      question: "Will current episodes get CLE credit retroactively?",
      answer: "No. State CLE boards require content to be accredited before it's delivered, so past episodes can't earn CLE credit. However, when we bundle episodes for CLE (e.g., \"Q1 2026 § 101 Updates\"), we'll create new composite courses from similar cases that will qualify for credit going forward."
    },
    {
      question: "Who creates the content?",
      answer: "Episodes are created by Arihant (City Intelligence, Inc founder), who has 7 years of CS education experience including teaching at Berkeley and publishing at SIGCSE. Content gets advisory review from Guy Rutenberg, a patent litigation attorney. When CLE launches, Guy will serve as co-faculty to meet state bar requirements for instructor qualifications."
    },
    {
      question: "What topics do you cover?",
      answer: "We focus exclusively on Federal Circuit patent law decisions. Topics include claim construction, § 101 eligibility, enablement/written description, obviousness, IPR proceedings, damages, and litigation procedure. Each episode analyzes the practical implications for patent prosecution and litigation."
    },
    {
      question: "Can I share my subscription?",
      answer: "CLE certificates are issued to individual attorneys based on verified completion. While you can share podcast links, only the registered subscriber can earn CLE credits. We offer firm/team discounts for multiple attorneys."
    }
  ];

  return (
    <div className="bg-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-lg text-gray-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-6 h-6 text-gray-600 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
