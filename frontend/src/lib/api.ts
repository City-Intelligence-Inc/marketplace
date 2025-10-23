const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://marketplace-wtvs.onrender.com";

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
  category?: string;
  duration?: number;
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

export interface Category {
  name: string;
  count: number;
}

export async function getCategories(): Promise<{ success: boolean; categories: Category[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`);

    if (!response.ok) {
      return { success: false, categories: [], error: "Failed to fetch categories" };
    }

    const data = await response.json();

    return { success: true, categories: data.categories || [] };
  } catch (error) {
    console.error("Categories fetch error:", error);
    return { success: false, categories: [], error: "Network error. Please check your connection and try again." };
  }
}
