import { useState, useRef, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Eye, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeEpisode } from "@/api/animeApi";
import { cn } from "@/lib/utils";

interface EpisodeCarouselProps {
  episodes: AnimeEpisode[];
  currentEpisodeUrl?: string;
  onEpisodeSelect: (episode: AnimeEpisode) => void;
  className?: string;
}

const EpisodeCarousel = forwardRef<HTMLDivElement, EpisodeCarouselProps>(({
  episodes,
  currentEpisodeUrl,
  onEpisodeSelect,
  className
}, ref) => {
  const [hoveredEpisode, setHoveredEpisode] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Create internal ref for scroll operations
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract episode number for display
  const getEpisodeNumber = (title: string) => {
    const match = title.match(/episode\s*(\d+)/i);
    return match ? match[1] : "";
  };

  // Extract date from title if available
  const getEpisodeDate = (title: string) => {
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

  // Check scroll position
  const checkScrollPosition = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll to active episode
  const scrollToActiveEpisode = () => {
    if (!scrollRef.current) return;
    
    const activeElement = scrollRef.current.querySelector('[data-episode-active="true"]');
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Check scroll position on mount and when episodes change
  useEffect(() => {
    checkScrollPosition();
    
    const carousel = scrollRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScrollPosition);
      return () => carousel.removeEventListener('scroll', checkScrollPosition);
    }
  }, [episodes.length]); // Only depend on episodes.length to prevent unnecessary re-renders

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
    <div className={cn("relative", className)}>
      {/* Header */}
      <div className="px-4 pb-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Play className="h-5 w-5 text-purple-400" />
          Episodes
        </h2>
        <p className="text-sm text-gray-400 mt-1">{episodes.length} episodes available</p>
      </div>

      {/* Scroll buttons */}
      {canScrollLeft && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20"
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
      )}
      
      {canScrollRight && (
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      )}

      {/* Carousel container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide px-4 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3" style={{ width: 'max-content' }}>
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
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.03,
                    ease: "easeOut"
                  }}
                  className={cn(
                    "relative cursor-pointer transition-all duration-300 flex-shrink-0 w-40",
                    isActive && "scale-105"
                  )}
                  data-episode-active={isActive.toString()}
                  onMouseEnter={() => setHoveredEpisode(episode.url)}
                  onMouseLeave={() => setHoveredEpisode(null)}
                  onClick={() => onEpisodeSelect(episode)}
                >
                  {/* Episode card */}
                  <div className={cn(
                    "bg-black/40 backdrop-blur-sm rounded-lg border transition-all duration-300 overflow-hidden",
                    isActive 
                      ? "border-purple-500 ring-2 ring-purple-500 ring-offset-2 ring-offset-black" 
                      : isHovered 
                        ? "border-purple-400/50 shadow-lg shadow-purple-500/20 scale-105" 
                        : "border-white/10 hover:border-white/20"
                  )}>
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-purple-900/40 to-purple-600/20 flex items-center justify-center overflow-hidden">
                      {episodeNumber ? (
                        <span className="text-sm font-bold text-white">EP {episodeNumber}</span>
                      ) : (
                        <Play className="h-6 w-6 text-white/70" />
                      )}
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <Play className="h-5 w-5 text-white ml-0.5" />
                        </div>
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          className="absolute top-2 right-2 px-2 py-1 bg-purple-600 rounded-full text-xs text-white font-medium"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        >
                          Playing
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Episode info */}
                    <div className="p-3">
                      <h3 className={cn(
                        "text-sm font-medium line-clamp-2 transition-colors",
                        isActive ? "text-purple-300" : "text-white hover:text-purple-300"
                      )}>
                        {episode.title}
                      </h3>
                      
                      {/* Episode metadata */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        {episodeDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {episodeDate.split('-')[2]}/{episodeDate.split('-')[1]}
                          </div>
                        )}
                      </div>
                      
                    </div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <AnimatePresence>
                    {isHovered && !isActive && (
                      <motion.div
                        className="absolute inset-0 bg-purple-500/10 rounded-lg pointer-events-none"
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
      </div>
      
      {/* Hide scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
});

EpisodeCarousel.displayName = "EpisodeCarousel";

export default EpisodeCarousel;