"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, ArrowLeft, Upload, FileText, Mic, Send, BarChart3, LogOut, Mail, Eye, TestTube } from "lucide-react";
import { AudioEditor } from "@/components/AudioEditor";
import { DatabaseManager } from "@/components/DatabaseManager";

const ADMIN_PASSWORD = "podcast025";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://marketplace-wtvs.onrender.com";

// Types
interface PaperData {
  paper_id: string;
  title: string;
  authors: string[];
  abstract: string;
  pdf_url: string;
  full_text?: string;
  ocr_details?: {
    total_pages: number;
    total_chars: number;
    pages: Array<{
      page_number: number;
      text: string;
      char_count: number;
      line_count: number;
    }>;
  };
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

interface Step {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
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
      toast.success("Welcome back!");
    } else {
      toast.error("Incorrect password");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
    toast.success("Logged out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="space-y-3 pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-center">Admin Portal</CardTitle>
            <CardDescription className="text-center text-base">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base"
                autoFocus
              />
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-base font-medium"
              >
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Manage your podcast creation workflow</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"workflow" | "custom" | "templates" | "database">("workflow");
  const [currentStep, setCurrentStep] = useState(0);
  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [transcript, setTranscript] = useState("");
  const [podcastId, setPodcastId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [targetWords, setTargetWords] = useState(0); // 0 = no shortening

  const steps = [
    { title: "Upload Paper", icon: Upload, description: "Add research paper or text" },
    { title: "Generate Script", icon: FileText, description: "Create podcast transcript" },
    { title: "Create Audio", icon: Mic, description: "Convert to speech" },
    { title: "Distribute", icon: Send, description: "Send to subscribers" },
  ];

  const canGoNext = () => {
    if (currentStep === 0) return paperData !== null;
    if (currentStep === 1) return transcript !== "";
    if (currentStep === 2) return podcastId !== null && audioUrl !== null;
    return false;
  };

  return (
    <div className="space-y-8">
      <StatsSection />

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("workflow")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeTab === "workflow"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload className="w-5 h-5" />
            Quick Workflow
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeTab === "custom"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mic className="w-5 h-5" />
            Custom Workflow
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeTab === "templates"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mail className="w-5 h-5" />
            Email Templates
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
              activeTab === "database"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Database
          </button>
        </div>
      </div>

      {activeTab === "workflow" ? (
        <WorkflowTab
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          steps={steps}
          canGoNext={canGoNext}
          paperData={paperData}
          setPaperData={setPaperData}
          transcript={transcript}
          setTranscript={setTranscript}
          podcastId={podcastId}
          setPodcastId={setPodcastId}
          audioUrl={audioUrl}
          setAudioUrl={setAudioUrl}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          targetWords={targetWords}
          setTargetWords={setTargetWords}
        />
      ) : activeTab === "custom" ? (
        <CustomWorkflowTab />
      ) : activeTab === "templates" ? (
        <EmailTemplatesTab />
      ) : (
        <DatabaseManager />
      )}
    </div>
  );
}

function WorkflowTab({
  currentStep,
  setCurrentStep,
  steps,
  canGoNext,
  paperData,
  setPaperData,
  transcript,
  setTranscript,
  podcastId,
  setPodcastId,
  audioUrl,
  setAudioUrl,
  selectedUsers,
  setSelectedUsers,
  targetWords,
  setTargetWords,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: Step[];
  canGoNext: () => boolean;
  paperData: PaperData | null;
  setPaperData: (data: PaperData | null) => void;
  transcript: string;
  setTranscript: (transcript: string) => void;
  podcastId: string | null;
  setPodcastId: (id: string | null) => void;
  audioUrl: string | null;
  setAudioUrl: (url: string | null) => void;
  selectedUsers: Set<string>;
  setSelectedUsers: (users: Set<string>) => void;
  targetWords: number;
  setTargetWords: (value: number) => void;
}) {
  return (
    <div className="space-y-8">

      {/* Progress Stepper */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300
                      ${isCompleted ? "bg-green-500 text-white" : ""}
                      ${isCurrent ? "bg-gradient-to-br from-orange-500 to-red-500 text-white ring-4 ring-orange-100" : ""}
                      ${!isCompleted && !isCurrent ? "bg-slate-100 text-slate-400" : ""}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                    ) : (
                      <Icon className="w-6 h-6 md:w-8 md:h-8" />
                    )}
                  </div>
                  <div className="mt-3 text-center hidden md:block">
                    <div className={`font-semibold ${isCurrent ? "text-slate-900" : "text-slate-600"}`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">{step.description}</div>
                  </div>
                  <div className="mt-2 text-center md:hidden">
                    <div className={`text-xs font-medium ${isCurrent ? "text-slate-900" : "text-slate-600"}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {!isLast && (
                  <div className="hidden md:block flex-1 h-1 mx-4 -mt-16">
                    <div className={`h-full ${isCompleted ? "bg-green-500" : "bg-slate-200"} transition-all duration-300`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        {currentStep === 0 && (
          <Step1AddPaper
            paperData={paperData}
            setPaperData={setPaperData}
            setTranscript={setTranscript}
          />
        )}
        {currentStep === 1 && (
          <Step2GenerateTranscript
            paperData={paperData}
            transcript={transcript}
            setTranscript={setTranscript}
          />
        )}
        {currentStep === 2 && (
          <Step3ConvertToAudio
            paperData={paperData}
            transcript={transcript}
            setPodcastId={setPodcastId}
            setAudioUrl={setAudioUrl}
            targetWords={targetWords}
            setTargetWords={setTargetWords}
          />
        )}
        {currentStep === 3 && (
          <Step4SendToUsers
            podcastId={podcastId}
            audioUrl={audioUrl}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-slate-600">
          Step {currentStep + 1} of {steps.length}
        </div>

        <Button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1 || !canGoNext()}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
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
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader className="pb-3">
          <CardDescription className="text-blue-700 font-medium">Total Subscribers</CardDescription>
          <CardTitle className="text-4xl text-blue-900">{stats?.total_subscribers || 0}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader className="pb-3">
          <CardDescription className="text-purple-700 font-medium">Total Podcasts</CardDescription>
          <CardTitle className="text-4xl text-purple-900">{stats?.total_podcasts || 0}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
        <CardHeader className="pb-3">
          <CardDescription className="text-green-700 font-medium">Last Sent</CardDescription>
          <CardTitle className="text-xl text-green-900">
            {stats?.last_podcast_date
              ? new Date(stats.last_podcast_date).toLocaleDateString()
              : "Never"}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

function CustomWorkflowTab() {
  const [currentStep, setCurrentStep] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [podcastHosts, setPodcastHosts] = useState("");
  const [category, setCategory] = useState("AI");
  const [hostVoice, setHostVoice] = useState("rachel");
  const [expertVoice, setExpertVoice] = useState("adam");
  const [targetWords, setTargetWords] = useState(0); // 0 = no shortening
  const [audioUrl, setAudioUrl] = useState("");
  const [podcastId, setPodcastId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("podcast");
  const [emailPreviewHtml, setEmailPreviewHtml] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paperReferences, setPaperReferences] = useState<Array<{title: string, url: string}>>([{title: "", url: ""}]);

  useEffect(() => {
    async function loadData() {
      try {
        const [voicesRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/individual-voices`),
          fetch(`${API_URL}/api/admin/users`)
        ]);
        const voicesData = await voicesRes.json();
        const usersData = await usersRes.json();
        setVoices(voicesData.voices || []);
        setUsers(usersData.users || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }
    loadData();
  }, []);

