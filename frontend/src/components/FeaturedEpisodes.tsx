"use client";

import { useEffect, useState } from "react";
import { getEpisodes, Episode } from "@/lib/api";

export function FeaturedEpisodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEpisodes() {
      const result = await getEpisodes();
      if (result.success) {
        // Show latest 3 episodes
        setEpisodes(result.episodes.slice(0, 3));
      }
      setLoading(false);
    }

    fetchEpisodes();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="bg-white py-24 px-6 sm:px-8 lg:px-12">
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

  if (episodes.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Latest Episodes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Listen to our most recent research podcasts
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-8 max-w-4xl mx-auto">
          {episodes.map((episode, index) => (
            <div
              key={episode.podcast_id}
              className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-100 hover:border-orange-500 transition-all duration-300 hover:shadow-xl"
            >
              {/* Episode Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-block bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                    New
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(episode.sent_at)}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-black mb-2 leading-tight">
                  {episode.paper_title}
                </h3>

                <p className="text-gray-600">
                  {episode.paper_authors}
                </p>
              </div>

              {/* Audio Player */}
              <div className="mb-4">
                <audio
                  controls
                  className="w-full"
                  preload="none"
                  style={{
                    height: '54px',
                    borderRadius: '12px'
                  }}
                >
                  <source src={episode.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>

              {/* Paper Link */}
              {episode.paper_url && episode.paper_url !== '#' && (
                <a
                  href={episode.paper_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  <span>Read the paper</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
