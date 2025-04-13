
import { cn } from "@/lib/utils";

interface AnimeCardSkeletonProps {
  className?: string;
  aspectRatio?: "portrait" | "square" | "video";
  viewType?: "grid" | "list";
}

const AnimeCardSkeleton = ({
  className,
  aspectRatio = "portrait",
  viewType = "grid"
}: AnimeCardSkeletonProps) => {
  const aspectRatioClass = {
    portrait: "aspect-[2/3]",
    square: "aspect-square",
    video: "aspect-video"
  };
  
  return (
    <div 
      className={cn(
        "rounded-md overflow-hidden animate-pulse",
        viewType === "list" ? "flex flex-row h-24 md:h-32" : "flex-col",
        className
      )}
    >
      {/* Image placeholder */}
      <div 
        className={cn(
          "bg-muted-foreground/20",
          viewType === "list" ? "w-16 md:w-24 h-full" : aspectRatioClass[aspectRatio]
        )}
      />
      
      {/* Content placeholder */}
      <div className={cn(
        "p-2",
        viewType === "list" ? "flex-1" : ""
      )}>
        {/* Title placeholder */}
        <div className="h-4 bg-muted-foreground/20 rounded w-full mb-2" />
        
        {/* Rating/Views placeholder */}
        <div className="h-3 bg-muted-foreground/20 rounded w-1/3" />
      </div>
    </div>
  );
};

export default AnimeCardSkeleton;
