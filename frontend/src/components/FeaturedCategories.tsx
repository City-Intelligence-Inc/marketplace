"use client";

import { useEffect, useState } from "react";
import { getCategories, Category } from "@/lib/api";

export function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const result = await getCategories();
      if (result.success) {
        // Show top 8 categories
        setCategories(result.categories.slice(0, 8));
      }
      setLoading(false);
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-50 py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Explore Topics
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover research podcasts across diverse fields
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-500 cursor-pointer"
            >
              {/* Category Badge */}
              <div className="mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                  {category.name.charAt(0)}
                </div>
              </div>

              {/* Category Name */}
              <h3 className="text-lg font-bold text-black mb-2 group-hover:text-orange-600 transition-colors">
                {category.name}
              </h3>

              {/* Episode Count */}
              <p className="text-sm text-gray-500">
                {category.count} {category.count === 1 ? 'episode' : 'episodes'}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
