import { TopAnime, LatestAnime, LatestComic } from "@/api/animeApi";
import Carousel3D from "@/components/ui/Carousel3D";
import { Skeleton } from "@/components/ui/skeleton";

interface HeroSectionProps {
  featuredAnime: (TopAnime | LatestAnime)[] | null;
  featuredComics?: LatestComic[] | null;
  loading?: boolean;
}

const HeroSection = ({ featuredAnime, featuredComics, loading = false }: HeroSectionProps) => {
  // Combine anime and comics for the carousel
  const allFeaturedItems = [
    ...(featuredAnime || []),
    ...(featuredComics || [])
  ];

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

  if (!allFeaturedItems || allFeaturedItems.length === 0) {
    return null;
  }

  return (
    <Carousel3D
      items={allFeaturedItems}
      autoSlide={true}
      autoSlideInterval={5000}
      className="w-full"
    />
  );
};

export default HeroSection;
