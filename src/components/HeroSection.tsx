import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TopAnime, LatestAnime } from "@/api/animeApi";

interface HeroSectionProps {
  featuredAnime: (TopAnime | LatestAnime)[] | null;
  loading?: boolean;
}

const HeroSection = ({ featuredAnime, loading = false }: HeroSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeAnime, setActiveAnime] = useState<TopAnime | LatestAnime | null>(
    null
  );

  // Change featured anime every 8 seconds
  useEffect(() => {
    if (featuredAnime && featuredAnime.length > 0) {
      setActiveAnime(featuredAnime[currentIndex]);

      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredAnime.length);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [featuredAnime, currentIndex]);

  // Update active anime when current index changes
  useEffect(() => {
    if (featuredAnime && featuredAnime.length > 0) {
      setActiveAnime(featuredAnime[currentIndex]);
    }
  }, [currentIndex, featuredAnime]);

  if (loading) {
    return (
      <div className="w-full h-[70vh] bg-gradient-to-b from-primary/10 to-background flex items-center justify-center">
        <div className="animate-pulse w-full max-w-4xl mx-auto px-4">
          <div className="h-8 bg-muted-foreground/20 rounded-md w-1/4 mb-6" />
          <div className="h-20 bg-muted-foreground/20 rounded-md w-2/3 mb-8" />
          <div className="h-10 bg-muted-foreground/20 rounded-md w-1/3 mb-4" />
          <div className="h-12 bg-muted-foreground/20 rounded-md w-40 mt-8" />
        </div>
      </div>
    );
  }

  if (!activeAnime) {
    return null;
  }

  // Check if anime has rating (TopAnime) or episode (LatestAnime)
  const isTopAnime = "rating" in activeAnime;
  const isLatestAnime = "episode" in activeAnime;

  // Check if image URL exists and is valid, with fallback
  const backgroundImageUrl =
    activeAnime.image_url && activeAnime.image_url !== "N/A"
      ? activeAnime.image_url
      : "https://via.placeholder.com/1920x1080?text=Anime+Banner";

  // Log untuk debugging
  console.log("Hero Section Active Anime:", activeAnime);
  console.log("Hero Section Image URL:", backgroundImageUrl);

  return (
    <div
      className="relative w-full h-[70vh] bg-cover bg-center bg-no-repeat flex items-end text-white dark:text-white"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url("${backgroundImageUrl}")`,
        backgroundColor: "var(--background)", // Menggunakan variabel CSS theme
      }}
    >
      <div className="container mx-auto px-4 pb-16 md:pb-24 mt-auto">
        <div className="max-w-4xl">
          {isLatestAnime && activeAnime.episode !== "N/A" && (
            <Badge className="mb-4 bg-primary/80 text-primary-foreground">
              Episode {activeAnime.episode}
            </Badge>
          )}

          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white dark:text-white">
            {activeAnime.title}
          </h1>

          <div className="flex flex-wrap gap-3 mb-6">
            {isTopAnime &&
              activeAnime.rating &&
              activeAnime.rating !== "N/A" && (
                <div className="flex items-center text-sm bg-black/50 dark:bg-black/50 text-white dark:text-white px-3 py-1 rounded-full">
                  <svg
                    className="w-4 h-4 text-yellow-500 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span>{activeAnime.rating}</span>
                </div>
              )}

            {isLatestAnime &&
              activeAnime.views &&
              activeAnime.views !== "N/A" && (
                <div className="flex items-center text-sm bg-black/50 px-3 py-1 rounded-full">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{activeAnime.views}</span>
                </div>
              )}

            {isLatestAnime &&
              activeAnime.duration &&
              activeAnime.duration !== "N/A" && (
                <div className="flex items-center text-sm bg-black/50 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{activeAnime.duration}</span>
                </div>
              )}

            {activeAnime.rank && activeAnime.rank !== "N/A" && (
              <div className="flex items-center text-sm bg-primary/80 px-3 py-1 rounded-full">
                <span>Rank {activeAnime.rank}</span>
              </div>
            )}
          </div>

          <Link to={`/anime${activeAnime.url.split(".tv")[1]}`}>
            <Button size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              <span>Watch Now</span>
            </Button>
          </Link>

          {/* Indicators */}
          {featuredAnime && featuredAnime.length > 1 && (
            <div className="flex mt-6 gap-2">
              {featuredAnime.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === index
                      ? "w-8 bg-primary"
                      : "w-3 bg-white/50"
                  }`}
                  aria-label={`Show featured anime ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
