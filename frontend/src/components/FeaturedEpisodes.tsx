"use client";

import { useEffect, useState } from "react";
import { getEpisodes, Episode } from "@/lib/api";
import Link from "next/link";

export function FeaturedEpisodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEpisodes() {
      const result = await getEpisodes();
      if (result.success) {
        // Show latest 6 episodes
        setEpisodes(result.episodes.slice(0, 6));
      }
      setLoading(false);
    }

    fetchEpisodes();
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getGradient = (index: number) => {
    const gradients = [
      "from-orange-500 to-red-600",
      "from-purple-500 to-pink-600",
      "from-blue-500 to-cyan-600",
      "from-green-500 to-emerald-600",
      "from-yellow-500 to-orange-600",
      "from-red-500 to-pink-600",
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <section className="relative bg-white py-20 sm:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (episodes.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-white py-20 sm:py-28 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Latest Research
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Recent Episodes
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Listen to our most recent expert-narrated research podcasts
          </p>
        </div>

        {/* Episodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {episodes.map((episode, index) => (
            <div
              key={episode.podcast_id}
              className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
            >
              {/* Gradient Header */}
              <div className={`relative h-32 bg-gradient-to-br ${getGradient(index)} p-6 flex items-end`}>
                {/* Category Badge */}
                {episode.category && episode.category !== 'General' && (
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {episode.category}
                  </div>
                )}

                {/* Play Button */}
                <button
                  onClick={() => {
                    const audio = document.getElementById(`audio-featured-${episode.podcast_id}`) as HTMLAudioElement;
                    if (audio) {
                      if (audio.paused) {
                        audio.play();
                      } else {
                        audio.pause();
                      }
                    }
                  }}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 group/play"
                >
                  <svg className="w-5 h-5 text-orange-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Date */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatDate(episode.sent_at)}</span>
                  </div>
                  {episode.duration && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span>•</span>
                      <span>{episode.duration} min</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-black mb-3 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {episode.paper_title}
                </h3>

                {/* Authors */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {episode.paper_authors}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {episode.paper_url && episode.paper_url !== '#' ? (
                    <a
                      href={episode.paper_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Read Paper</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <div></div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span>Podcast</span>
                  </div>
                </div>
              </div>

              {/* Hidden Audio Player */}
              <audio id={`audio-featured-${episode.podcast_id}`} className="hidden">
                <source src={episode.audio_url} type="audio/mpeg" />
              </audio>

              {/* Bottom Accent Line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradient(index)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
            </div>
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
