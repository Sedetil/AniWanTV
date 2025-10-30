import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchAnimeDetails, fetchEpisodeStreams, AnimeEpisode, StreamSource } from "@/api/animeApi";
import { useIsMobile } from "@/hooks/use-mobile";
import VideoPlayer from "@/components/VideoPlayer";
import EpisodeList from "@/components/EpisodeList";
import EpisodeCarousel from "@/components/EpisodeCarousel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EpisodePlayerProps {
  currentEpisodeUrl: string;
  currentEpisodeTitle: string;
  onEpisodeChange: (episode: AnimeEpisode) => void;
  className?: string;
  currentStreamUrl?: string;
  useVideoTag?: boolean;
  onStreamError?: () => void;
  animeImageUrl?: string; // Add anime image URL for episode thumbnails
}

const EpisodePlayer = ({
  currentEpisodeUrl,
  currentEpisodeTitle,
  onEpisodeChange,
  className,
  currentStreamUrl,
  useVideoTag,
  onStreamError,
  animeImageUrl
}: EpisodePlayerProps) => {
  const [selectedEpisode, setSelectedEpisode] = useState<AnimeEpisode | null>(null);
  const [selectedStream, setSelectedStream] = useState<{url: string, host: string, useVideoTag: boolean} | null>(null);
  const isMobile = useIsMobile();
  const episodeListRef = useRef<HTMLDivElement>(null);

  // Fetch episode streams from API
  const { data: streamData, isLoading: streamsLoading } = useQuery({
    queryKey: ["episodeStreams", selectedEpisode?.url],
    queryFn: () => selectedEpisode?.url ? fetchEpisodeStreams(selectedEpisode.url) : Promise.resolve(null),
    enabled: !!selectedEpisode?.url,
    retry: 1,
  });

  // Transform URL function (same as in WatchEpisode)
  const transformUrl = (url: string) => {
    if (!url) return url;
    
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
    
    return url;
  };

  // Get direct streams from API data
  const directStreams = streamData?.direct_stream_urls || [];

  // Debug: Log the stream data to see what's available
  useEffect(() => {
    if (streamData) {
      console.log("Stream data from API:", streamData);
      console.log("Direct streams available:", directStreams);
      console.log("Pixeldrain streams:", directStreams.filter(s => s.host.toLowerCase().includes("pixeldrain")));
    }
  }, [streamData]);

  // Color scheme for different qualities - using theme colors
  const qualityColors = {
    "360p": "bg-gray-700 hover:bg-gray-600 text-white",
    "480p": "bg-blue-700 hover:bg-blue-600 text-white",
    "720p": "bg-purple-700 hover:bg-purple-600 text-white",
    "1080p": "bg-green-700 hover:bg-green-600 text-white"
  };

  // Handle stream selection
  const handleStreamSelect = (stream: StreamSource) => {
    const transformedUrl = transformUrl(stream.url);
    
    // Completely avoid PixelDrain due to persistent 403 errors
    if (stream.host.toLowerCase().includes("pixeldrain")) {
      console.warn("PixelDrain stream selected - this will likely fail with 403 errors");
      setSelectedStream({
        url: transformedUrl,
        host: stream.host,
        useVideoTag: true
      });
    } else if (stream.host.toLowerCase().includes("krakenfiles")) {
      // For Krakenfiles, use iframe (most reliable)
      console.log("Krakenfiles stream selected - this should work well");
      setSelectedStream({
        url: transformedUrl,
        host: stream.host,
        useVideoTag: false
      });
    } else if (stream.host.toLowerCase().includes("mega")) {
      // For MEGA, use iframe
      console.log("MEGA stream selected - this should work well");
      setSelectedStream({
        url: transformedUrl,
        host: stream.host,
        useVideoTag: false
      });
    } else {
      // Default to iframe for unknown hosts
      console.log(`Unknown stream host selected: ${stream.host}`);
      setSelectedStream({
        url: transformedUrl,
        host: stream.host,
        useVideoTag: false
      });
    }
  };
  
  // Handle stream error with fallback
  const handleStreamError = () => {
    console.error("Stream error in EpisodePlayer");
    
    // If current stream is PixelDrain and failed, immediately switch to another source
    if (selectedStream?.host.toLowerCase().includes("pixeldrain")) {
      console.log("PixelDrain failed as expected, immediately switching to alternative source");
      
      // Find alternative streams in order of preference (excluding PixelDrain)
      const alternativeStreams = [
        // Prefer Krakenfiles
        ...directStreams.filter(
          (stream) => !stream.host.toLowerCase().includes("pixeldrain") &&
                     stream.host.toLowerCase().includes("krakenfiles")
        ),
        // Then MEGA
        ...directStreams.filter(
          (stream) => !stream.host.toLowerCase().includes("pixeldrain") &&
                     stream.host.toLowerCase().includes("mega")
        ),
        // Then any other non-PixelDrain source
        ...directStreams.filter(
          (stream) => !stream.host.toLowerCase().includes("pixeldrain")
        )
      ];
      
      if (alternativeStreams.length > 0) {
        const bestAlternative = alternativeStreams[0];
        console.log("Switching to alternative stream:", bestAlternative.host);
        handleStreamSelect(bestAlternative);
        return;
      }
    }
    
    // If current stream is not PixelDrain, try other non-PixelDrain streams
    const otherStreams = directStreams.filter(
      (stream) => {
        const transformed = transformUrl(stream.url);
        return transformed !== selectedStream?.url &&
               !stream.host.toLowerCase().includes("pixeldrain");
      }
    );
    
    if (otherStreams.length > 0) {
      console.log("Trying another stream:", otherStreams[0].host);
      handleStreamSelect(otherStreams[0]);
      return;
    }
    
    // If we have an onStreamError callback, use it
    if (onStreamError) {
      onStreamError();
    }
  };

  // Parse episode URL to extract components
  const parseEpisodeUrl = (url: string) => {
    // Pattern: /episode/anime-slug-episode-number
    const cleanUrl = url.replace("https://winbu.tv", "").replace("http://localhost:8080", "");
    const match = cleanUrl.match(/^\/episode\/(.+)-episode-(\d+)$/);
    if (match) {
      return {
        animeSlug: match[1],
        episodeNumber: match[2],
        cleanUrl: cleanUrl
      };
    }
    return null;
  };

  // Extract anime URL from episode URL
  const getAnimeUrlFromEpisodeUrl = (episodeUrl: string) => {
    const urlData = parseEpisodeUrl(episodeUrl);
    if (urlData) {
      return `https://winbu.tv/anime/${urlData.animeSlug}/`;
    }
    return `https://winbu.tv${episodeUrl}`;
  };

  // Extract episode number from URL for better matching
  const getEpisodeNumberFromUrl = (url: string) => {
    const urlData = parseEpisodeUrl(url);
    return urlData?.episodeNumber || null;
  };

  // Normalize URL for comparison
  const normalizeUrl = (url: string | undefined) => {
    if (!url) return "";
    return url.replace("https://winbu.tv", "").replace("http://localhost:8080", "");
  };

  const animeUrl = getAnimeUrlFromEpisodeUrl(currentEpisodeUrl);
  const currentEpisodeNumber = getEpisodeNumberFromUrl(currentEpisodeUrl);

  // Fetch anime details to get all episodes
  const { data: animeData, isLoading: episodesLoading } = useQuery({
    queryKey: ["animeDetails", animeUrl],
    queryFn: () => fetchAnimeDetails(animeUrl),
    enabled: !!animeUrl,
    retry: 1,
  });

  // Set current episode when data loads or currentEpisodeUrl changes
  useEffect(() => {
    if (animeData?.episodes && currentEpisodeUrl) {
      const currentUrlData = parseEpisodeUrl(currentEpisodeUrl);
      const normalizedCurrentUrl = normalizeUrl(currentEpisodeUrl);
      
      // First try to find exact URL match
      let current = animeData.episodes.find(
        ep => normalizeUrl(ep.url) === normalizedCurrentUrl
      );
      
      // If no exact match, try to match by episode number
      if (!current && currentUrlData?.episodeNumber) {
        current = animeData.episodes.find(
          ep => {
            const epNumber = getEpisodeNumberFromUrl(ep.url);
            return epNumber === currentUrlData.episodeNumber;
          }
        );
      }
      
      // If still no match, try to extract episode number from title
      if (!current && currentUrlData?.episodeNumber) {
        current = animeData.episodes.find(
          ep => {
            const titleMatch = ep.title.match(/episode\s*(\d+)/i);
            return titleMatch && titleMatch[1] === currentUrlData.episodeNumber;
          }
        );
      }
      
      if (current) {
        setSelectedEpisode(current);
        
        // Scroll to active episode after component renders
        const scrollToActiveEpisode = () => {
          // For desktop
          if (episodeListRef.current && !isMobile) {
            const activeElement = episodeListRef.current.querySelector('[data-episode-active="true"]');
            if (activeElement) {
              activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          }
          
          // For mobile - scroll in carousel after a short delay to ensure it's rendered
          if (isMobile) {
            setTimeout(() => {
              const carouselElement = document.querySelector('.scrollbar-hide');
              if (carouselElement) {
                const activeElement = carouselElement.querySelector('[data-episode-active="true"]');
                if (activeElement) {
                  activeElement.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest'
                  });
                }
              }
            }, 100);
          }
        };
        
        // Delay scroll to ensure DOM is updated
        setTimeout(scrollToActiveEpisode, 100);
      } else if (animeData.episodes.length > 0) {
        // Fallback to first episode if no match found
        setSelectedEpisode(animeData.episodes[0]);
      }
    }
  }, [animeData, currentEpisodeUrl]); // Remove currentEpisodeNumber and isMobile from dependencies

  // Also scroll when episodes change (initial load)
  useEffect(() => {
    if (animeData?.episodes && selectedEpisode) {
      // Scroll to active episode after component renders
      const scrollToActiveEpisode = () => {
        // For desktop
        if (episodeListRef.current && !isMobile) {
          const activeElement = episodeListRef.current.querySelector('[data-episode-active="true"]');
          if (activeElement) {
            activeElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
        
        // For mobile - scroll in carousel after a short delay to ensure it's rendered
        if (isMobile) {
          setTimeout(() => {
            const carouselElement = document.querySelector('.scrollbar-hide');
            if (carouselElement) {
              const activeElement = carouselElement.querySelector('[data-episode-active="true"]');
              if (activeElement) {
                activeElement.scrollIntoView({
                  behavior: 'smooth',
                  inline: 'center',
                  block: 'nearest'
                });
              }
            }
          }, 100);
        }
      };
      
      // Delay scroll to ensure DOM is updated
      setTimeout(scrollToActiveEpisode, 200);
    }
  }, [animeData?.episodes, selectedEpisode?.url]); // Only depend on selectedEpisode.url to prevent unnecessary re-renders

  const handleEpisodeSelect = (episode: AnimeEpisode) => {
    // Only update if this is a different episode
    if (selectedEpisode?.url !== episode.url) {
      setSelectedEpisode(episode);
      onEpisodeChange(episode);
      
      // Scroll to active episode after a short delay
      setTimeout(() => {
        // For desktop
        if (episodeListRef.current && !isMobile) {
          const activeElement = episodeListRef.current.querySelector('[data-episode-active="true"]');
          if (activeElement) {
            activeElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
        
        // For mobile
        if (isMobile) {
          const carouselElement = document.querySelector('.scrollbar-hide');
          if (carouselElement) {
            const activeElement = carouselElement.querySelector('[data-episode-active="true"]');
            if (activeElement) {
              activeElement.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
              });
            }
          }
        }
      }, 100);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const videoVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const episodesVariants = {
    hidden: { opacity: 0, x: isMobile ? 20 : 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay: 0.2
      }
    }
  };

  if (episodesLoading) {
    return (
      <div className={cn("flex flex-col md:flex-row gap-6", className)}>
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
    );
  }

  if (!animeData?.episodes || animeData.episodes.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-2">No Episodes Available</h3>
          <p className="text-gray-400">This anime doesn't have any episodes yet.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn("flex flex-col md:flex-row gap-6", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Video Player Section */}
      <motion.div 
        className="flex-1 min-w-0"
        variants={videoVariants}
      >
        <div className="space-y-4">
          {/* Video Player */}
          <div className="w-full bg-black rounded-lg overflow-hidden">
            {selectedStream ? (
              selectedStream.useVideoTag ? (
                <VideoPlayer
                  src={selectedStream.url}
                  title={`${currentEpisodeTitle} - ${selectedStream.host}`}
                  className="w-full"
                  onError={handleStreamError}
                  maxRetries={selectedStream.host.toLowerCase().includes("pixeldrain") ? 5 : 3}
                />
              ) : (
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={selectedStream.url}
                    title={`${currentEpisodeTitle} - ${selectedStream.host}`}
                    allowFullScreen
                    className="w-full h-full"
                    onError={handleStreamError}
                  />
                </div>
              )
            ) : currentStreamUrl && useVideoTag ? (
              <VideoPlayer
                src={currentStreamUrl}
                title={currentEpisodeTitle}
                className="w-full"
                onError={handleStreamError}
                maxRetries={currentStreamUrl.includes("pixeldrain.com") ? 5 : 3}
              />
            ) : (
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={currentStreamUrl || currentEpisodeUrl}
                  title={currentEpisodeTitle}
                  allowFullScreen
                  className="w-full h-full"
                  onError={handleStreamError}
                />
              </div>
            )}
          </div>
          
          {/* Episode Title */}
          <div className="px-2">
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {selectedEpisode?.title || currentEpisodeTitle}
            </h1>
            
            {/* Streaming Options */}
            {streamsLoading ? (
              <div className="mt-4 space-y-4">
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
              </div>
            ) : directStreams.length > 0 ? (
              <div className="mt-4 space-y-4">
                {["360p", "480p", "720p", "1080p"].map((quality) => (
                  <div key={quality}>
                    <h2 className="text-white text-lg font-semibold mb-2">{quality} Quality</h2>
                    <div className="flex flex-wrap gap-2">
                      {directStreams
                        .filter((s) => s.quality === quality)
                        .map((s) => (
                          <Button
                            key={s.url}
                            onClick={() => handleStreamSelect(s)}
                            variant="secondary"
                            className={cn(
                              "mr-2 mb-2 text-sm transition-all duration-200",
                              qualityColors[s.quality as keyof typeof qualityColors],
                              selectedStream?.url === transformUrl(s.url) && "ring-2 ring-white ring-offset-2 ring-offset-black shadow-lg"
                            )}
                          >
                            {s.host}
                            {selectedStream?.url === transformUrl(s.url) && (
                              <span className="ml-1 text-xs">✓</span>
                            )}
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
                
                {/* Currently Playing Indicator */}
                {selectedStream && (
                  <div className={cn(
                    "mt-4 p-3 rounded-lg border",
                    selectedStream.host.toLowerCase().includes("pixeldrain")
                      ? "bg-orange-500/10 border-orange-500/20"
                      : "bg-black/40 border-white/10"
                  )}>
                    <p className="text-sm text-gray-300">
                      Now playing:
                      <span className={cn(
                        "font-medium ml-1",
                        selectedStream.host.toLowerCase().includes("pixeldrain")
                          ? "text-orange-400"
                          : "text-white"
                      )}>
                        {selectedStream.host}
                      </span> -
                      <span className="text-purple-400 font-medium ml-1">
                        {directStreams.find(s => transformUrl(s.url) === selectedStream.url)?.quality}
                      </span>
                      {selectedStream.host.toLowerCase().includes("pixeldrain") && (
                        <span className="text-orange-400 text-xs ml-2">(May have loading issues)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Episodes Section */}
      <motion.div 
        className={cn(
          "w-full md:w-80 lg:w-96 flex-shrink-0",
          isMobile && "mt-6"
        )}
        variants={episodesVariants}
      >
        <AnimatePresence mode="wait">
          {isMobile ? (
            <EpisodeCarousel
              key={`carousel-${selectedEpisode?.url}`}
              episodes={animeData.episodes}
              currentEpisodeUrl={selectedEpisode?.url}
              onEpisodeSelect={handleEpisodeSelect}
              className="w-full"
            />
          ) : (
            <EpisodeList
              key={`list-${selectedEpisode?.url}`}
              episodes={animeData.episodes}
              currentEpisodeUrl={selectedEpisode?.url}
              onEpisodeSelect={handleEpisodeSelect}
              className="w-full h-full"
              ref={episodeListRef}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default EpisodePlayer;
