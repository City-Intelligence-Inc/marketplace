"use client";

import { useEffect, useState } from "react";
import { getEpisodes, Episode } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Trash2, Play, ExternalLink, MoreVertical } from "lucide-react";
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
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
      setEpisodes(episodes.filter(ep => ep.podcast_id !== selectedEpisodeId));
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
    <div className="min-h-screen bg-[#0f0f0f] pt-20 pb-12">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header - YouTube Style */}
        <div className="mb-8 pb-4 border-b border-gray-800">
          <h1 className="text-2xl font-semibold text-white mb-2">
            All Episodes
          </h1>
          <p className="text-sm text-gray-400">
            {!isLoading && !error && `${episodes.length} episodes`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 rounded-xl aspect-video mb-3"></div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-gray-800 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && episodes.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No episodes available yet.</p>
            <p className="text-gray-500 text-sm mt-2">Check back soon for new content!</p>
          </div>
        )}

        {/* Episodes Grid - YouTube Style */}
        {!isLoading && !error && episodes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {episodes.map((episode, index) => (
              <div
                key={episode.podcast_id}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredId(episode.podcast_id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Thumbnail */}
                <div className="relative mb-3 rounded-xl overflow-hidden bg-gradient-to-br aspect-video">
                  <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)} opacity-90`}></div>

                  {/* Title Overlay on Thumbnail */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
                      {episode.paper_title}
                    </h3>
                  </div>

                  {/* Play Button Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200 ${
                    hoveredId === episode.podcast_id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                      <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                    </div>
                  </div>

                  {/* Duration Badge (if available) */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                    10:00
                  </div>
                </div>

                {/* Episode Info - YouTube Style */}
                <div className="flex gap-3">
                  {/* Channel Avatar/Icon */}
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    RC
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="text-white text-sm font-medium leading-snug line-clamp-2 mb-1 group-hover:text-gray-200">
                      {episode.paper_title}
                    </h3>

                    {/* Channel Name */}
                    <p className="text-gray-400 text-xs mb-0.5">
                      Research Club
                    </p>

                    {/* Authors & Date */}
                    <div className="text-gray-400 text-xs">
                      <p className="line-clamp-1">{episode.paper_authors}</p>
                      <p>{formatDate(episode.sent_at)}</p>
                    </div>
                  </div>

                  {/* Three Dots Menu */}
                  <button
                    className="w-6 h-6 text-gray-400 hover:text-white flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(episode.podcast_id);
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Hidden Audio Player */}
                <audio id={`audio-${episode.podcast_id}`} className="hidden">
                  <source src={episode.audio_url} type="audio/mpeg" />
                </audio>
              </div>
            ))}
          </div>
        )}

        {/* Action Bar - YouTube Style */}
        {!isLoading && !error && episodes.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-wrap gap-3">
              <a
                href="/"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm font-medium transition-colors"
              >
                Back to Home
              </a>
              <a
                href="/admin"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full text-sm font-medium transition-colors"
              >
                Admin Panel
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal - Dark Theme */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#282828] rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-white">Delete Episode</h2>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Are you sure you want to delete this episode? This action cannot be undone.
            </p>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium text-gray-300 block">
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2.5 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isDeleting}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isDeleting) {
                    handleDeleteConfirm();
                  }
                }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleModalClose}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-[#3f3f3f] hover:bg-[#4f4f4f] text-white rounded-full font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
