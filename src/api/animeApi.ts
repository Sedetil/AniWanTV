import { toast } from "sonner";

// Base API URL - Change this to match your Flask API's URL
const API_BASE_URL = "http://127.0.0.1:5000";

// API response interfaces
export interface AnimeBasic {
  title: string;
  url: string;
  image_url: string;
}

export interface TopAnime extends AnimeBasic {
  rating: string;
  rank: string;
}

export interface LatestAnime extends AnimeBasic {
  episode: string;
  views: string;
  duration: string;
  rank: string | null;
}

export interface AnimeEpisode {
  title: string;
  url: string;
}

export interface AnimeDetails {
  title: string;
  image_url: string;
  rating: string;
  release_date: string;
  genres: string[];
  synopsis: string;
  episodes: AnimeEpisode[];
}

export interface StreamSource {
  quality: string;
  host: string;
  url: string;
}

export interface EpisodeStream {
  title: string;
  stream_url: string;
  download_links: Record<string, Array<{ host: string; url: string }>>;
  player_options: string[];
  direct_stream_urls: StreamSource[];
  all_stream_sources: string[];
}

export interface PaginatedResponse<T> {
  anime_list: T[];
  current_page: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ReleaseSchedule {
  day: string;
  schedule: Array<{
    title: string;
    url: string;
    image_url: string;
    rating: string;
    time: string;
    genres: string[];
    type: string;
  }>;
  available_days: string[];
}

// Error handling function
const handleApiError = (error: unknown): never => {
  const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";
  toast.error(errorMessage);
  throw new Error(errorMessage);
};

// Hardcoded available days (since backend doesn't provide them)
const AVAILABLE_DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

// API functions
export const fetchTopAnime = async (): Promise<TopAnime[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/top-anime`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = (await response.json()) as ApiResponse<TopAnime[]>;
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch top anime");
    }
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchReleaseSchedule = async (
  day: string
): Promise<ReleaseSchedule> => {
  try {
    const response = await fetch(`${API_BASE_URL}/release-schedule?day=${day}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = (await response.json()) as ApiResponse<any>;
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch release schedule");
    }

    const dayKey = day.charAt(0).toUpperCase() + day.slice(1);

    // Handle array response (specific day)
    if (Array.isArray(result.data)) {
      const schedule = result.data.map((item: any) => ({
        title: item.title || "Unknown Title",
        url: item.url || "",
        image_url: item.image_url || "",
        rating: item.rating || "N/A",
        time: item.time || "N/A",
        genres: [], // Default empty array
        type: "TV", // Default type
      }));
      return {
        day: dayKey,
        schedule,
        available_days: AVAILABLE_DAYS,
      };
    }

    // Handle dictionary response (all days)
    if (typeof result.data === "object" && !result.data.schedule) {
      const schedule = (result.data[dayKey] || []).map((item: any) => ({
        title: item.title || "Unknown Title",
        url: item.url || "",
        image_url: item.image_url || "",
        rating: item.rating || "N/A",
        time: item.time || "N/A",
        genres: [], // Default empty array
        type: "TV", // Default type
      }));
      return {
        day: dayKey,
        schedule,
        available_days: Object.keys(result.data),
      };
    }

    // Handle unexpected response
    throw new Error("Unexpected response format");
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchLatestAnime = async (
  page = 1
): Promise<PaginatedResponse<LatestAnime>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/latest-anime?page=${page}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = (await response.json()) as ApiResponse<
      PaginatedResponse<LatestAnime>
    >;
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch latest anime");
    }
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchAnimeDetails = async (url: string): Promise<AnimeDetails> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/anime-details?url=${encodeURIComponent(url)}`
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = (await response.json()) as ApiResponse<AnimeDetails>;
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch anime details");
    }
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchEpisodeStreams = async (
  url: string
): Promise<EpisodeStream> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/episode-streams?url=${encodeURIComponent(url)}`
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = (await response.json()) as ApiResponse<EpisodeStream>;
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch episode streams");
    }
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const searchAnime = async (query: string): Promise<AnimeBasic[]> => {
  try {
    if (!query.trim()) {
      return [];
    }
    const searchUrl = `${API_BASE_URL}/search?query=${encodeURIComponent(
      query
    )}`;
    console.log("Search URL:", searchUrl);
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = (await response.json()) as ApiResponse<AnimeBasic[]>;
    if (!result.success) {
      throw new Error(result.error || "Failed to search anime");
    }
    console.log("Search results:", result.data);
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
};