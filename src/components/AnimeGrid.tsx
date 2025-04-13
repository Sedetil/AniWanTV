
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimeCard from "./AnimeCard";
import AnimeCardSkeleton from "./AnimeCardSkeleton";
import { TopAnime, LatestAnime } from "@/api/animeApi";

interface AnimeGridProps {
  title: string;
  animeList: (TopAnime | LatestAnime)[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  aspectRatio?: "portrait" | "square" | "video";
  viewType?: "grid" | "list";
}

const AnimeGrid = ({
  title,
  animeList = [],
  loading = false,
  pagination,
  aspectRatio = "portrait",
  viewType = "grid",
}: AnimeGridProps) => {
  const skeletonCount = 12;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        
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
      
      <div className={cn(
        "grid gap-4",
        viewType === "grid" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" : "",
        viewType === "list" ? "grid-cols-1" : ""
      )}>
        {loading
          ? Array(skeletonCount)
              .fill(0)
              .map((_, i) => (
                <AnimeCardSkeleton key={i} aspectRatio={aspectRatio} viewType={viewType} />
              ))
          : animeList.map((anime) => (
              <AnimeCard
                key={anime.url}
                anime={anime}
                aspectRatio={aspectRatio}
                viewType={viewType}
              />
            ))}
      </div>
      
      {!loading && animeList.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No anime found</p>
        </div>
      )}
    </div>
  );
};

// Helper function for className merging
const cn = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default AnimeGrid;
