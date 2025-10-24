"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { subscribeEmail } from "@/lib/api";

export function FinalCTA() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await subscribeEmail(email);

      if (result.success) {
        toast.success(result.message);
        setEmail("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-white via-orange-50/50 to-white py-20 sm:py-28 px-6 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-200/30 to-red-200/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Central Card Container */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-2xl p-8 sm:p-12 lg:p-16">
          {/* Section Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Start Your Journey
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-6 leading-tight text-center tracking-tight">
            Ready to Stay Ahead?
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto text-center leading-relaxed">
            Join thousands of researchers and professionals who never miss a breakthrough. Get expert-narrated research podcasts delivered daily.
          </p>

          {/* Email Subscription Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 h-14 px-6 text-base rounded-xl bg-white border-2 border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:border-gray-300"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-14 px-10 text-base bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Joining...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Get Started Free</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Unsubscribe anytime</span>
            </div>
          </div>
        </div>

        {/* Social Proof Stats - Below Card */}
        <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-black mb-2">1000+</div>
            <div className="text-sm text-gray-600">Active Subscribers</div>
          </div>
          <div className="text-center border-x border-gray-200">
            <div className="text-3xl sm:text-4xl font-bold text-black mb-2">30+</div>
            <div className="text-sm text-gray-600">Research Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-black mb-2">Daily</div>
            <div className="text-sm text-gray-600">New Episodes</div>
          </div>
        </div>
      </div>
    </section>
  );
}
