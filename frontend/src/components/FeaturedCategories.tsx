"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, Category } from "@/lib/api";

export function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const result = await getCategories();
      if (result.success) {
        // Show top 9 categories (3x3 grid looks better)
        setCategories(result.categories.slice(0, 9));
      }
      setLoading(false);
    }

    fetchCategories();
  }, []);

  const getCategoryIcon = (name: string) => {
    const icons: Record<string, React.JSX.Element> = {
      'AI': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      'Law': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
      'default': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      )
    };
    return icons[name] || icons.default;
  };

  if (loading) {
    return (
      <section className="relative bg-gradient-to-b from-white via-gray-50 to-white py-20 sm:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-40"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gradient-to-b from-white via-gray-50 to-white py-20 sm:py-28 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Browse Topics
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Explore Research Areas
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover expert-curated podcasts across diverse fields
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href="/episodes"
              className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />

              {/* Content */}
              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {getCategoryIcon(category.name)}
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-black mb-2 group-hover:text-orange-600 transition-colors leading-tight">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {category.count} {category.count === 1 ? 'episode' : 'episodes'} available
                  </p>

                  {/* Arrow Icon */}
                  <div className="flex items-center text-orange-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Explore</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/episodes"
            className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-orange-500 text-black hover:text-orange-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
          >
            View All Episodes
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
