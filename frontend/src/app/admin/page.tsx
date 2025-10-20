"use client";

/**
 * COMPLETE ADMIN DASHBOARD
 * This is the full working version - rename to page.tsx to use
 *
 * Workflow:
 * 1. Add Paper -> Shows editable preview (title, authors, abstract)
 * 2. Generate Transcript -> Loads personas/levels, generates, allows editing
 * 3. Convert to Audio -> Loads voices with preview, generates audio
 * 4. Send -> Select users and send podcast
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ADMIN_PASSWORD = "podcast025";
const API_URL = "https://four0k-arr-saas.onrender.com";

// Types
interface PaperData {
  paper_id: string;
  title: string;
  authors: string[];
  abstract: string;
  pdf_url: string;
  full_text?: string;
}

interface Persona {
  key: string;
  name: string;
  role: string;
  personality: string;
  voice_suggestions: string[];
}

interface Voice {
  key: string;
  name: string;
  description: string;
}

interface Stats {
  total_subscribers: number;
  total_podcasts: number;
  last_podcast_date: string | null;
}

interface User {
  email: string;
  name?: string;
  subscribed: boolean;
  signup_timestamp: number;
}

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
                autoFocus
              />
              <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-red-600">
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
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}

function AdminDashboard() {
  // Global state shared across all steps
  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [transcript, setTranscript] = useState("");
  const [podcastId, setPodcastId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-6">
      <StatsSection />

      <Step1AddPaper
        paperData={paperData}
        setPaperData={setPaperData}
        setTranscript={setTranscript}
      />

      <Step2GenerateTranscript
        paperData={paperData}
        transcript={transcript}
        setTranscript={setTranscript}
      />

      <Step3ConvertToAudio
        paperData={paperData}
        transcript={transcript}
        setPodcastId={setPodcastId}
        setAudioUrl={setAudioUrl}
      />

      <Step4SendToUsers
        podcastId={podcastId}
        audioUrl={audioUrl}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />
    </div>
  );
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

  if (isLoading) return null;

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

// STEP 1: Add Paper
function Step1AddPaper({
  paperData,
  setPaperData,
  setTranscript
}: {
  paperData: PaperData | null;
  setPaperData: (data: PaperData | null) => void;
  setTranscript: (transcript: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"arxiv" | "upload" | "text">("arxiv");
  const [isLoading, setIsLoading] = useState(false);

  // For arXiv
  const [arxivUrl, setArxivUrl] = useState("");
  const [extractFull, setExtractFull] = useState(false);

  // For upload
  const [paperUrl, setPaperUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // For text
  const [textTitle, setTextTitle] = useState("");
  const [customText, setCustomText] = useState("");

  // Editable fields
  const [editTitle, setEditTitle] = useState("");
  const [editAuthors, setEditAuthors] = useState("");
  const [editAbstract, setEditAbstract] = useState("");

  useEffect(() => {
    if (paperData) {
      setEditTitle(paperData.title);
      setEditAuthors(Array.isArray(paperData.authors) ? paperData.authors.join(", ") : paperData.authors);
      setEditAbstract(paperData.abstract);
    }
  }, [paperData]);

  const handleFetchArxiv = async () => {
    if (!arxivUrl) {
      toast.error("Please enter an arXiv URL");
      return;
    }

    setIsLoading(true);
    toast.info("Fetching paper...");

    try {
      const endpoint = extractFull
        ? `${API_URL}/api/admin/extract-pdf-from-arxiv`
        : `${API_URL}/api/admin/fetch-paper`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arxiv_url: arxivUrl }),
      });

      if (!response.ok) throw new Error("Failed to fetch paper");

      const data = await response.json();
      setPaperData(data);
      toast.success(extractFull ? "Paper fetched with full text!" : "Paper fetched!");
    } catch (error) {
      toast.error("Failed to fetch paper");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadPDF = async () => {
    if (!paperUrl || !pdfFile) {
      toast.error("Please provide paper URL and PDF file");
      return;
    }

    setIsLoading(true);
    toast.info("Uploading PDF and extracting text...");

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("paper_url", paperUrl);

      console.log("Uploading PDF:", pdfFile.name, "URL:", paperUrl);

      const response = await fetch(`${API_URL}/api/admin/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error:", errorText);
        let errorMsg = "Failed to upload PDF";
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.detail || errorMsg;
        } catch (e) {
          errorMsg = errorText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log("Received paper data:", data);

      // Ensure authors is an array
      if (typeof data.authors === 'string') {
        data.authors = [data.authors];
      }

      setPaperData(data);
      setPaperUrl("");
      setPdfFile(null);
      toast.success("PDF uploaded and text extracted!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload PDF";
      toast.error(errorMessage);
      console.error("Upload PDF error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromText = async () => {
    if (!customText || customText.length < 100) {
      toast.error("Please provide at least 100 characters of text");
      return;
    }

    setIsLoading(true);
    toast.info("Generating from text...");

    try {
      const formData = new FormData();
      formData.append("text", customText);
      formData.append("title", textTitle || "Custom Content");

      const response = await fetch(`${API_URL}/api/admin/generate-from-text`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to generate from text");

      const data = await response.json();

      // Create paper data structure
      const newPaperData: PaperData = {
        paper_id: data.paper_id,
        title: data.title,
        authors: ["Custom Text"],
        abstract: customText.substring(0, 500) + (customText.length > 500 ? "..." : ""),
        pdf_url: "N/A",
      };

      setPaperData(newPaperData);
      setTranscript(data.transcript); // Auto-set transcript for text input
      setCustomText("");
      setTextTitle("");
      toast.success("Transcript generated from text!");
    } catch (error) {
      toast.error("Failed to generate from text");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEdits = () => {
    if (paperData) {
      const updatedData: PaperData = {
        ...paperData,
        title: editTitle,
        authors: editAuthors.split(",").map(a => a.trim()),
        abstract: editAbstract,
      };
      setPaperData(updatedData);
      toast.success("Paper metadata updated");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Add Paper</CardTitle>
        <CardDescription>Fetch from arXiv, upload PDF, or paste text</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant="ghost"
            className={activeTab === "arxiv" ? "border-b-2 border-orange-600 rounded-none" : "rounded-none"}
            onClick={() => setActiveTab("arxiv")}
          >
            From arXiv
          </Button>
          <Button
            variant="ghost"
            className={activeTab === "upload" ? "border-b-2 border-orange-600 rounded-none" : "rounded-none"}
            onClick={() => setActiveTab("upload")}
          >
            Upload PDF
          </Button>
          <Button
            variant="ghost"
            className={activeTab === "text" ? "border-b-2 border-orange-600 rounded-none" : "rounded-none"}
            onClick={() => setActiveTab("text")}
          >
            From Text
          </Button>
        </div>

        {/* arXiv Tab */}
        {activeTab === "arxiv" && (
          <div className="space-y-4">
            <Input
              type="url"
              placeholder="https://arxiv.org/abs/2401.12345"
              value={arxivUrl}
              onChange={(e) => setArxivUrl(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="extractFull"
                checked={extractFull}
                onChange={(e) => setExtractFull(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="extractFull" className="text-sm">
                Extract full PDF text (7-10 min podcast)
              </label>
            </div>
            <Button
              onClick={handleFetchArxiv}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600"
            >
              {isLoading ? "Fetching..." : "Fetch Paper"}
            </Button>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After uploading, you can edit the extracted title, authors, and abstract below to fix any parsing errors.
              </p>
            </div>
            <Input
              type="url"
              placeholder="Paper URL (e.g., https://arxiv.org/abs/2401.12345)"
              value={paperUrl}
              onChange={(e) => setPaperUrl(e.target.value)}
              disabled={isLoading}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Select PDF File:</label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                disabled={isLoading}
              />
              {pdfFile && (
                <p className="text-xs text-green-600">
                  Selected: {pdfFile.name}
                </p>
              )}
            </div>
            <Button
              onClick={handleUploadPDF}
              disabled={isLoading || !paperUrl || !pdfFile}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600"
            >
              {isLoading ? "Uploading & Extracting..." : "Upload PDF"}
            </Button>
          </div>
        )}

        {/* Text Tab */}
        {activeTab === "text" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Paste any text to generate a podcast transcript</p>
            <Input
              type="text"
              placeholder="Podcast Title"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              disabled={isLoading}
            />
            <Textarea
              placeholder="Paste your text here... (minimum 100 characters)"
              rows={10}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              disabled={isLoading}
            />
            <Button
              onClick={handleGenerateFromText}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600"
            >
              {isLoading ? "Generating..." : "Generate from Text"}
            </Button>
          </div>
        )}

        {/* Paper Preview (Editable) */}
        {paperData && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-green-800 text-lg">✓ Paper Loaded Successfully</h3>
              <span className="text-xs text-green-700 font-mono bg-green-100 px-2 py-1 rounded">
                ID: {paperData.paper_id}
              </span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <p className="text-sm text-amber-800">
                <strong>Fix Parsing Errors:</strong> Review and edit the fields below. Common issues include incorrect author names or formatting.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Title:</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-white border-2"
                placeholder="Enter paper title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Authors: <span className="text-xs font-normal text-gray-500">(comma-separated)</span>
              </label>
              <Input
                value={editAuthors}
                onChange={(e) => setEditAuthors(e.target.value)}
                className="bg-white border-2"
                placeholder="e.g., John Doe, Jane Smith, Bob Johnson"
              />
              <p className="text-xs text-gray-500">
                Tip: Separate multiple authors with commas
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Abstract:</label>
              <Textarea
                value={editAbstract}
                onChange={(e) => setEditAbstract(e.target.value)}
                rows={5}
                className="bg-white border-2"
                placeholder="Enter paper abstract"
              />
            </div>

            <Button
              onClick={saveEdits}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              Save Changes & Continue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// STEP 2: Generate Transcript
function Step2GenerateTranscript({
  paperData,
  transcript,
  setTranscript,
}: {
  paperData: PaperData | null;
  transcript: string;
  setTranscript: (transcript: string) => void;
}) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [hostPersona, setHostPersona] = useState("curious_journalist");
  const [expertPersona, setExpertPersona] = useState("academic_expert");
  const [technicalLevel, setTechnicalLevel] = useState("undergrad");
  const [customTopics, setCustomTopics] = useState("");
  const [useFullText, setUseFullText] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadPersonas() {
      try {
        const response = await fetch(`${API_URL}/api/admin/personas`);
        const data = await response.json();
        setPersonas(data.personas || []);
      } catch (error) {
        console.error("Failed to load personas:", error);
      }
    }
    loadPersonas();
  }, []);

  const handleGenerateTranscript = async () => {
    if (!paperData) {
      toast.error("Please add a paper first");
      return;
    }

    setIsLoading(true);
    toast.info("Generating transcript (this may take a few minutes)...");

    try {
      const formData = new FormData();
      formData.append("paper_id", paperData.paper_id);
      formData.append("use_full_text", String(useFullText));
      formData.append("technical_level", technicalLevel);
      formData.append("host_persona", hostPersona);
      formData.append("expert_persona", expertPersona);
      if (customTopics) {
        formData.append("custom_topics", customTopics);
      }

      const response = await fetch(`${API_URL}/api/admin/generate-transcript`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to generate transcript");

      const data = await response.json();
      setTranscript(data.transcript);
      toast.success("Transcript generated!");
    } catch (error) {
      toast.error("Failed to generate transcript");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const hostPersonas = personas.filter(p => p.role === "Host");
  const expertPersonas = personas.filter(p => p.role === "Expert");

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Generate Transcript</CardTitle>
        <CardDescription>
          {paperData ? `Paper: ${paperData.title.substring(0, 60)}...` : "Add a paper first"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Persona Selection */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold">Podcast Personas</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Host Persona</label>
            <select
              value={hostPersona}
              onChange={(e) => setHostPersona(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={!paperData || isLoading}
            >
              {hostPersonas.map(p => (
                <option key={p.key} value={p.key}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expert Persona</label>
            <select
              value={expertPersona}
              onChange={(e) => setExpertPersona(e.target.value)}
              className="w-full p-2 border rounded-md"
              disabled={!paperData || isLoading}
            >
              {expertPersonas.map(p => (
                <option key={p.key} value={p.key}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Technical Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Technical Level</label>
          <select
            value={technicalLevel}
            onChange={(e) => setTechnicalLevel(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={!paperData || isLoading}
          >
            <option value="baby">👶 Explain to a Child</option>
            <option value="highschool">🎒 High School Level</option>
            <option value="undergrad">🎓 Undergraduate Level</option>
            <option value="graduate">👨‍🎓 Graduate/Professional</option>
            <option value="expert">🔬 Expert Researcher</option>
            <option value="nobel">🏆 Nobel Laureate Level</option>
          </select>
        </div>

        {/* Custom Topics */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Custom Topics (Optional)</label>
          <Textarea
            placeholder="Enter specific areas to cover..."
            rows={4}
            value={customTopics}
            onChange={(e) => setCustomTopics(e.target.value)}
            disabled={!paperData || isLoading}
          />
        </div>

        {/* Use Full Text */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useFullText"
            checked={useFullText}
            onChange={(e) => setUseFullText(e.target.checked)}
            className="w-4 h-4"
            disabled={!paperData || isLoading}
          />
          <label htmlFor="useFullText" className="text-sm">
            Use full PDF text (7-10 min script)
          </label>
        </div>

        <Button
          onClick={handleGenerateTranscript}
          disabled={!paperData || isLoading}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600"
        >
          {isLoading ? "Generating..." : "Generate Transcript"}
        </Button>

        {/* Transcript Display/Edit */}
        {transcript && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-blue-800">Generated Transcript</h3>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                size="sm"
              >
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>

            {isEditing ? (
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={20}
                className="bg-white font-mono text-sm"
              />
            ) : (
              <div className="max-h-96 overflow-y-auto bg-white p-4 rounded border whitespace-pre-wrap text-sm">
                {transcript}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// STEP 3: Convert to Audio
function Step3ConvertToAudio({
  paperData,
  transcript,
  setPodcastId,
  setAudioUrl,
}: {
  paperData: PaperData | null;
  transcript: string;
  setPodcastId: (id: string) => void;
  setAudioUrl: (url: string) => void;
}) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [hostVoice, setHostVoice] = useState("rachel");
  const [expertVoice, setExpertVoice] = useState("adam");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState("");
  const [currentPodcastId, setCurrentPodcastId] = useState("");

  useEffect(() => {
    async function loadVoices() {
      try {
        const response = await fetch(`${API_URL}/api/admin/individual-voices`);
        const data = await response.json();
        setVoices(data.voices || []);
      } catch (error) {
        console.error("Failed to load voices:", error);
      }
    }
    loadVoices();
  }, []);

  const handlePreviewVoice = async (voiceKey: string, role: "host" | "expert") => {
    try {
      const response = await fetch(`${API_URL}/api/admin/voice-preview/${voiceKey}?role=${role}`);
      if (!response.ok) {
        toast.error("Failed to load voice preview");
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (error) {
      toast.error("Error playing voice preview");
      console.error(error);
    }
  };

  const handleConvertToAudio = async () => {
    if (!paperData || !transcript) {
      toast.error("Please generate a transcript first");
      return;
    }

    setIsLoading(true);
    toast.info("Converting to audio (this will take several minutes)...");

    try {
      const formData = new FormData();
      formData.append("paper_id", paperData.paper_id);
      formData.append("transcript", transcript);
      formData.append("host_voice_key", hostVoice);
      formData.append("expert_voice_key", expertVoice);
      formData.append("edited_title", paperData.title);
      formData.append("edited_authors", Array.isArray(paperData.authors) ? paperData.authors.join(", ") : paperData.authors);
      formData.append("edited_abstract", paperData.abstract);

      const response = await fetch(`${API_URL}/api/admin/convert-to-audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to convert to audio");

      const data = await response.json();
      setGeneratedAudioUrl(data.audio_url);
      setCurrentPodcastId(data.podcast_id);
      setPodcastId(data.podcast_id);
      setAudioUrl(data.audio_url);
      toast.success("Podcast audio generated!");
    } catch (error) {
      toast.error("Failed to convert to audio");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Convert to Audio</CardTitle>
        <CardDescription>Select voices and generate podcast audio</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold">Custom Voice Selection</h3>

          {/* Host Voice */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Host Voice</label>
            <div className="flex gap-2">
              <select
                value={hostVoice}
                onChange={(e) => setHostVoice(e.target.value)}
                className="flex-1 p-2 border rounded-md"
                disabled={!transcript || isLoading}
              >
                {voices.map(v => (
                  <option key={v.key} value={v.key}>{v.name} - {v.description}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => handlePreviewVoice(hostVoice, "host")}
                disabled={!transcript || isLoading}
              >
                ▶️ Preview
              </Button>
            </div>
          </div>

          {/* Expert Voice */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Expert Voice</label>
            <div className="flex gap-2">
              <select
                value={expertVoice}
                onChange={(e) => setExpertVoice(e.target.value)}
                className="flex-1 p-2 border rounded-md"
                disabled={!transcript || isLoading}
              >
                {voices.map(v => (
                  <option key={v.key} value={v.key}>{v.name} - {v.description}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => handlePreviewVoice(expertVoice, "expert")}
                disabled={!transcript || isLoading}
              >
                ▶️ Preview
              </Button>
            </div>
          </div>
        </div>

        <Button
          onClick={handleConvertToAudio}
          disabled={!transcript || isLoading}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600"
        >
          {isLoading ? "Converting..." : "Convert to Audio"}
        </Button>

        {/* Audio Player */}
        {generatedAudioUrl && (
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
            <h3 className="font-semibold text-purple-800">Podcast Generated!</h3>
            <audio controls className="w-full">
              <source src={generatedAudioUrl} type="audio/mpeg" />
            </audio>
            <p className="text-xs text-purple-700">
              Podcast ID: <span className="font-mono">{currentPodcastId}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// STEP 4: Send to Users
function Step4SendToUsers({
  podcastId,
  audioUrl,
  selectedUsers,
  setSelectedUsers,
}: {
  podcastId: string | null;
  audioUrl: string | null;
  selectedUsers: Set<string>;
  setSelectedUsers: (users: Set<string>) => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

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
      setSelectedUsers(new Set(users.map(u => u.email)));
    }
  };

  const handleSendToSelected = async () => {
    if (!podcastId || selectedUsers.size === 0) return;

    if (!confirm(`Send podcast to ${selectedUsers.size} selected user(s)?`)) return;

    setIsSending(true);
    toast.info(`Sending to ${selectedUsers.size} users...`);

    try {
      const response = await fetch(`${API_URL}/api/admin/send-podcast-to-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          podcast_id: podcastId,
          recipient_emails: Array.from(selectedUsers),
        }),
      });

      if (!response.ok) throw new Error("Failed to send");

      const data = await response.json();
      toast.success(`Sent to ${data.sent} user(s)!`);
      setSelectedUsers(new Set()); // Clear selection
    } catch (error) {
      toast.error("Failed to send podcast");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendToAll = async () => {
    if (!podcastId) return;

    if (!confirm("Send podcast to ALL subscribers?")) return;

    setIsSending(true);
    toast.info("Sending to all subscribers...");

    try {
      const response = await fetch(`${API_URL}/api/admin/send-podcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ podcast_id: podcastId }),
      });

      if (!response.ok) throw new Error("Failed to send");

      const data = await response.json();
      toast.success(`Sent to ${data.sent} user(s)!`);
    } catch (error) {
      toast.error("Failed to send podcast");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>4. Send to Subscribers</CardTitle>
            <CardDescription>
              {podcastId ? `Ready to send! ${selectedUsers.size} user(s) selected` : "Generate a podcast first"}
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
        {audioUrl && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}

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
                  <div className="text-xs">
                    {user.subscribed ? (
                      <span className="text-green-600">✓ Subscribed</span>
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
          <Button
            onClick={handleSendToSelected}
            disabled={!podcastId || selectedUsers.size === 0 || isSending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isSending ? "Sending..." : `Send to Selected (${selectedUsers.size})`}
          </Button>
          <Button
            onClick={handleSendToAll}
            disabled={!podcastId || isSending}
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600"
          >
            Send to ALL
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
