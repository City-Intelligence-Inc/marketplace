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
    <section className="bg-gradient-to-br from-orange-50 via-white to-red-50 py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
          Ready to stay ahead?
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Join researchers and professionals who never miss a breakthrough.
          Get started with your daily research podcasts.
        </p>

        {/* Email Subscription Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 h-14 px-6 text-base rounded-lg bg-white border-2 border-gray-300 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-14 px-10 text-base bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isSubmitting ? "Joining..." : "Get Started Free"}
          </Button>
        </form>

        <p className="text-sm text-gray-500 mt-6">
          No credit card required. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
