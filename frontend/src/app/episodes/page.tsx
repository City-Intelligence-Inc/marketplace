"use client";

import { useEffect, useState } from "react";
import { getEpisodes, Episode } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
                  <div className="flex gap-2">
                    {episode.paper_url !== 'N/A' && episode.paper_url !== '#' && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <a href={episode.paper_url} target="_blank" rel="noopener noreferrer">
                          View Paper
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(episode.podcast_id)}
                      title="Delete episode (admin only)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Delete Episode</h2>
            <p className="text-slate-600">
              Are you sure you want to delete this episode? This action cannot be undone.
            </p>

            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium text-slate-700">
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isDeleting}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isDeleting) {
                    handleDeleteConfirm();
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleModalClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
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
