"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ADMIN_PASSWORD = "podcast025";
const API_URL = "https://four0k-arr-saas.onrender.com";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  const [currentPodcastId, setCurrentPodcastId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <StatsSection />
      <AddPaperSection />
      <GenerateTranscriptSection />
      <ConvertToAudioSection />
      <UserManagementSection
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        currentPodcastId={currentPodcastId}
      />
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
        const response = await fetch(`${API_URL}/api/admin/stats`);
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

function AddPaperSection() {
  const [activeTab, setActiveTab] = useState<"arxiv" | "upload" | "text">("arxiv");

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Add Paper</CardTitle>
        <CardDescription>Fetch from arXiv, upload PDF, or paste text</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 border-b">
          <Button
            variant="ghost"
            className={activeTab === "arxiv" ? "border-b-2 border-orange-600 text-orange-600 rounded-none" : "rounded-none"}
            onClick={() => setActiveTab("arxiv")}
          >
            From arXiv
          </Button>
          <Button
            variant="ghost"
            className={activeTab === "upload" ? "border-b-2 border-orange-600 text-orange-600 rounded-none" : "rounded-none"}
            onClick={() => setActiveTab("upload")}
          >
            Upload PDF
          </Button>
          <Button
            variant="ghost"
            className={activeTab === "text" ? "border-b-2 border-orange-600 text-orange-600 rounded-none" : "rounded-none"}
            onClick={() => setActiveTab("text")}
          >
            From Text
          </Button>
        </div>

        {activeTab === "arxiv" && <ArxivTab />}
        {activeTab === "upload" && <UploadTab />}
        {activeTab === "text" && <TextTab />}
      </CardContent>
    </Card>
  );
}

function ArxivTab() {
  return <div className="space-y-4">
    <Input type="url" placeholder="https://arxiv.org/abs/2401.12345" />
    <div className="flex items-center gap-2">
      <input type="checkbox" id="extractFull" className="w-4 h-4" />
      <label htmlFor="extractFull" className="text-sm">
        Extract full PDF text (7-10 min podcast instead of 5-7 min)
      </label>
    </div>
    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
      Fetch Paper
    </Button>
  </div>;
}

function UploadTab() {
  return <div className="space-y-4">
    <p className="text-sm text-gray-600">Upload a PDF and we'll automatically extract the text</p>
    <Input type="url" placeholder="Paper URL (required)" />
    <Input type="file" accept=".pdf" />
    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
      Upload PDF
    </Button>
  </div>;
}

function TextTab() {
  return <div className="space-y-4">
    <p className="text-sm text-gray-600">Paste any text to generate a podcast transcript</p>
    <Input type="text" placeholder="Podcast Title" />
    <Textarea placeholder="Paste your text here... (minimum 100 characters)" rows={10} />
    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
      Generate from Text
    </Button>
  </div>;
}

function GenerateTranscriptSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Generate Transcript</CardTitle>
        <CardDescription>Configure personas, technical level, and topics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">Paper ID: <span className="font-mono">-</span></p>

        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold">Podcast Personas</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Host Persona</label>
            <select className="w-full p-2 border rounded-md">
              <option>Curious Tech Journalist</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expert Persona</label>
            <select className="w-full p-2 border rounded-md">
              <option>Academic Researcher</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Technical Level</label>
          <select className="w-full p-2 border rounded-md">
            <option value="baby">👶 Explain to a Child (5 year old)</option>
            <option value="highschool">🎒 High School Level</option>
            <option value="undergrad" selected>🎓 Undergraduate Level</option>
            <option value="graduate">👨‍🎓 Graduate/Professional</option>
            <option value="expert">🔬 Expert Researcher</option>
            <option value="nobel">🏆 Nobel Laureate Level</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Topics (Optional)</label>
          <Textarea placeholder="Enter specific areas to cover..." rows={4} />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="useFullText" className="w-4 h-4" />
          <label htmlFor="useFullText" className="text-sm">
            Use full PDF text (7-10 min script)
          </label>
        </div>

        <Button disabled className="w-full bg-gradient-to-r from-orange-600 to-red-600">
          Generate Transcript
        </Button>
      </CardContent>
    </Card>
  );
}

function ConvertToAudioSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Convert to Audio</CardTitle>
        <CardDescription>Select voices and generate podcast audio</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">Paper ID: <span className="font-mono">-</span></p>

        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold">Custom Voice Selection</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Host Voice</label>
            <div className="flex gap-2">
              <select className="flex-1 p-2 border rounded-md">
                <option>Rachel - Warm, curious, engaging</option>
              </select>
              <Button variant="outline">▶️ Preview</Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expert Voice</label>
            <div className="flex gap-2">
              <select className="flex-1 p-2 border rounded-md">
                <option>Adam - Knowledgeable, calm, clear</option>
              </select>
              <Button variant="outline">▶️ Preview</Button>
            </div>
          </div>
        </div>

        <Button disabled className="w-full bg-gradient-to-r from-orange-600 to-red-600">
          Convert to Audio
        </Button>
      </CardContent>
    </Card>
  );
}

interface User {
  email: string;
  name?: string;
  subscribed: boolean;
  signup_timestamp: number;
}

function UserManagementSection({
  selectedUsers,
  setSelectedUsers,
  currentPodcastId,
}: {
  selectedUsers: Set<string>;
  setSelectedUsers: (users: Set<string>) => void;
  currentPodcastId: string | null;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(`${API_URL}/api/admin/users`);
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
      setSelectedUsers(new Set(users.map((u) => u.email)));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>4. Send to Subscribers</CardTitle>
            <CardDescription>
              {selectedUsers.size > 0
                ? `${selectedUsers.size} user(s) selected`
                : "Select users to send podcasts to"}
            </CardDescription>
          </div>
          {users.length > 0 && (
            <Button variant="outline" onClick={toggleAll} size="sm">
              {selectedUsers.size === users.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-gray-600">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">No users found</p>
        ) : (
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <div className="space-y-2 p-4">
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
                    {user.name && <p className="text-xs text-gray-500">{user.name}</p>}
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

        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1" disabled>
            Send Test
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={selectedUsers.size === 0}
          >
            Send to Selected ({selectedUsers.size})
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            disabled
          >
            Send to ALL
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
