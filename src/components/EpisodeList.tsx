import { useState, useRef, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Eye, Calendar, Clock } from "lucide-react";
import { AnimeEpisode } from "@/api/animeApi";
import { cn } from "@/lib/utils";

interface EpisodeListProps {
  episodes: AnimeEpisode[];
  currentEpisodeUrl?: string;
  onEpisodeSelect: (episode: AnimeEpisode) => void;
  className?: string;
  ref?: React.RefObject<HTMLDivElement>;
}

const EpisodeList = forwardRef<HTMLDivElement, EpisodeListProps>(({
  episodes,
  currentEpisodeUrl,
  onEpisodeSelect,
  className
}, ref) => {
  const [hoveredEpisode, setHoveredEpisode] = useState<string | null>(null);
  const internalRef = useRef<HTMLDivElement>(null);
  
  // Use forwarded ref or internal ref
  const episodeListRef = ref || internalRef;

  // Extract episode number for display
  const getEpisodeNumber = (title: string) => {
    const match = title.match(/episode\s*(\d+)/i);
    return match ? match[1] : "";
  };

  // Extract date from title if available
  const getEpisodeDate = (title: string) => {
    // Try to extract date patterns like "2023-12-25" or "Dec 25, 2023"
    const dateMatch = title.match(/(\d{4}-\d{2}-\d{2}|[A-Za-z]{3}\s\d{1,2},\s\d{4})/);
    return dateMatch ? dateMatch[1] : "";
  };

  // Normalize URL for comparison
  const normalizeUrl = (url: string | undefined) => {
    if (!url) return "";
    return url.replace("https://winbu.tv", "").replace("http://localhost:8080", "");
  };

  // Extract episode number from URL for better matching
  const getEpisodeNumberFromUrl = (url: string) => {
    const match = url.match(/episode-(\d+)/);
    return match ? match[1] : null;
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

  // Scroll to active episode
  const scrollToActiveEpisode = () => {
    // Use internal ref since forwarded ref might be a function
    if (!internalRef.current) return;
    
    const activeElement = internalRef.current.querySelector('[data-episode-active="true"]');
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Scroll to active episode when currentEpisodeUrl changes
  useEffect(() => {
    // Delay scroll to ensure DOM is updated
    setTimeout(scrollToActiveEpisode, 100);
  }, [currentEpisodeUrl]);

  // Also scroll when episodes change (initial load)
  useEffect(() => {
    // Delay scroll to ensure DOM is updated
    setTimeout(scrollToActiveEpisode, 200);
  }, [episodes.length]); // Only depend on episodes.length to prevent unnecessary re-renders

  return (
    <div ref={internalRef} className={cn("bg-black/40 backdrop-blur-sm rounded-lg border border-white/10", className)}>
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Play className="h-5 w-5 text-purple-400" />
          Episodes
        </h2>
        <p className="text-sm text-gray-400 mt-1">{episodes.length} episodes available</p>
      </div>
      
      <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
        <AnimatePresence>
          {episodes.map((episode, index) => {
            // First try exact URL match
            let isActive = normalizeUrl(currentEpisodeUrl) === normalizeUrl(episode.url);
            
            // If no exact match, try episode number matching
            if (!isActive && currentEpisodeUrl) {
              const currentEpNumber = getEpisodeNumberFromUrl(currentEpisodeUrl);
              const episodeEpNumber = getEpisodeNumberFromUrl(episode.url);
              isActive = currentEpNumber === episodeEpNumber;
            }
            
            // If still no match, try parsing URLs and comparing episode numbers
            if (!isActive && currentEpisodeUrl) {
              const currentUrlData = parseEpisodeUrl(currentEpisodeUrl);
              const episodeUrlData = parseEpisodeUrl(episode.url);
              
              if (currentUrlData?.episodeNumber && episodeUrlData?.episodeNumber) {
                isActive = currentUrlData.episodeNumber === episodeUrlData.episodeNumber;
              }
            }
            
            // Final fallback: try to match episode number from title
            if (!isActive && currentEpisodeUrl) {
              const currentUrlData = parseEpisodeUrl(currentEpisodeUrl);
              if (currentUrlData?.episodeNumber) {
                const titleMatch = episode.title.match(/episode\s*(\d+)/i);
                if (titleMatch && titleMatch[1] === currentUrlData.episodeNumber) {
                  isActive = true;
                }
              }
            }
            
            const isHovered = hoveredEpisode === episode.url;
            const episodeNumber = getEpisodeNumber(episode.title);
            const episodeDate = getEpisodeDate(episode.title);
            
            return (
              <motion.div
                key={episode.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 border-b border-white/5 last:border-b-0",
                  isActive
                    ? "bg-purple-600/20 border-l-4 border-l-purple-500"
                    : isHovered
                      ? "bg-white/5 border-l-4 border-l-purple-400/50"
                      : "border-l-4 border-l-transparent hover:bg-white/5"
                )}
                data-episode-active={isActive.toString()}
                onMouseEnter={() => setHoveredEpisode(episode.url)}
                onMouseLeave={() => setHoveredEpisode(null)}
                onClick={() => onEpisodeSelect(episode)}
              >
                <div className="p-4 flex items-start gap-3">
                  {/* Episode thumbnail placeholder */}
                  <div className="relative flex-shrink-0">
                    <div className={cn(
                      "w-16 h-10 rounded-md overflow-hidden bg-gradient-to-br from-purple-900/40 to-purple-600/20 flex items-center justify-center transition-all duration-300",
                      isActive && "ring-2 ring-purple-500 ring-offset-2 ring-offset-black",
                      isHovered && "scale-105 shadow-lg shadow-purple-500/20"
                    )}>
                      {episodeNumber ? (
                        <span className="text-xs font-bold text-white">EP {episodeNumber}</span>
                      ) : (
                        <Play className="h-4 w-4 text-white/70" />
                      )}
                    </div>
                    
                    {/* Playing indicator for active episode */}
                    {isActive && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  {/* Episode info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "text-sm font-medium truncate transition-colors",
                      isActive ? "text-purple-300" : "text-white hover:text-purple-300"
                    )}>
                      {episode.title}
                    </h3>
                    
                    {/* Episode metadata */}
                    <div className="flex items-center gap-3 mt-1">
                      {episodeDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {episodeDate}
                        </div>
                      )}
                       
                    </div>
                  </div>
                  
                  {/* Play button */}
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    isActive 
                      ? "bg-purple-600 text-white" 
                      : "bg-white/10 text-white/70 hover:bg-purple-600 hover:text-white"
                  )}>
                    <Play className="h-4 w-4 ml-0.5" />
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <AnimatePresence>
                  {isHovered && !isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
});

EpisodeList.displayName = "EpisodeList";

export default EpisodeList;