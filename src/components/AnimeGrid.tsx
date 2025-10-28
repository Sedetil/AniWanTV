
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import AnimeCard from "./AnimeCard";
import AnimeCardSkeleton from "./AnimeCardSkeleton";
import { TopAnime, LatestAnime } from "@/api/animeApi";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AnimeGridProps {
  title: React.ReactNode;
  animeList: (TopAnime | LatestAnime | any)[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  aspectRatio?: "portrait" | "square" | "video";
  viewType?: "grid" | "list";
  isDonghua?: boolean;
}

const AnimeGrid = ({
  title,
  animeList = [],
  loading = false,
  pagination,
  aspectRatio = "portrait",
  viewType = "grid",
  isDonghua = false,
}: AnimeGridProps) => {
  const skeletonCount = 12;
  
  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };
  
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-foreground">{title}</div>
        
        {pagination && pagination.totalPages > 1 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1 px-2 text-sm">
              <span className="font-medium">{pagination.currentPage}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{pagination.totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <motion.div
        className={cn(
          "grid gap-4 overflow-x-hidden",
          viewType === "grid" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" : "",
          viewType === "list" ? "grid-cols-1" : ""
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loading
          ? Array(skeletonCount)
              .fill(0)
              .map((_, i) => (
                <AnimeCardSkeleton key={i} aspectRatio={aspectRatio} viewType={viewType} />
              ))
          : animeList.map((item, index) => {
              // Check if this is a comic
              const isComic = item.type === "comic";
              
              // Check if this is a donghua (from animexin)
              const isDonghua = item.url && item.url.includes('animexin.dev');
              
              // Create unique key by combining URL with index to avoid duplicates across tabs
              const uniqueKey = `${item.url}-${index}`;
              
              // Debug: Log item data untuk memverifikasi rating
              console.log(`AnimeGrid item ${index}:`, item);
              
              if (isComic) {
                return (
                  <motion.div
                    key={uniqueKey}
                    variants={itemVariants}
                    custom={index}
                  >
                    <ComicCard
                      comic={item}
                      aspectRatio={aspectRatio}
                      viewType={viewType}
                    />
                  </motion.div>
                );
              }
              
              return (
                <motion.div
                  key={uniqueKey}
                  variants={itemVariants}
                  custom={index}
                >
                  <AnimeCard
                    anime={item}
                    aspectRatio={aspectRatio}
                    viewType={viewType}
                    isDonghua={isDonghua}
                  />
                </motion.div>
              );
            })}
      </motion.div>
      
      {!loading && animeList.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No content found</p>
        </div>
      )}
    </div>
  );
};

// Comic Card Component
const ComicCard = ({ comic, aspectRatio = "portrait", viewType = "grid" }: {
  comic: any;
  aspectRatio?: "portrait" | "square" | "video";
  viewType?: "grid" | "list";
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Debug: Log comic data untuk memverifikasi rating
  console.log("ComicCard data:", comic);

  const aspectRatioClass = {
    portrait: "aspect-[2/3]",
    square: "aspect-square",
    video: "aspect-video",
  };

  const fallbackImage = "/placeholder.svg";

  return (
    <div
      className={cn(
        "group anime-card relative",
        viewType === "list" ? "flex flex-row h-24 md:h-32" : "flex-col",
      )}
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
              : comic.image_url?.startsWith("http")
              ? comic.image_url
              : `https:${comic.image_url}`
          }
          alt={comic.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />

        {/* Book Icon Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Card Content */}
      <div
        className={cn("flex flex-col p-2", viewType === "list" ? "flex-1" : "")}
      >
        <h3 className="font-medium text-sm line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors">
          {comic.title}
        </h3>
        
        {/* Rating untuk comic */}
        {comic.rating && comic.rating !== "N/A" && (
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            <Star
              className="h-3 w-3 text-yellow-500 mr-1"
              fill="currentColor"
            />
            <span>{comic.rating}</span>
          </div>
        )}
      </div>

      {/* Full card is clickable */}
      <Link
        to={`/comic/${comic.url.replace(
          "https://komikindo4.com/komik/",
          ""
        ).replace(
          "https://komikindo.ch/komik/",
          ""
        )}`}
        className="absolute inset-0"
        aria-label={comic.title}
      />
    </div>
  );
};


export default AnimeGrid;