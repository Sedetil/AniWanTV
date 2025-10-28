import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TopAnime, LatestAnime } from "@/api/animeApi";

interface AnimeCardProps {
  anime: TopAnime | LatestAnime | any; // Tambahkan any untuk mendukung data dari search
  className?: string;
  aspectRatio?: "portrait" | "square" | "video";
  width?: number;
  height?: number;
  viewType?: "grid" | "list";
  isDonghua?: boolean;
}

const AnimeCard = ({
  anime,
  className,
  aspectRatio = "portrait",
  width,
  height,
  viewType = "grid",
  isDonghua = false,
}: AnimeCardProps) => {
  const [imageError, setImageError] = useState(false);

  const aspectRatioClass = {
    portrait: "aspect-[2/3]",
    square: "aspect-square",
    video: "aspect-video",
  };

  const fallbackImage = "/placeholder.svg";

  // Check if anime has rating (TopAnime) or episode (LatestAnime)
  const isTopAnime = "rating" in anime;
  const isLatestAnime = "episode" in anime;
  
  // Check if anime has rating from search results
  const hasRating = anime.rating && anime.rating !== "N/A";

  return (
    <div
      className={cn(
        "group anime-card",
        viewType === "list" ? "flex flex-row h-24 md:h-32" : "flex-col",
        className
      )}
      style={{
        width: width ? `${width}px` : "auto",
        height: height ? `${height}px` : "auto",
      }}
    >
      {/* Card Image */}
      <div
        className={cn(
          "relative overflow-hidden",
          viewType === "list"
            ? "w-16 md:w-24 h-full"
            : aspectRatioClass[aspectRatio],
          "bg-muted"
        )}
      >
        <img
          src={
            imageError
              ? fallbackImage
              : anime.image_url?.startsWith("http")
              ? anime.image_url
              : `https:${anime.image_url}`
          }
          alt={anime.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full"
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>

        {/* Episode Badge (for Latest Anime) */}
        {isLatestAnime && anime.episode !== "N/A" && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-accent/80 text-xs font-medium"
          >
            {anime.episode}
          </Badge>
        )}

        {/* Rank Badge */}
        {anime.rank && anime.rank !== "N/A" && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-primary/80 text-xs font-medium"
          >
            {anime.rank}
          </Badge>
        )}
      </div>

      {/* Card Content */}
      <div
        className={cn("flex flex-col p-2", viewType === "list" ? "flex-1" : "")}
      >
        <h3 className="font-medium text-sm line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors">
          {anime.title}
        </h3>

        {/* Rating (for Top Anime and search results) */}
        {hasRating && (
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            <Star
              className="h-3 w-3 text-yellow-500 mr-1"
              fill="currentColor"
            />
            <span>{anime.rating}</span>
          </div>
        )}

        {/* Views and Duration (for Latest Anime) */}
        {isLatestAnime && (
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            {anime.views && anime.views !== "N/A" && (
              <span>{anime.views} views</span>
            )}
            {anime.views &&
              anime.views !== "N/A" &&
              anime.duration &&
              anime.duration !== "N/A" && <span className="mx-1">•</span>}
            {anime.duration && anime.duration !== "N/A" && (
              <span>{anime.duration}</span>
            )}
          </div>
        )}
      </div>

      {/* Full card is clickable, pass the title in navigation state */}
      <Link
        to={
          isDonghua
            ? `/donghua${anime.url.replace("https://animexin.dev", "")}`
            : anime.url.includes("winbu.tv")
              ? anime.url.split(".tv")[1]
              : anime.url
        }
        state={{ animeTitle: anime.title }} // Pass the title in the navigation state
        className="absolute inset-0"
        aria-label={anime.title}
      />
    </div>
  );
};

export default AnimeCard;
