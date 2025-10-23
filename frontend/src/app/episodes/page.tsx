"use client";

import { useEffect, useState } from "react";
import { getEpisodes, Episode } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Trash2, PlayCircle, ExternalLink, Calendar, User } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://marketplace-wtvs.onrender.com";

export default function Episodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

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

  const handleDeleteClick = (episodeId: string) => {
    setSelectedEpisodeId(episodeId);
    setShowDeleteModal(true);
    setAdminPassword("");
  };

  const handleDeleteConfirm = async () => {
    if (!adminPassword) {
      toast.error("Please enter admin password");
      return;
    }

    if (!selectedEpisodeId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/episodes/${selectedEpisodeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_password: adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Invalid admin password");
        } else {
          toast.error(data.detail || "Failed to delete episode");
        }
        return;
      }

      toast.success("Episode deleted successfully");

      // Remove from local state
      setEpisodes(episodes.filter(ep => ep.podcast_id !== selectedEpisodeId));

      // Close modal
      setShowDeleteModal(false);
      setSelectedEpisodeId(null);
      setAdminPassword("");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalClose = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setSelectedEpisodeId(null);
      setAdminPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white pt-24 md:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
            All Episodes
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Listen to expert-curated research podcasts across all topics
          </p>
          {!isLoading && !error && (
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm border border-gray-200">
              <PlayCircle className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-gray-900">{episodes.length} Episodes Available</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xl text-gray-600">Loading episodes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-xl text-red-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && episodes.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
            <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No episodes available yet.</p>
            <p className="text-gray-500 mt-2">Check back soon for new content!</p>
          </div>
        )}

        {/* Episodes List */}
        {!isLoading && !error && episodes.length > 0 && (
          <div className="space-y-6">
            {episodes.map((episode) => (
              <div
                key={episode.podcast_id}
                className="group bg-white rounded-2xl p-6 md:p-8 border-2 border-gray-100 hover:border-orange-500 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Content */}
                  <div className="flex-1 space-y-4">
                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight group-hover:text-orange-600 transition-colors">
                      {episode.paper_title}
                    </h2>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-orange-600" />
                        <span>{episode.paper_authors}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span>{formatDate(episode.sent_at)}</span>
                      </div>
                    </div>

                    {/* Audio Player */}
                    <div className="pt-2">
                      <audio
                        controls
                        className="w-full"
                        preload="metadata"
                        onPlay={() => setPlayingId(episode.podcast_id)}
                        onPause={() => setPlayingId(null)}
                        style={{
                          height: '54px',
                          borderRadius: '12px'
                        }}
                      >
                        <source src={episode.audio_url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {episode.paper_url !== 'N/A' && episode.paper_url !== '#' && (
                        <a
                          href={episode.paper_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Read the Paper
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(episode.podcast_id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete (Admin)
                      </Button>
                    </div>
                  </div>

                  {/* Right: Visual Indicator */}
                  <div className="hidden lg:flex items-center justify-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      playingId === episode.podcast_id
                        ? 'bg-gradient-to-br from-orange-500 to-red-600 animate-pulse'
                        : 'bg-gradient-to-br from-orange-100 to-red-100 group-hover:from-orange-200 group-hover:to-red-200'
                    }`}>
                      <PlayCircle className={`w-12 h-12 ${
                        playingId === episode.podcast_id ? 'text-white' : 'text-orange-600'
                      }`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 animate-in zoom-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Delete Episode</h2>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to delete this episode? This action cannot be undone and will permanently remove the episode from the database.
            </p>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-semibold text-slate-700 block">
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                disabled={isDeleting}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isDeleting) {
                    handleDeleteConfirm();
                  }
                }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={handleModalClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 h-12 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Episode"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
