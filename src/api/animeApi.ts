import { toast } from "sonner";

// Base API URL - Change this to match your Flask API's URL
const API_BASE_URL = "https://web-production-f6fa7.up.railway.app";

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

export interface RelatedAnime {
  title: string;
  url: string;
  image_url: string;
  rating: string;
}

export interface AnimeDetails {
  title: string;
  image_url: string;
  rating: string;
  release_date: string;
  genres: string[];
  synopsis: string;
  episodes: AnimeEpisode[];
  related_anime?: RelatedAnime[];
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

// Comic interfaces
export interface ComicBasic {
  title: string;
  url: string;
  image_url: string;
}

export interface LatestComic extends ComicBasic {
  type: string;
  is_colored: boolean;
  is_hot: boolean;
  latest_chapter: string;
  chapter_url: string;
  update_time: string;
}

export interface PopularComic extends ComicBasic {
  author: string;
  rating: string;
  rank: string;
}

export interface ComicCollection extends ComicBasic {
  genres: string[];
  rating: string;
}

export interface ComicChapter {
  title: string;
  url: string;
  update_time: string;
}

export interface ComicDetails {
  title: string;
  image_url: string;
  rating: string;
  alternative_titles: string[];
  status: string;
  author: string;
  illustrator: string;
  demographic: string;
  type: string;
  genres: string[];
  synopsis: string;
  chapters: ComicChapter[];
  related_comics: ComicBasic[];
  last_updated: string;
}

export interface ChapterImage {
  url: string;
  alt: string;
}

export interface ChapterImages {
  title: string;
  description: string;
  images: ChapterImage[];
  navigation: {
    chapter_list?: string;
    next_chapter?: string;
    prev_chapter?: string;
  };
}

export interface PaginatedResponse<T> {
  anime_list: T[];
  current_page: number;
  total_pages: number;
}

export interface PaginatedComicResponse {
  comic_list: LatestComic[];
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

// Animexin interfaces
export interface AnimexinBasic {
  title: string;
  url: string;
  image: string;
  type?: string;
  episode?: string;
  status?: string;
  genre?: string;
  subtitle?: string;
}

export interface AnimexinPopularToday extends AnimexinBasic {
  type: string;
  episode: string;
}

export interface AnimexinLatestRelease extends AnimexinBasic {
  type: string;
  episode: string;
}

export interface AnimexinRecommendation extends AnimexinBasic {
  status: string;
  genre: string;
}

export interface AnimexinBlog {
  title: string;
  url: string;
  image: string;
  date: string;
  excerpt: string;
}

export interface AnimexinEpisode {
  number: string;
  title: string;
  subtitle: string;
  release_date: string;
  url: string;
}

export interface AnimexinSeriesDetails {
  title: string;
  series_url: string;
  alternate_title: string;
  image: string;
  status: string;
  network: string;
  network_url: string;
  studio: string;
  studio_url: string;
  released: string;
  duration: string;
  country: string;
  country_url: string;
  type: string;
  fansub: string;
  posted_by: string;
  released_on: string;
  updated_on: string;
  genres: string[];
  synopsis: {
    english: string;
    indonesia: string;
  };
  episodes: AnimexinEpisode[];
  recommended_series: AnimexinBasic[];
}

export interface AnimexinStreamingServer {
  server_name: string;
  url: string;
}

export interface AnimexinEpisodeDetails {
  series_title: string;
  series_url: string;
  episode: {
    number: string;
    title: string;
    url: string;
    subtitle: string;
    release_date: string;
  };
  streaming_servers: AnimexinStreamingServer[];
  posted_by: string;
  released_on: string;
  updated_on: string;
  recommended_series: AnimexinBasic[];
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

// Comic API functions
export const fetchLatestComics = async (
  page = 1
): Promise<PaginatedComicResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/latest-comics?page=${page}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result =
      (await response.json()) as ApiResponse<PaginatedComicResponse>;
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch latest comics");
    }
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchPopularComics = async (): Promise<PopularComic[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/popular-comics`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = (await response.json()) as ApiResponse<PopularComic[]>;
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch popular comics");
    }
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Animexin API functions
export const fetchAnimexinPopularToday = async (): Promise<AnimexinPopularToday[]> => {
  try {
    // Use the regular endpoint now that we've fixed the parsing
    const response = await fetch(`${API_BASE_URL}/animexin/popular-today`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch popular today");
    }
    return result.data.popular_today;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchAnimexinLatestRelease = async (): Promise<AnimexinLatestRelease[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/animexin/latest-release`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch latest release");
    }
    return result.data.latest_release;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchAnimexinRecommendation = async (): Promise<AnimexinRecommendation[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/animexin/recommendation`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch recommendation");
    }
    return result.data.recommendation;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchAnimexinLatestBlog = async (): Promise<AnimexinBlog[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/animexin/blog`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch latest blog");
    }
    return result.data.latest_blog;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchAnimexinSeriesDetails = async (url: string): Promise<AnimexinSeriesDetails> => {
  try {
    const response = await fetch(`${API_BASE_URL}/animexin/series/${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch series details");
    }
    return result.data.series_details;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchAnimexinEpisodeDetails = async (url: string): Promise<AnimexinEpisodeDetails> => {
  try {
    const response = await fetch(`${API_BASE_URL}/animexin/episode/${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch episode details");
    }
    return result.data.episode_details;
  } catch (error) {
    return handleApiError(error);
  }
};

export const searchAnimexin = async (query: string): Promise<AnimexinBasic[]> => {
  try {
    if (!query.trim()) {
      return [];
    }
    const response = await fetch(`${API_BASE_URL}/animexin/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to search animexin");
    }
    return result.data.search_results;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchLatestCollections = async (): Promise<ComicCollection[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/latest-collections`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = (await response.json()) as ApiResponse<ComicCollection[]>;
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch latest collections");
    }
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchComicDetails = async (url: string): Promise<ComicDetails> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/comic-details?url=${encodeURIComponent(url)}`
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = (await response.json()) as ApiResponse<ComicDetails>;
    if (!result.success) {
      throw new Error(result.error || "Failed to fetch comic details");
    }
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchChapterImages = async (chapterUrl: string) => {
  try {
    console.log('Fetching chapter images from URL:', chapterUrl);
    
    const response = await fetch(
      `${API_BASE_URL}/chapter-images?url=${encodeURIComponent(chapterUrl)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    // Log the raw response for debugging
    const text = await response.text();
    console.log('Raw response from /chapter-images:', text);

    // Attempt to parse the response as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Failed to parse response as JSON: ${text.substring(0, 100)}...`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch chapter images');
    }
    return data.data;
  } catch (error) {
    console.error('Error in fetchChapterImages:', error);
    throw error;
  }
};

export const searchComics = async (query: string): Promise<ComicBasic[]> => {
  try {
    if (!query.trim()) {
      return [];
    }
    const searchUrl = `${API_BASE_URL}/search-comics?query=${encodeURIComponent(
      query
    )}`;
    console.log("Search Comics URL:", searchUrl);
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = (await response.json()) as ApiResponse<ComicBasic[]>;
    if (!result.success) {
      throw new Error(result.error || "Failed to search comics");
    }
    console.log("Search comics results:", result.data);
    return result.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Search donghua (using animexin search)
export const searchDonghua = async (query: string): Promise<AnimexinBasic[]> => {
  try {
    if (!query.trim()) {
      return [];
    }
    const response = await fetch(`${API_BASE_URL}/animexin/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to search donghua");
    }
    return result.data.search_results;
  } catch (error) {
    return handleApiError(error);
  }
};
