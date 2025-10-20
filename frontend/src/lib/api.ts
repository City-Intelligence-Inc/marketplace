const API_BASE_URL = "https://four0k-arr-saas.onrender.com";

export async function subscribeEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.status === 201) {
      return { success: true, message: data.message || "Successfully subscribed!" };
    } else if (response.status === 409) {
      return { success: false, message: "This email is already subscribed." };
    } else {
      return { success: false, message: data.detail || "An error occurred. Please try again." };
    }
  } catch (error) {
    console.error("Subscription error:", error);
    return { success: false, message: "Network error. Please check your connection and try again." };
  }
}

export interface Episode {
  podcast_id: string;
  paper_title: string;
  paper_authors: string;
  paper_url: string;
  audio_url: string;
  sent_at: number;
}

export async function getEpisodes(): Promise<{ success: boolean; episodes: Episode[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/episodes`);

    if (!response.ok) {
      return { success: false, episodes: [], error: "Failed to fetch episodes" };
    }

    const data = await response.json();

    return { success: true, episodes: data.episodes || [] };
  } catch (error) {
    console.error("Episodes fetch error:", error);
    return { success: false, episodes: [], error: "Network error. Please check your connection and try again." };
  }
}
