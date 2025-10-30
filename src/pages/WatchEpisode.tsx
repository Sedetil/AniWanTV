import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEpisodeStreams, AnimeEpisode } from "@/api/animeApi";
import {
  ChevronLeft,
  Download,
  MessageSquare,
  Share2,
  ThumbsUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import VideoPlayer from "@/components/VideoPlayer";
import EpisodePlayer from "@/components/EpisodePlayer";
import { getBookmark, updateProgress, extractEpisodeNumber, isBookmarked, addBookmark } from "@/utils/bookmarkUtils";

const WatchEpisode = () => {
  const { "*": slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [iframeKey, setIframeKey] = useState(0);
  const [currentStreamUrl, setCurrentStreamUrl] = useState(null);
  const [useVideoTag, setUseVideoTag] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState<AnimeEpisode | null>(null);
  const [useNewLayout, setUseNewLayout] = useState(true); // Toggle for new layout
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Extract anime slug and episode number from URL
  const parseEpisodeUrl = (pathname: string) => {
    // Pattern: /episode/anime-slug-episode-number
    const match = pathname.match(/^\/episode\/(.+)-episode-(\d+)$/);
    if (match) {
      return {
        animeSlug: match[1],
        episodeNumber: match[2],
        fullUrl: `https://winbu.tv${pathname}`
      };
    }
    return null;
  };

  // Parse current URL
  const urlData = parseEpisodeUrl(location.pathname);
  const currentEpisodeNumber = urlData?.episodeNumber || "1";
  const animeSlug = urlData?.animeSlug || "";
  
  // Mengambil judul episode dari state navigasi
  const episodeTitle = location.state?.episodeTitle || `Episode ${currentEpisodeNumber}`;
  const episodeUrl = urlData?.fullUrl || `https://winbu.tv${location.pathname}`;

  // Update progress when episode loads
  useEffect(() => {
    if (episodeTitle) {
      // Extract anime slug from URL
      const path = location.pathname;
      if (path.startsWith("/episode/")) {
        const episodeSlug = path.replace("/episode/", "").replace(/\/+$/, "");
        const baseSlug = episodeSlug.replace(/-episode-.+$/i, "");
        
        if (baseSlug) {
          // Normalize slug for consistent bookmark ID
          const normalizedSlug = baseSlug.trim().toLowerCase();
          
          // Extract anime title from episode title (remove "Episode X" part)
          const animeTitle = episodeTitle.replace(/episode\s*\d+/i, '').trim() || "Unknown Anime";
          
          // Check if bookmark exists
          const existingBookmark = getBookmark(normalizedSlug);
          
          if (!existingBookmark) {
            // Create new bookmark with complete data
            const bookmark = {
              id: normalizedSlug,
              title: animeTitle,
              type: "anime" as const,
              lastProgress: 0,
              category: "Sedang Ditonton" as const,
              imageUrl: undefined, // Will be updated when we have access to anime details
            };
            addBookmark(bookmark);
          } else if (!existingBookmark.imageUrl || existingBookmark.title === "Unknown Anime") {
            // Update existing bookmark if it has incomplete data
            const updatedBookmark = {
              ...existingBookmark,
              title: animeTitle,
              // Keep existing imageUrl if it exists, we don't want to lose it
            };
            addBookmark(updatedBookmark);
          }
          
          // Update progress
          const episodeNumber = extractEpisodeNumber(episodeTitle);
          updateProgress(normalizedSlug, episodeNumber);
        }
      }
    }
  }, [location.pathname]); // Only depend on location.pathname to prevent infinite loops

  const handleShare = async () => {
    const shareData = {
      title: episodeTitle || "Tonton Anime",
      text: `Tonton ${episodeTitle} di AniWanTV`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        setErrorMessage("Link berhasil disalin ke clipboard!");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      setErrorMessage("Gagal membagikan konten");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };


  const { data, isLoading, error } = useQuery({
    queryKey: ["episodeStream", episodeUrl],
    queryFn: () => fetchEpisodeStreams(episodeUrl),
    retry: 1,
  });

  // Handle episode change from EpisodePlayer
  const handleEpisodeChange = (episode: AnimeEpisode) => {
    // Parse the episode URL to extract anime slug and episode number
    const cleanEpisodeUrl = episode.url.replace("https://winbu.tv", "").replace("http://localhost:8080", "");
    const episodeUrlData = parseEpisodeUrl(cleanEpisodeUrl);
    
    if (episodeUrlData) {
      // Navigate to new episode without full page reload
      const newUrl = `/episode/${episodeUrlData.animeSlug}-episode-${episodeUrlData.episodeNumber}`;
      
      navigate(newUrl, {
        state: { episodeTitle: episode.title }
      });
      
      // Update current episode state
      setCurrentEpisode(episode);
      
      // Reset iframe key to force reload
      setIframeKey(prev => prev + 1);
      
      // Clear any existing error messages
      setErrorMessage(null);
    } else {
      // Fallback: try to extract episode number from title
      const episodeNumberMatch = episode.title.match(/episode\s*(\d+)/i);
      if (episodeNumberMatch && animeSlug) {
        const newUrl = `/episode/${animeSlug}-episode-${episodeNumberMatch[1]}`;
        
        navigate(newUrl, {
          state: { episodeTitle: episode.title }
        });
        
        setCurrentEpisode(episode);
        setIframeKey(prev => prev + 1);
        setErrorMessage(null);
      }
    }
  };

  // Sync episode with URL changes
  useEffect(() => {
    // This will be called when URL changes (user navigates to different episode)
    // Force video reload and clear any errors
    setIframeKey(prev => prev + 1);
    setErrorMessage(null);
    
    // Update current episode when URL changes
    if (urlData) {
      // Create a temporary episode object for URL-based navigation
      const tempEpisode: AnimeEpisode = {
        title: episodeTitle,
        url: urlData.fullUrl
      };
      setCurrentEpisode(tempEpisode);
    }
  }, [location.pathname]); // Only depend on location.pathname to prevent infinite loops

  const isValidStreamUrl = (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.endsWith(".mp4") ||
      lowerUrl.endsWith(".m3u8") ||
      lowerUrl.endsWith(".mpd") ||
      lowerUrl.includes("/embed") ||
      lowerUrl.includes("/player") ||
      lowerUrl.includes("/stream") ||
      lowerUrl.includes("krakenfiles.com/embed-video") ||
      lowerUrl.includes("mega.nz/embed") ||
      lowerUrl.includes("pixeldrain.com")
    );
  };

  const isEmbedUrl = (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.includes("/embed") ||
      lowerUrl.includes("/player") ||
      lowerUrl.includes("krakenfiles.com/embed-video") ||
      lowerUrl.includes("mega.nz/embed")
    );
  };

  const getSandboxAttribute = (url) => {
    if (!url) return "allow-scripts allow-same-origin allow-forms allow-popups";
    const lowerUrl = url.toLowerCase();
    if (
      lowerUrl.includes("krakenfiles.com/embed-video") ||
      lowerUrl.includes("mega.nz/embed")
    ) {
      console.log(`Removing sandbox for trusted URL: ${url}`);
      return null;
    }
    return "allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-modals";
  };

  const transformUrl = (url) => {
    if (!url) return url;
    console.log(`Transforming URL: ${url}`);

    // Handle PixelDrain URLs - preserve /api/file/ format if already present
    if (url.includes("pixeldrain.com/u/")) {
      const fileId = url.split("/u/")[1].split("?")[0];
      const transformed = `https://pixeldrain.com/api/file/${fileId}`;
      console.log(`Transformed PixelDrain URL to: ${transformed}`);
      return transformed;
    }
    
    // If URL already has /api/file/ format, add timestamp but keep format
    if (url.includes("pixeldrain.com/api/file/")) {
      // Add timestamp only if not already present
      if (!url.includes('?t=')) {
        const separator = url.includes('?') ? '&' : '?';
        const timestamp = Date.now();
        const transformed = `${url}${separator}t=${timestamp}`;
        console.log(`Added timestamp to existing PixelDrain API URL: ${transformed}`);
        return transformed;
      }
      return url;
    }

    if (url.includes("mega.nz/file/")) {
      const parts = url.split("/file/");
      if (parts.length > 1) {
        const fileId = parts[1].split("#")[0];
        const embedUrl = `https://mega.nz/embed/${fileId}`;
        console.log(`Transformed Mega file URL to embed: ${embedUrl}`);
        return embedUrl;
      }
    }

    console.log(`URL passed through unchanged: ${url}`);
    return url;
  };

  const getAnimeUrl = () => {
    const path = location.pathname;
    if (path.startsWith("/episode/")) {
      // Ambil slug episode lalu potong sebelum "-episode-..."
      const episodeSlug = path.replace("/episode/", "").replace(/\/+$/, "");
      const baseSlug = episodeSlug.replace(/-episode-.+$/i, "");
      return `/anime/${baseSlug}/`;
    }
    // Fallback: jika sudah di /anime/ kembalikan path, jika tidak, pulang ke beranda
    if (path.startsWith("/anime/")) return path;
    if (path.startsWith("/episode/")) return path.replace(/^\/episode\//, "/anime/");
    return "/";
  };


  useEffect(() => {
    if (data) {
      console.log("Backend response:", JSON.stringify(data, null, 2));

      let streamUrl = null;
      let shouldUseVideoTag = false;

      console.log(
        "All stream sources:",
        data.all_stream_sources?.map(transformUrl) || []
      );
      console.log(
        "Direct stream URLs:",
        data.direct_stream_urls?.map((s) => ({
          quality: s.quality,
          host: s.host,
          url: transformUrl(s.url),
        })) || []
      );

      // Completely remove PixelDrain from prioritization due to persistent 403 errors
      const prioritizedStreams = [
        // 1. Try Krakenfiles first (most reliable)
        ...data.direct_stream_urls?.filter(
          (stream) => stream.host.toLowerCase().includes("krakenfiles")
        ).sort((a, b) => {
          // Prefer higher quality for Krakenfiles
          const qualityOrder = { "1080p": 4, "720p": 3, "480p": 2, "360p": 1 };
          return (qualityOrder[b.quality as keyof typeof qualityOrder] || 0) -
                 (qualityOrder[a.quality as keyof typeof qualityOrder] || 0);
        }) || [],
        
        // 2. Try MEGA embeds
        ...data.direct_stream_urls?.filter(
          (stream) => stream.host.toLowerCase().includes("mega")
        ) || [],
        
        // 3. Try any other non-PixelDrain direct streams
        ...data.direct_stream_urls?.filter(
          (stream) => !stream.host.toLowerCase().includes("pixeldrain") &&
                     !stream.host.toLowerCase().includes("krakenfiles") &&
                     !stream.host.toLowerCase().includes("mega")
        ) || [],
        
        // 4. Fallback to any embed URLs (excluding PixelDrain)
        ...(data.all_stream_sources?.filter(url => {
          const transformed = transformUrl(url);
          return isEmbedUrl(transformed) && !transformed.includes("pixeldrain.com");
        }) || []),
        
        // 5. Finally, any valid stream (excluding PixelDrain)
        ...(data.direct_stream_urls?.filter(stream => {
          const transformed = transformUrl(stream.url);
          return isValidStreamUrl(transformed) && !transformed.includes("pixeldrain.com");
        }) || []),
        ...(data.all_stream_sources?.filter(url => {
          const transformed = transformUrl(url);
          return isValidStreamUrl(transformed) && !transformed.includes("pixeldrain.com");
        }) || [])
      ];

      // Try to find a working stream
      for (const stream of prioritizedStreams) {
        const streamUrlToTest = typeof stream === 'string' ? transformUrl(stream) : transformUrl(stream.url);
        const streamHost = typeof stream === 'string' ? 'Unknown' : stream.host;
        const streamQuality = typeof stream === 'string' ? 'Unknown' : stream.quality;
        
        if (isValidStreamUrl(streamUrlToTest)) {
          streamUrl = streamUrlToTest;
          shouldUseVideoTag = !isEmbedUrl(streamUrlToTest);
          
          console.log(`Selected stream: ${streamHost} (${streamQuality}) - ${streamUrlToTest}`);
          break;
        }
      }

      // If no non-PixelDrain streams are available, try PixelDrain as absolute last resort
      if (!streamUrl) {
        console.warn("No non-PixelDrain streams available, trying PixelDrain as last resort");
        
        const pixeldrainStreams = data.direct_stream_urls?.filter(
          (stream) => stream.host.toLowerCase().includes("pixeldrain")
        ) || [];
        
        if (pixeldrainStreams.length > 0) {
          const bestPixelDrain = pixeldrainStreams[0];
          streamUrl = transformUrl(bestPixelDrain.url);
          shouldUseVideoTag = !isEmbedUrl(streamUrl);
          console.log(`Using PixelDrain as last resort: ${bestPixelDrain.host} (${bestPixelDrain.quality})`);
          setErrorMessage("Warning: Using PixelDrain which may have loading issues. Consider switching to another source.");
          setTimeout(() => setErrorMessage(null), 8000);
        }
      }

      console.log(
        "Final selected stream URL:",
        streamUrl,
        "Use video tag:",
        shouldUseVideoTag
      );

      if (!streamUrl) {
        console.error("No valid stream URL selected");
        setErrorMessage("No playable stream found. Please try another episode or source.");
      } else {
        setCurrentStreamUrl(streamUrl);
        setUseVideoTag(shouldUseVideoTag);
        setIframeKey((prev) => prev + 1);
      }
    }
  }, [data, episodeUrl]); // Add episodeUrl to dependency array to ensure proper updates

  const switchStream = (url) => {
    const transformedUrl = transformUrl(url);
    if (isValidStreamUrl(transformedUrl)) {
      const shouldUseVideoTag = !isEmbedUrl(transformedUrl);
      console.log(
        "Switching to stream:",
        transformedUrl,
        "Use video tag:",
        shouldUseVideoTag
      );
      setCurrentStreamUrl(transformedUrl);
      setUseVideoTag(shouldUseVideoTag);
      setIframeKey((prev) => prev + 1);
      setErrorMessage(null);
    } else {
      console.warn("Invalid stream URL:", transformedUrl);
      setErrorMessage(
        "Selected stream source is invalid. Please try another source."
      );
    }
  };

  const handleStreamError = () => {
    console.error("Stream failed to load:", currentStreamUrl);
    
    // If it's a PixelDrain 403 error, immediately switch to another source without retry
    if (currentStreamUrl && currentStreamUrl.includes("pixeldrain.com")) {
      console.log("PixelDrain error detected, immediately switching to alternative source");
      
      // Try to find a non-PixelDrain source first, prioritized by reliability
      const alternativeStreams = [
        // Prefer Krakenfiles
        ...data.direct_stream_urls?.filter(
          (stream) => !stream.host.toLowerCase().includes("pixeldrain") &&
                     stream.host.toLowerCase().includes("krakenfiles") &&
                     isValidStreamUrl(transformUrl(stream.url))
        ) || [],
        // Then MEGA
        ...data.direct_stream_urls?.filter(
          (stream) => !stream.host.toLowerCase().includes("pixeldrain") &&
                     stream.host.toLowerCase().includes("mega") &&
                     isValidStreamUrl(transformUrl(stream.url))
        ) || [],
        // Then any other non-PixelDrain source
        ...data.direct_stream_urls?.filter(
          (stream) => !stream.host.toLowerCase().includes("pixeldrain") &&
                     isValidStreamUrl(transformUrl(stream.url))
        ) || []
      ];
      
      if (alternativeStreams.length > 0) {
        const bestAlternative = alternativeStreams[0];
        console.log("Switching to alternative stream:", bestAlternative);
        switchStream(bestAlternative.url);
        setErrorMessage(`PixelDrain blocked. Switched to ${bestAlternative.host} - this should work better.`);
        setTimeout(() => setErrorMessage(null), 6000);
        return;
      }
    }
    
    // For non-PixelDrain errors, try other streams
    if (data?.direct_stream_urls?.length > 0) {
      const nextDirectStream = data.direct_stream_urls.find(
        (stream) => {
          const transformed = transformUrl(stream.url);
          return transformed !== currentStreamUrl &&
                 isValidStreamUrl(transformed) &&
                 !transformed.includes("pixeldrain.com");
        }
      );
      if (nextDirectStream) {
        console.log("Switching to next direct stream:", nextDirectStream);
        switchStream(nextDirectStream.url);
        return;
      }
    }
    
    // If we have other stream sources, try them (excluding PixelDrain)
    if (data?.all_stream_sources?.length > 1) {
      const nextUrl = data.all_stream_sources.find(
        (url) => {
          const transformed = transformUrl(url);
          return transformed !== currentStreamUrl &&
                 isValidStreamUrl(transformed) &&
                 !transformed.includes("pixeldrain.com");
        }
      );
      if (nextUrl) {
        console.log("Switching to next stream:", nextUrl);
        switchStream(nextUrl);
        return;
      }
    }
    
    // No alternatives available
    setErrorMessage(
      "Failed to load stream. No working sources available. Please try another episode."
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Back button skeleton */}
            <div className="animate-pulse">
              <div className="h-4 w-24 bg-muted rounded" />
            </div>

            {/* Error message skeleton (hidden but reserved space) */}
            <div className="h-0" />

            {/* New Streaming Layout Skeleton */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Video player skeleton */}
              <div className="flex-1">
                <div className="w-full aspect-video bg-muted rounded-lg animate-pulse" />
                <div className="mt-4 h-6 bg-muted rounded w-3/4 animate-pulse" />
                
                {/* Streaming options skeleton */}
                <div className="mt-6 space-y-4">
                  {["360p", "480p", "720p", "1080p"].map((quality) => (
                    <div key={quality} className="space-y-2">
                      <div className="h-5 bg-muted rounded w-24 animate-pulse" />
                      <div className="flex flex-wrap gap-2">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-8 w-24 bg-muted rounded animate-pulse"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Currently playing indicator skeleton */}
                  <div className="mt-4 p-3 rounded-lg border bg-muted border-white/10 animate-pulse">
                    <div className="h-4 bg-muted rounded w-48" />
                  </div>
                </div>

                {/* Action buttons skeleton */}
                <div className="mt-6 flex flex-wrap justify-between items-center gap-4 border-t border-b border-white/10 py-4">
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-24 bg-muted rounded animate-pulse"
                      />
                    ))}
                  </div>
                  <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
              
              {/* Episodes skeleton */}
              <div className="w-full md:w-80 lg:w-96">
                <div className="bg-muted rounded-lg p-4 animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="h-12 bg-muted rounded" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Episode</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't load this episode. Please try again later.
            </p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (
    !currentStreamUrl &&
    (!data.all_stream_sources || data.all_stream_sources.length === 0) &&
    (!data.direct_stream_urls || data.direct_stream_urls.length === 0)
  ) {
    console.error("No streams available. Data:", JSON.stringify(data, null, 2));
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">No Streams Available</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find any streams for this episode.
            </p>
            <Link to={getAnimeUrl()}>
              <Button>Back to Anime</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Back button */}
          <div>
            <Link
              to={getAnimeUrl()}
              className="inline-flex items-center text-gray-400 hover:text-purple-400 transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Anime</span>
            </Link>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* New Streaming Layout */}
          {useNewLayout && currentStreamUrl ? (
            <EpisodePlayer
              currentEpisodeUrl={episodeUrl}
              currentEpisodeTitle={episodeTitle}
              onEpisodeChange={handleEpisodeChange}
              currentStreamUrl={currentStreamUrl}
              useVideoTag={useVideoTag}
              onStreamError={handleStreamError}
              className="w-full"
            />
          ) : (
            /* Original Layout (fallback) */
            <div className="space-y-6">
              {currentStreamUrl ? (
                useVideoTag ? (
                  <div
                    ref={videoContainerRef}
                    className="relative"
                  >
                    <VideoPlayer
                      key={iframeKey}
                      src={currentStreamUrl}
                      title={data.title}
                      onError={handleStreamError}
                    />
                  </div>
                ) : (
                  <div
                    ref={videoContainerRef}
                    className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-white/10 relative"
                  >
                    <iframe
                      key={iframeKey}
                      src={currentStreamUrl}
                      title={data.title}
                      allowFullScreen
                      className="w-full h-full"
                      sandbox={getSandboxAttribute(currentStreamUrl)}
                      onError={handleStreamError}
                    />
                  </div>
                )
              ) : (
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-white/10 flex items-center justify-center">
                  <p className="text-gray-400">
                    No stream available for this episode
                  </p>
                </div>
              )}

              <h1 className="text-2xl font-bold text-white">{episodeTitle}</h1>

              {/* Stream Sources */}
              {data.all_stream_sources && data.all_stream_sources.length > 1 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Stream Sources</h3>
                  <div className="flex flex-wrap gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 bg-black/40 border-white/20 text-white hover:bg-purple-600/20 hover:border-purple-500">
                          <RefreshCw className="h-4 w-4" />
                          <span>Change Source</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56 bg-black/90 border-white/20">
                        <DropdownMenuLabel className="text-white">Available Sources</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        {data.all_stream_sources.map((url, index) => {
                          const transformedUrl = transformUrl(url);
                          return (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => switchStream(url)}
                              className="cursor-pointer text-gray-300 hover:text-white hover:bg-purple-600/20"
                              disabled={!isValidStreamUrl(transformedUrl)}
                            >
                              Source {index + 1}
                              {transformedUrl === currentStreamUrl && " (Current)"}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap justify-between items-center gap-4 border-t border-b border-white/10 py-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-black/40 border-white/20 text-white hover:bg-purple-600/20 hover:border-purple-500">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Like</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 bg-black/40 border-white/20 text-white hover:bg-purple-600/20 hover:border-purple-500">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Comment</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-black/40 border-white/20 text-white hover:bg-purple-600/20 hover:border-purple-500"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                </div>

                {Object.keys(data.download_links).length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-black/40 border-white/20 text-white hover:bg-purple-600/20 hover:border-purple-500">
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-black/90 border-white/20">
                      <DropdownMenuLabel className="text-white">Download Options</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      {Object.entries(data.download_links).map(
                        ([quality, links]) => (
                          <DropdownMenuGroup key={quality}>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="text-gray-300 hover:text-white hover:bg-purple-600/20">
                                {quality}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="bg-black/90 border-white/20">
                                {links.map((link) => (
                                  <DropdownMenuItem key={link.url} asChild>
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="cursor-pointer text-gray-300 hover:text-white hover:bg-purple-600/20"
                                    >
                                      {link.host}
                                    </a>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          </DropdownMenuGroup>
                        )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Direct Stream Options */}
              {data.direct_stream_urls && data.direct_stream_urls.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Direct Stream Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.direct_stream_urls.map((stream, idx) => {
                      const transformedUrl = transformUrl(stream.url);
                      return (
                        <Button
                          key={idx}
                          variant={
                            currentStreamUrl === transformedUrl
                              ? "default"
                              : "secondary"
                          }
                          size="sm"
                          onClick={() => switchStream(stream.url)}
                          disabled={!isValidStreamUrl(transformedUrl)}
                          className={
                            currentStreamUrl === transformedUrl
                              ? "bg-purple-600 text-white"
                              : "bg-black/40 border-white/20 text-white hover:bg-purple-600/20 hover:border-purple-500"
                          }
                        >
                          {stream.quality} - {stream.host}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WatchEpisode;