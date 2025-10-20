"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = [
  { name: "AI", color: "from-purple-500 to-pink-500" },
  { name: "Crypto", color: "from-orange-500 to-yellow-500" },
  { name: "Quantum Computing", color: "from-blue-500 to-cyan-500" },
  { name: "Patent Law", color: "from-green-500 to-emerald-500" },
  { name: "Healthcare", color: "from-red-500 to-pink-500" },
  { name: "Climate Science", color: "from-teal-500 to-green-500" },
  { name: "Space Exploration", color: "from-indigo-500 to-purple-500" },
  { name: "Neuroscience", color: "from-violet-500 to-fuchsia-500" },
  { name: "UI/UX Design", color: "from-amber-500 to-orange-500" },
  { name: "Economics", color: "from-blue-600 to-indigo-600" },
];

// Mock podcast data
const generatePodcasts = (category: string) => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `${category}-${i}`,
    title: `${category} Podcast ${i + 1}`,
    description: `Latest insights and research in ${category}`,
    duration: `${Math.floor(Math.random() * 30 + 15)} min`,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  }));
};

export default function Episodes() {
  return (
    <div className="min-h-screen bg-black pt-20 pb-16">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-12 pb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Episodes
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Explore curated podcasts across all categories
          </p>
        </div>

        {/* Category Rows */}
        <div className="space-y-12">
          {categories.map((category) => {
            const podcasts = generatePodcasts(category.name);
            return (
              <div key={category.name} className="space-y-4">
                {/* Category Title */}
                <h2 className="text-2xl font-bold text-white">
                  {category.name}
                </h2>

                {/* Horizontal Scrolling Cards */}
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-4 pb-4">
                    {podcasts.map((podcast) => (
                      <Card
                        key={podcast.id}
                        className="inline-block w-[280px] bg-zinc-900 border-zinc-800 hover:bg-zinc-800 transition-all cursor-pointer group"
                      >
                        {/* Podcast Thumbnail */}
                        <div className={`h-40 bg-gradient-to-br ${category.color} rounded-t-lg relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                            {podcast.duration}
                          </div>
                        </div>

                        {/* Podcast Info */}
                        <div className="p-4 space-y-2">
                          <h3 className="font-semibold text-white truncate group-hover:text-orange-500 transition-colors">
                            {podcast.title}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {podcast.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {podcast.date}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
