"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ADMIN_PASSWORD = "podcast025";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated in session
    const authStatus = sessionStorage.getItem("adminAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      toast.success("Access granted");
    } else {
      toast.error("Incorrect password");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
    setPassword("");
    toast.success("Logged out");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Enter the password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                autoFocus
              />
              <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-32 pb-20 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Manage podcasts and users</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-600"
          >
            Logout
          </Button>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [latestPodcastId, setLatestPodcastId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <StatsSection />
      <UsersSection selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
      <PodcastGenerationSection
        selectedUsers={selectedUsers}
        onPodcastGenerated={setLatestPodcastId}
      />
      {latestPodcastId && selectedUsers.size > 0 && (
        <SendPodcastSection
          podcastId={latestPodcastId}
          selectedUsers={selectedUsers}
          onSent={() => setLatestPodcastId(null)}
        />
      )}
    </div>
  );
}

interface Stats {
  total_subscribers: number;
  total_podcasts: number;
  last_podcast_date: string | null;
}

function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("https://four0k-arr-saas.onrender.com/api/admin/stats");
        const data = await response.json();
        setStats(data);
      } catch {
        toast.error("Failed to load stats");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardDescription>Total Subscribers</CardDescription>
          <CardTitle className="text-3xl">{stats?.total_subscribers || 0}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total Podcasts</CardDescription>
          <CardTitle className="text-3xl">{stats?.total_podcasts || 0}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Last Sent</CardDescription>
          <CardTitle className="text-lg">
            {stats?.last_podcast_date
              ? new Date(stats.last_podcast_date).toLocaleDateString()
              : "Never"}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

interface User {
  email: string;
  name?: string;
  subscribed: boolean;
  signup_timestamp: number;
}

function UsersSection({
  selectedUsers,
  setSelectedUsers,
}: {
  selectedUsers: Set<string>;
  setSelectedUsers: (users: Set<string>) => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("https://four0k-arr-saas.onrender.com/api/admin/users");
        const data = await response.json();
        setUsers(data.users || []);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const toggleUser = (email: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.email)));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              {selectedUsers.size > 0
                ? `${selectedUsers.size} user(s) selected`
                : "Select users to send podcasts to"}
            </CardDescription>
          </div>
          {users.length > 0 && (
            <Button
              variant="outline"
              onClick={toggleAll}
              size="sm"
            >
              {selectedUsers.size === users.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">No users found</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.email}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleUser(user.email)}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.email)}
                    onChange={() => toggleUser(user.email)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.email}</p>
                    {user.name && (
                      <p className="text-xs text-gray-500">{user.name}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.subscribed ? (
                      <span className="text-green-600">Subscribed</span>
                    ) : (
                      <span className="text-gray-400">Unsubscribed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PodcastGenerationSection({
  selectedUsers,
  onPodcastGenerated,
}: {
  selectedUsers: Set<string>;
  onPodcastGenerated: (podcastId: string) => void;
}) {
  const [arxivUrl, setArxivUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!arxivUrl) {
      toast.error("Please enter an arXiv URL");
      return;
    }

    setIsGenerating(true);

    try {
      // Step 1: Fetch paper
      toast.info("Fetching paper...");
      const fetchResponse = await fetch("https://four0k-arr-saas.onrender.com/api/admin/fetch-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arxiv_url: arxivUrl }),
      });

      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch paper");
      }

      const paperData = await fetchResponse.json();
      toast.success("Paper fetched successfully");

      // Step 2: Generate podcast
      toast.info("Generating podcast (this may take a few minutes)...");
      const formData = new FormData();
      formData.append("paper_id", paperData.paper_id);
      formData.append("use_full_text", "false");
      formData.append("voice_preset", "default");

      const podcastResponse = await fetch("https://four0k-arr-saas.onrender.com/api/admin/generate-podcast", {
        method: "POST",
        body: formData,
      });

      if (!podcastResponse.ok) {
        throw new Error("Failed to generate podcast");
      }

      const podcastData = await podcastResponse.json();
      toast.success("Podcast generated successfully!");
      onPodcastGenerated(podcastData.podcast_id);
      setArxivUrl("");

    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate podcast");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Podcast</CardTitle>
        <CardDescription>
          {selectedUsers.size > 0
            ? `Selected ${selectedUsers.size} user(s). Generate podcast to send to them.`
            : "Enter an arXiv URL to create a new podcast"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="url"
          placeholder="https://arxiv.org/abs/2401.12345"
          value={arxivUrl}
          onChange={(e) => setArxivUrl(e.target.value)}
          disabled={isGenerating}
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !arxivUrl}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        >
          {isGenerating ? "Generating..." : "Generate Podcast"}
        </Button>
      </CardContent>
    </Card>
  );
}

function SendPodcastSection({
  podcastId,
  selectedUsers,
  onSent,
}: {
  podcastId: string;
  selectedUsers: Set<string>;
  onSent: () => void;
}) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (selectedUsers.size === 0) {
      toast.error("No users selected");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("https://four0k-arr-saas.onrender.com/api/admin/send-podcast-to-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          podcast_id: podcastId,
          recipient_emails: Array.from(selectedUsers),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send podcast");
      }

      const data = await response.json();
      toast.success(`Podcast sent to ${data.sent} user(s)!`);
      onSent();

    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send podcast");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800">Podcast Ready to Send</CardTitle>
        <CardDescription className="text-green-700">
          Send this podcast to {selectedUsers.size} selected user(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleSend}
          disabled={isSending}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isSending ? "Sending..." : `Send to ${selectedUsers.size} User(s)`}
        </Button>
      </CardContent>
    </Card>
  );
}
