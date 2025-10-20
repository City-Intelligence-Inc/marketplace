"use client";

import { useEffect, useState } from "react";
import { getEpisodes, Episode } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Episodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEpisodes() {
      setIsLoading(true);
      const result = await getEpisodes();

      if (result.success) {
        setEpisodes(result.episodes);
      } else {
        setError(result.error || "Failed to load episodes");
      }

      setIsLoading(false);
    }

    fetchEpisodes();
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-32 pb-20 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-bold text-black mb-8 text-center">
          Episodes
        </h1>

        {isLoading && (
          <p className="text-xl text-gray-600 text-center">Loading episodes...</p>
        )}

        {error && (
          <p className="text-xl text-red-600 text-center">{error}</p>
        )}

        {!isLoading && !error && episodes.length === 0 && (
          <p className="text-xl text-gray-600 text-center">No episodes available yet.</p>
        )}

        {!isLoading && !error && episodes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((episode) => (
              <Card key={episode.podcast_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{episode.paper_title}</CardTitle>
                  <CardDescription className="text-sm">
                    {episode.paper_authors}
                  </CardDescription>
                  <CardDescription className="text-xs text-gray-500">
                    {formatDate(episode.sent_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <audio controls className="w-full">
                    <source src={episode.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  {episode.paper_url !== 'N/A' && episode.paper_url !== '#' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <a href={episode.paper_url} target="_blank" rel="noopener noreferrer">
                        View Paper
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