  const handleGenerateAudio = async () => {
    if (!transcript || !podcastHosts || !category) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    toast.info("Generating audio... This may take several minutes");

    console.log("=".repeat(80));
    console.log("🎙️ CUSTOM WORKFLOW: GENERATE AUDIO");
    console.log("=".repeat(80));

    const requestBody = {
      transcript,
      podcast_hosts: podcastHosts,
      category,
      host_voice_key: hostVoice,
      expert_voice_key: expertVoice,
      target_words: targetWords,
      paper_references: paperReferences.filter(ref => ref.title && ref.url),
    };

    console.log("📤 REQUEST:");
    console.log("   URL:", `${API_URL}/api/admin/custom-workflow/generate-audio`);
    console.log("   Method: POST");
    console.log("   Body:", JSON.stringify(requestBody, null, 2));
    console.log("   Transcript length:", transcript.length, "characters");
    console.log("   Hosts:", podcastHosts);
    console.log("   Category:", category);
    console.log("   Voices:", hostVoice, "→", expertVoice);

    try {
      const startTime = Date.now();
      console.log("⏱️  Request sent at:", new Date().toISOString());

      const response = await fetch(`${API_URL}/api/admin/custom-workflow/generate-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log("📥 RESPONSE:");
      console.log("   Status:", response.status, response.statusText);
      console.log("   Duration:", duration, "seconds");
      console.log("   Headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ ERROR RESPONSE:", JSON.stringify(errorData, null, 2));
        throw new Error(errorData.detail || "Failed to generate audio");
      }

      const data = await response.json();
      console.log("✅ SUCCESS RESPONSE:", JSON.stringify(data, null, 2));
      console.log("   Podcast ID:", data.podcast_id);
      console.log("   Audio URL:", data.audio_url);
      console.log("=".repeat(80));

      setAudioUrl(data.audio_url);
      setPodcastId(data.podcast_id);
      toast.success("Audio generated successfully!");
      setCurrentStep(1);
    } catch (error) {
      console.error("❌ GENERATION FAILED:");
      console.error("   Error:", error);
      console.error("   Stack:", error instanceof Error ? error.stack : "N/A");
      console.log("=".repeat(80));
      toast.error("Failed to generate audio");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewEmail = async () => {
    if (!podcastId) {
      toast.error("Please generate audio first");
      return;
    }

    setIsLoading(true);

    console.log("=".repeat(80));
    console.log("👁️ CUSTOM WORKFLOW: PREVIEW EMAIL");
    console.log("=".repeat(80));

    const requestBody = {
      podcast_id: podcastId,
      template_type: selectedTemplate,
    };

    console.log("📤 REQUEST:");
    console.log("   URL:", `${API_URL}/api/admin/custom-workflow/preview-email`);
    console.log("   Method: POST");
    console.log("   Body:", JSON.stringify(requestBody, null, 2));
    console.log("   Podcast ID:", podcastId);
    console.log("   Template:", selectedTemplate);

    try {
      const startTime = Date.now();
      console.log("⏱️  Request sent at:", new Date().toISOString());

      const response = await fetch(`${API_URL}/api/admin/custom-workflow/preview-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log("📥 RESPONSE:");
      console.log("   Status:", response.status, response.statusText);
      console.log("   Duration:", duration, "seconds");

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ ERROR RESPONSE:", JSON.stringify(errorData, null, 2));
        throw new Error(errorData.detail || "Failed to preview email");
      }

      const data = await response.json();
      console.log("✅ SUCCESS RESPONSE:");
      console.log("   HTML length:", data.html.length, "characters");
      console.log("   Preview first 200 chars:", data.html.substring(0, 200));
      console.log("=".repeat(80));

      setEmailPreviewHtml(data.html);
      toast.success("Email preview loaded!");
      setCurrentStep(2);
    } catch (error) {
      console.error("❌ PREVIEW FAILED:");
      console.error("   Error:", error);
      console.error("   Stack:", error instanceof Error ? error.stack : "N/A");
      console.log("=".repeat(80));
      toast.error("Failed to preview email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPodcast = async () => {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    if (!confirm(`Send to ${selectedUsers.size} user(s)?`)) return;

    setIsLoading(true);
    toast.info(`Sending to ${selectedUsers.size} users...`);

    console.log("=".repeat(80));
    console.log("📧 CUSTOM WORKFLOW: SEND PODCAST");
    console.log("=".repeat(80));

    const recipientEmails = Array.from(selectedUsers);
    const requestBody = {
      podcast_id: podcastId,
      recipient_emails: recipientEmails,
      template_type: selectedTemplate,
    };

    console.log("📤 REQUEST:");
    console.log("   URL:", `${API_URL}/api/admin/custom-workflow/send-custom-podcast`);
    console.log("   Method: POST");
    console.log("   Podcast ID:", podcastId);
    console.log("   Template:", selectedTemplate);
    console.log("   Recipients:", selectedUsers.size);
    console.log("   Emails:", recipientEmails);

    try {
      const startTime = Date.now();
      console.log("⏱️  Request sent at:", new Date().toISOString());

      const response = await fetch(`${API_URL}/api/admin/custom-workflow/send-custom-podcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log("📥 RESPONSE:");
      console.log("   Status:", response.status, response.statusText);
      console.log("   Duration:", duration, "seconds");

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ ERROR RESPONSE:", JSON.stringify(errorData, null, 2));
        throw new Error(errorData.detail || "Failed to send");
      }

      const data = await response.json();
      console.log("✅ SUCCESS RESPONSE:", JSON.stringify(data, null, 2));
      console.log("   Sent:", data.sent);
      console.log("   Failed:", data.failed);
      console.log("=".repeat(80));

      toast.success(`Sent to ${data.sent} user(s)!`);
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("❌ SEND FAILED:");
      console.error("   Error:", error);
      console.error("   Stack:", error instanceof Error ? error.stack : "N/A");
      console.log("=".repeat(80));
      toast.error("Failed to send podcast");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToCustomEmail = async () => {
    if (!customEmail || !customEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!confirm(`Send podcast to ${customEmail}?`)) return;

    setIsLoading(true);
    toast.info(`Sending to ${customEmail}...`);

    console.log("=".repeat(80));
    console.log("📧 CUSTOM WORKFLOW: SEND TO CUSTOM EMAIL");
    console.log("=".repeat(80));

    const requestBody = {
      podcast_id: podcastId,
      recipient_emails: [customEmail],
      template_type: selectedTemplate,
    };

    console.log("📤 REQUEST:");
    console.log("   URL:", `${API_URL}/api/admin/custom-workflow/send-custom-podcast`);
    console.log("   Email:", customEmail);
    console.log("   Template:", selectedTemplate);

    try {
      const response = await fetch(`${API_URL}/api/admin/custom-workflow/send-custom-podcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send");
      }

      const data = await response.json();
      console.log("✅ SUCCESS:", data);
      console.log("=".repeat(80));

      toast.success(`Email sent to ${customEmail}!`);
      setCustomEmail(""); // Clear the input
    } catch (error) {
      console.error("❌ SEND FAILED:", error);
      console.log("=".repeat(80));
      toast.error("Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

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

  const categories = ["AI", "Law", "Medicine", "Climate", "Physics", "Biology", "Economics", "Other"];
  const templates = [
    { id: "welcome", name: "Welcome" },
    { id: "podcast", name: "Podcast Delivery" },
    { id: "weekly", name: "Weekly Digest" },
    { id: "custom", name: "Custom Message" },
  ];

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          {["Generate Audio", "Preview Email", "Send"].map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                    index <= currentStep
                      ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="mt-2 text-sm font-medium text-slate-700">{step}</div>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-1 ${index < currentStep ? "bg-orange-500" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Generate Audio */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 1: Generate Audio</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Transcript</label>
            <Textarea
              placeholder="Paste your podcast transcript here..."
              rows={10}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Podcast Hosts</label>
              <Input
                placeholder="e.g., Sarah Chen & Mike Wong"
                value={podcastHosts}
                onChange={(e) => setPodcastHosts(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 px-4 border border-slate-300 rounded-lg"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Paper References</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaperReferences([...paperReferences, {title: "", url: ""}])}
                className="h-8"
              >
                + Add Another Paper
              </Button>
            </div>
            <p className="text-xs text-slate-500">Add links to papers mentioned in the podcast (displayed in email)</p>
            {paperReferences.map((ref, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Paper title (e.g., 'Attention Is All You Need')"
                    value={ref.title}
                    onChange={(e) => {
                      const newRefs = [...paperReferences];
                      newRefs[index].title = e.target.value;
                      setPaperReferences(newRefs);
                    }}
                    className="h-10"
                  />
                  <Input
                    placeholder="Paper URL (e.g., https://arxiv.org/abs/...)"
                    value={ref.url}
                    onChange={(e) => {
                      const newRefs = [...paperReferences];
                      newRefs[index].url = e.target.value;
                      setPaperReferences(newRefs);
                    }}
                    className="h-10"
                  />
                </div>
                {paperReferences.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPaperReferences(paperReferences.filter((_, i) => i !== index))}
                    className="h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Host Voice</label>
              <select
                value={hostVoice}
                onChange={(e) => setHostVoice(e.target.value)}
                className="w-full h-12 px-4 border border-slate-300 rounded-lg"
              >
                {voices.map(v => (
                  <option key={v.key} value={v.key}>{v.name} - {v.description}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Expert Voice</label>
              <select
                value={expertVoice}
                onChange={(e) => setExpertVoice(e.target.value)}
                className="w-full h-12 px-4 border border-slate-300 rounded-lg"
              >
                {voices.map(v => (
                  <option key={v.key} value={v.key}>{v.name} - {v.description}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={handleGenerateAudio}
            disabled={isLoading || !transcript}
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600"
          >
            {isLoading ? "Generating Audio..." : "Generate Audio"}
          </Button>

          {audioUrl && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Audio Generated!</h3>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Podcast ID: <span className="font-mono">{podcastId}</span>
                </p>
              </div>

              <AudioEditor
                audioUrl={audioUrl}
                transcript={transcript}
                podcastId={podcastId}
                onSave={(clippedUrl, editedTranscript) => {
                  setAudioUrl(clippedUrl);
                  setTranscript(editedTranscript);
                  toast.success("Changes saved!");
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Preview Email */}
      {audioUrl && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 2: Preview Email</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Email Template</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      selectedTemplate === template.id
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handlePreviewEmail}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700"
            >
              {isLoading ? "Loading Preview..." : "Preview Email"}
            </Button>

            {emailPreviewHtml && (
              <div className="border-2 border-blue-300 rounded-lg overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
                  <h3 className="font-semibold text-blue-900">Email Preview</h3>
                </div>
                <div
                  className="p-4 bg-white max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: emailPreviewHtml }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3A: Send to Custom Email */}
      {emailPreviewHtml && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 3A: Send to Custom Email</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <Button
              onClick={handleSendToCustomEmail}
              disabled={isLoading || !customEmail || !customEmail.includes('@')}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700"
            >
              {isLoading ? "Sending..." : "Send to This Email"}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3B: Send to All Users */}
      {emailPreviewHtml && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Step 3B: Send to All Users</h2>
            {users.length > 0 && (
              <Button variant="outline" onClick={toggleAll} size="sm">
                {selectedUsers.size === users.length ? "Deselect All" : "Select All"}
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div className="border border-slate-200 rounded-lg max-h-96 overflow-y-auto">
              <div className="divide-y divide-slate-200">
                {users.map((user) => (
                  <label
                    key={user.email}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.email)}
                      onChange={() => toggleUser(user.email)}
                      className="w-5 h-5 rounded border-slate-300 text-orange-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{user.email}</p>
                      {user.name && <p className="text-sm text-slate-500">{user.name}</p>}
                    </div>
                    <div className="text-sm">
                      {user.subscribed ? (
                        <span className="text-green-600 font-medium">✓ Subscribed</span>
                      ) : (
                        <span className="text-slate-400">Unsubscribed</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSendPodcast}
              disabled={isLoading || selectedUsers.size === 0}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700"
            >
              {isLoading ? "Sending..." : `Send to ${selectedUsers.size} User(s)`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface EmailTemplate {
  template_id: string;
  name: string;
  subject: string;
  html_content: string;
  created_at: number;
  updated_at: number;
}

function EmailTemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editHtmlContent, setEditHtmlContent] = useState("");

  // Preview and send states
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [recipientEmails, setRecipientEmails] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
    loadUsers();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/email-templates`);
      const data = await response.json();
      setTemplates(data.items || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!editName || !editSubject || !editHtmlContent) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/email-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          subject: editSubject,
          html_content: editHtmlContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to create template");

      const data = await response.json();
      toast.success("Template created successfully!");
      setShowCreateModal(false);
      setEditName("");
      setEditSubject("");
      setEditHtmlContent("");
      loadTemplates();
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/email-templates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: selectedTemplate.template_id,
          updates: {
            name: editName,
            subject: editSubject,
            html_content: editHtmlContent,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to update template");

      toast.success("Template updated successfully!");
      setIsEditing(false);
      loadTemplates();
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/email-templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete template");

      toast.success("Template deleted successfully!");
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviewTemplate = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/email-templates/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: selectedTemplate.template_id,
          test_variables: {
            name: "Test User",
            email: "test@example.com",
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to preview template");

      const data = await response.json();
      setPreviewHtml(data.html_content);
      setPreviewSubject(data.subject);
      setShowPreview(true);
    } catch (error) {
      console.error("Error previewing template:", error);
      toast.error("Failed to preview template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTemplate = async () => {
    if (!selectedTemplate) return;

    const emails = Array.from(selectedUsers);
    if (emails.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/email-templates/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: selectedTemplate.template_id,
          recipient_emails: emails,
          variables: {},
        }),
      });

      if (!response.ok) throw new Error("Failed to send emails");

      const data = await response.json();
      toast.success(`Sent to ${data.sent} recipient(s)!`);
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Failed to send emails");
    } finally {
      setIsLoading(false);
    }
  };

  const selectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditName(template.name);
    setEditSubject(template.subject);
    setEditHtmlContent(template.html_content);
    setIsEditing(false);
    setShowPreview(false);
  };

  const toggleUserSelection = (email: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.email)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Custom Email Templates</h2>
            <p className="text-slate-600">Create and manage HTML email templates</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            + New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="space-y-3">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Mail className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>No templates yet</p>
                <p className="text-sm">Create your first template</p>
              </div>
            ) : (
              templates.map((template) => (
                <button
                  key={template.template_id}
                  onClick={() => selectTemplate(template)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate?.template_id === template.template_id
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Mail className={`w-5 h-5 mt-1 ${selectedTemplate?.template_id === template.template_id ? "text-orange-600" : "text-slate-400"}`} />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{template.name}</div>
                      <div className="text-xs text-slate-500 mt-1 font-mono truncate">
                        Subject: {template.subject}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Updated {new Date(template.updated_at * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Template Editor/Preview */}
          <div className="lg:col-span-2 space-y-4">
            {selectedTemplate ? (
              <>
                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="flex-1"
                      >
                        ✏️ Edit Template
                      </Button>
                      <Button
                        onClick={handlePreviewTemplate}
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1"
                      >
                        👁️ Preview
                      </Button>
                      <Button
                        onClick={() => handleDeleteTemplate(selectedTemplate.template_id)}
                        disabled={isLoading}
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        🗑️ Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleUpdateTemplate}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
                      >
                        {isLoading ? "Saving..." : "💾 Save Changes"}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          selectTemplate(selectedTemplate);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        ❌ Cancel
                      </Button>
                    </>
                  )}
                </div>

                {/* Editor Form */}
                {isEditing && (
                  <div className="space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Template Name
                      </label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="e.g., Welcome Email"
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Subject Line
                        <span className="text-xs text-slate-500 ml-2">
                          (Use {"{name}"} or {"{email}"} for variables)
                        </span>
                      </label>
                      <Input
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        placeholder="e.g., Welcome {name}!"
                        className="bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        HTML Content
                        <span className="text-xs text-slate-500 ml-2">
                          (Full HTML with inline styles)
                        </span>
                      </label>
                      <Textarea
                        value={editHtmlContent}
                        onChange={(e) => setEditHtmlContent(e.target.value)}
                        placeholder="<html>...</html>"
                        className="font-mono text-sm bg-white min-h-[400px]"
                      />
                    </div>
                  </div>
                )}

                {/* Preview */}
                {showPreview && !isEditing && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-5 h-5 text-slate-600" />
                      <h3 className="font-semibold text-slate-900">Email Preview</h3>
                    </div>
                    <div className="mb-3 p-3 bg-white border border-slate-200 rounded">
                      <div className="text-xs text-slate-500 mb-1">Subject:</div>
                      <div className="font-medium text-slate-900">{previewSubject}</div>
                    </div>
                    <div
                      className="bg-white p-4 rounded border border-slate-200 overflow-auto max-h-96"
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                )}

                {/* Send Section */}
                {!isEditing && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Send className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Send to Users</h3>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">
                          Select Recipients ({selectedUsers.size} selected)
                        </label>
                        <Button
                          onClick={toggleAllUsers}
                          variant="outline"
                          size="sm"
                        >
                          {selectedUsers.size === users.length ? "Deselect All" : "Select All"}
                        </Button>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                        {users.map((user) => (
                          <label
                            key={user.email}
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(user.email)}
                              onChange={() => toggleUserSelection(user.email)}
                              className="w-4 h-4 rounded border-slate-300 text-orange-600"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 text-sm">{user.email}</p>
                              {user.name && <p className="text-xs text-slate-500">{user.name}</p>}
                            </div>
                            {user.subscribed && (
                              <span className="text-xs text-green-600 font-medium">✓ Active</span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleSendTemplate}
                      disabled={isLoading || selectedUsers.size === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      {isLoading ? "Sending..." : `📧 Send to ${selectedUsers.size} User(s)`}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg p-12">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>Select a template to edit, preview, or send</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-slate-900">Create New Template</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Template Name
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Welcome Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject Line
                  <span className="text-xs text-slate-500 ml-2">
                    (Use {"{name}"} or {"{email}"} for variables)
                  </span>
                </label>
                <Input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="e.g., Welcome {name}!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  HTML Content
                  <span className="text-xs text-slate-500 ml-2">
                    (Full HTML with inline styles)
                  </span>
                </label>
                <Textarea
                  value={editHtmlContent}
                  onChange={(e) => setEditHtmlContent(e.target.value)}
                  placeholder="<html>...</html>"
                  className="font-mono text-sm min-h-[400px]"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-2">
              <Button
                onClick={handleCreateTemplate}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isLoading ? "Creating..." : "Create Template"}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditName("");
                  setEditSubject("");
                  setEditHtmlContent("");
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Step1AddPaper({
  paperData,
  setPaperData,
  setTranscript
}: {
  paperData: PaperData | null;
  setPaperData: (data: PaperData | null) => void;
  setTranscript: (transcript: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [paperUrl, setPaperUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [textTitle, setTextTitle] = useState("");
  const [customText, setCustomText] = useState("");
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

  const handleUploadPDF = async () => {
    if (!paperUrl || !pdfFile) {
      toast.error("Please provide both URL and PDF file");
      return;
    }

    setIsLoading(true);
    toast.info("Extracting text from PDF...");

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("paper_url", paperUrl);

      const response = await fetch(`${API_URL}/api/admin/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload PDF");

      const data = await response.json();
      if (typeof data.authors === 'string') {
        data.authors = [data.authors];
      }

      setPaperData(data);
      setPaperUrl("");
      setPdfFile(null);
      toast.success("PDF uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload PDF");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromText = async () => {
    if (!customText || customText.length < 100) {
      toast.error("Please provide at least 100 characters");
      return;
    }

    setIsLoading(true);
    toast.info("Processing text...");

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
      const newPaperData: PaperData = {
        paper_id: data.paper_id,
        title: data.title,
        authors: ["Custom Text"],
        abstract: customText.substring(0, 500) + (customText.length > 500 ? "..." : ""),
        pdf_url: "N/A",
      };

      setPaperData(newPaperData);
      setTranscript(data.transcript);
      setCustomText("");
      setTextTitle("");
      toast.success("Text processed successfully!");
    } catch (error) {
      toast.error("Failed to process text");
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
      toast.success("Changes saved!");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Paper</h2>
        <p className="text-slate-600">Upload a PDF or paste text to get started</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("upload")}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === "upload"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Upload PDF
        </button>
        <button
          onClick={() => setActiveTab("text")}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === "text"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          From Text
        </button>
      </div>

      {activeTab === "upload" && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Upload a PDF and provide the source URL. You can edit the extracted metadata after upload.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Paper URL</label>
            <Input
              type="url"
              placeholder="https://example.com/paper.pdf"
              value={paperUrl}
              onChange={(e) => setPaperUrl(e.target.value)}
              disabled={isLoading}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">PDF File</label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              disabled={isLoading}
              className="h-12"
            />
            {pdfFile && (
              <p className="text-sm text-green-600 font-medium">
                Selected: {pdfFile.name}
              </p>
            )}
          </div>

          <Button
            onClick={handleUploadPDF}
            disabled={isLoading || !paperUrl || !pdfFile}
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            {isLoading ? "Processing..." : "Upload PDF"}
          </Button>
        </div>
      )}

      {activeTab === "text" && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              Paste any text content to create a podcast. Minimum 100 characters required.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <Input
              type="text"
              placeholder="Enter title"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              disabled={isLoading}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Content</label>
            <Textarea
              placeholder="Paste your text here..."
              rows={12}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-sm text-slate-500">
              {customText.length} characters (minimum 100)
            </p>
          </div>

          <Button
            onClick={handleGenerateFromText}
            disabled={isLoading || customText.length < 100}
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            {isLoading ? "Processing..." : "Generate from Text"}
          </Button>
        </div>
      )}

      {paperData && (
        <div className="mt-8 p-6 bg-green-50 border-2 border-green-300 rounded-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Paper Loaded Successfully</h3>
            </div>
            <span className="text-xs font-mono bg-green-100 text-green-700 px-3 py-1 rounded-full">
              {paperData.paper_id}
            </span>
          </div>

          {paperData.ocr_details && (
            <div className="p-4 bg-white rounded-lg border border-green-200 space-y-3">
              <h4 className="font-semibold text-slate-900">OCR Extraction Results</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{paperData.ocr_details.total_pages}</div>
                  <div className="text-sm text-slate-600 mt-1">Pages</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{paperData.ocr_details.total_chars.toLocaleString()}</div>
                  <div className="text-sm text-slate-600 mt-1">Characters</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {Math.round(paperData.ocr_details.total_chars / paperData.ocr_details.total_pages)}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Avg/Page</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-12 bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Authors (comma-separated)</label>
              <Input
                value={editAuthors}
                onChange={(e) => setEditAuthors(e.target.value)}
                className="h-12 bg-white"
                placeholder="John Doe, Jane Smith"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Abstract</label>
              <Textarea
                value={editAbstract}
                onChange={(e) => setEditAbstract(e.target.value)}
                rows={6}
                className="bg-white resize-none"
              />
            </div>

            <Button
              onClick={saveEdits}
              className="w-full h-12 bg-green-600 hover:bg-green-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

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
    toast.info("Generating transcript... This may take a few minutes");

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
      toast.success("Transcript generated successfully!");
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Generate Script</h2>
        <p className="text-slate-600">
          {paperData ? `Creating script for: ${paperData.title.substring(0, 80)}...` : "Add a paper first"}
        </p>
      </div>

      {!paperData && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <p className="text-amber-800">Please upload a paper in Step 1 first</p>
        </div>
      )}

      {paperData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Host Persona</label>
              <select
                value={hostPersona}
                onChange={(e) => setHostPersona(e.target.value)}
                className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              >
                {hostPersonas.map(p => (
                  <option key={p.key} value={p.key}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Expert Persona</label>
              <select
                value={expertPersona}
                onChange={(e) => setExpertPersona(e.target.value)}
                className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              >
                {expertPersonas.map(p => (
                  <option key={p.key} value={p.key}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Technical Level</label>
            <select
              value={technicalLevel}
              onChange={(e) => setTechnicalLevel(e.target.value)}
              className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="baby">👶 Explain to a Child</option>
              <option value="highschool">🎒 High School Level</option>
              <option value="undergrad">🎓 Undergraduate Level</option>
              <option value="graduate">👨‍🎓 Graduate/Professional</option>
              <option value="expert">🔬 Expert Researcher</option>
              <option value="nobel">🏆 Nobel Laureate Level</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Custom Topics (Optional)</label>
            <Textarea
              placeholder="Specific areas to cover..."
              rows={4}
              value={customTopics}
              onChange={(e) => setCustomTopics(e.target.value)}
              disabled={isLoading}
              className="resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              id="useFullText"
              checked={useFullText}
              onChange={(e) => setUseFullText(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              disabled={isLoading}
            />
            <label htmlFor="useFullText" className="text-sm font-medium text-slate-700">
              Use full PDF text (generates 7-10 minute script)
            </label>
          </div>

          <Button
            onClick={handleGenerateTranscript}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            {isLoading ? "Generating Transcript..." : "Generate Transcript"}
          </Button>

          {transcript && (
            <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Transcript Generated</h3>
                </div>
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
                  className="bg-white font-mono text-sm resize-none"
                />
              ) : (
                <div className="max-h-96 overflow-y-auto bg-white p-4 rounded-lg border border-blue-200 whitespace-pre-wrap text-sm">
                  {transcript}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Step3ConvertToAudio({
  paperData,
  transcript,
  setPodcastId,
  setAudioUrl,
  targetWords,
  setTargetWords,
}: {
  paperData: PaperData | null;
  transcript: string;
  setPodcastId: (id: string) => void;
  setAudioUrl: (url: string) => void;
  targetWords: number;
  setTargetWords: (value: number) => void;
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
        toast.error("Failed to load preview");
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(audioUrl);
    } catch (error) {
      toast.error("Error playing preview");
      console.error(error);
    }
  };

  const handleConvertToAudio = async () => {
    if (!paperData || !transcript) {
      toast.error("Please generate a transcript first");
      return;
    }

    setIsLoading(true);
    toast.info("Converting to audio... This will take several minutes");

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Audio</h2>
        <p className="text-slate-600">Select voices and generate your podcast audio</p>
      </div>

      {!transcript && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <p className="text-amber-800">Please generate a transcript in Step 2 first</p>
        </div>
      )}

      {transcript && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Host Voice</label>
              <div className="flex gap-2">
                <select
                  value={hostVoice}
                  onChange={(e) => setHostVoice(e.target.value)}
                  className="flex-1 h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {voices.map(v => (
                    <option key={v.key} value={v.key}>{v.name} - {v.description}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  onClick={() => handlePreviewVoice(hostVoice, "host")}
                  disabled={isLoading}
                  className="px-4"
                >
                  ▶️
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Expert Voice</label>
              <div className="flex gap-2">
                <select
                  value={expertVoice}
                  onChange={(e) => setExpertVoice(e.target.value)}
                  className="flex-1 h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {voices.map(v => (
                    <option key={v.key} value={v.key}>{v.name} - {v.description}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  onClick={() => handlePreviewVoice(expertVoice, "expert")}
                  disabled={isLoading}
                  className="px-4"
                >
                  ▶️
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Audio Length Limit</label>
              <select
                value={targetWords}
                onChange={(e) => setTargetWords(Number(e.target.value))}
                className="w-full h-12 px-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value={0}>No Limit (Full Transcript)</option>
                <option value={1000}>~5-7 minutes (1000 words)</option>
                <option value={1500}>~8-10 minutes (1500 words)</option>
                <option value={2000}>~11-13 minutes (2000 words)</option>
                <option value={2500}>~14-17 minutes (2500 words)</option>
              </select>
              <p className="text-xs text-slate-500">
                Choose &quot;No Limit&quot; to use your entire transcript without any shortening
              </p>
            </div>
          </div>

          <Button
            onClick={handleConvertToAudio}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            {isLoading ? "Converting to Audio..." : "Convert to Audio"}
          </Button>

          {generatedAudioUrl && (
            <div className="p-6 bg-purple-50 border-2 border-purple-300 rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900">Podcast Generated!</h3>
              </div>
              <audio controls className="w-full">
                <source src={generatedAudioUrl} type="audio/mpeg" />
              </audio>
              <p className="text-sm text-purple-700">
                Podcast ID: <span className="font-mono bg-purple-100 px-2 py-1 rounded">{currentPodcastId}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
      } catch (error) {
        console.error("Failed to load users:", error);
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
      setSelectedUsers(new Set());
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Distribute</h2>
          <p className="text-slate-600">
            {podcastId ? `${selectedUsers.size} user(s) selected` : "Generate a podcast first"}
          </p>
        </div>
        {users.length > 0 && (
          <Button variant="outline" onClick={toggleAll} size="sm">
            {selectedUsers.size === users.length ? "Deselect All" : "Select All"}
          </Button>
        )}
      </div>

      {!podcastId && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <p className="text-amber-800">Please generate audio in Step 3 first</p>
        </div>
      )}

      {podcastId && audioUrl && (
        <>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
            </audio>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-600">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-600">No users found</div>
          ) : (
            <div className="border border-slate-200 rounded-lg max-h-96 overflow-y-auto">
              <div className="divide-y divide-slate-200">
                {users.map((user) => (
                  <label
                    key={user.email}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.email)}
                      onChange={() => toggleUser(user.email)}
                      className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{user.email}</p>
                      {user.name && <p className="text-sm text-slate-500">{user.name}</p>}
                    </div>
                    <div className="text-sm">
                      {user.subscribed ? (
                        <span className="text-green-600 font-medium">✓ Subscribed</span>
                      ) : (
                        <span className="text-slate-400">Unsubscribed</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleSendToSelected}
              disabled={selectedUsers.size === 0 || isSending}
              className="h-12 bg-green-600 hover:bg-green-700"
            >
              {isSending ? "Sending..." : `Send to Selected (${selectedUsers.size})`}
            </Button>
            <Button
              onClick={handleSendToAll}
              disabled={isSending}
              className="h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              Send to ALL Subscribers
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
