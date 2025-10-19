import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchTopAnime, 
  fetchLatestAnime, 
  fetchLatestComics, 
  fetchPopularComics,
  TopAnime, 
  LatestAnime 
} from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AnimeGrid from "@/components/AnimeGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

// Import flag images
import japanFlag from "@/assets/images/japan-flag.png";
import koreaFlag from "@/assets/images/korea-flag.png";
import chinaFlag from "@/assets/images/china-flag.png";

const Index = () => {
  const [featuredAnime, setFeaturedAnime] = useState<(TopAnime | LatestAnime)[] | null>(null);
  
  const { data: topAnime, isLoading: topLoading } = useQuery({
    queryKey: ['topAnime'],
    queryFn: fetchTopAnime,
  });
  
  const { data: latestAnime, isLoading: latestLoading } = useQuery({
    queryKey: ['latestAnime', 1],
    queryFn: () => fetchLatestAnime(1),
  });

  const { data: latestComics, isLoading: latestComicsLoading } = useQuery({
    queryKey: ['latestComics', 1],
    queryFn: () => fetchLatestComics(1),
  });

  const { data: popularComics, isLoading: popularComicsLoading } = useQuery({
    queryKey: ['popularComics'],
    queryFn: fetchPopularComics,
  });
  
  // Set featured anime from top and latest anime
  useEffect(() => {
    if (topAnime && topAnime.length > 0) {
      // Get top 5 anime for featured section
      const featured = topAnime.slice(0, 5);
      setFeaturedAnime(featured);
    }
  }, [topAnime]);

  // Function to get flag image based on comic type
  const getFlagImage = (type: string) => {
    switch (type) {
      case "Manga":
        return japanFlag;
      case "Manhwa":
        return koreaFlag;
      case "Manhua":
        return chinaFlag;
      default:
        return null;
    }
  };

  // Function for flag alt text
  const getFlagAltText = (type: string) => {
    switch (type) {
      case "Manga":
        return "Japan Flag";
      case "Manhwa":
        return "South Korea Flag";
      case "Manhua":
        return "China Flag";
      default:
        return "Flag";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          featuredAnime={featuredAnime}
          loading={topLoading}
        />
        
        <div className="container mx-auto px-4 py-10 space-y-12">
          {/* Top Anime Section */}
          <section>
            <AnimeGrid
              title={
                <div className="text-2xl md:text-3xl font-bold relative">
                  Top Anime
                  <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary rounded-full"></span>
                </div>
              }
              animeList={topAnime || []}
              loading={topLoading}
              aspectRatio="portrait"
              viewType="grid"
            />
          </section>
          
          {/* Latest Releases Section */}
          <section>
            <AnimeGrid
              title={
                <div className="text-2xl md:text-3xl font-bold relative">
                  Latest Releases
                  <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary rounded-full"></span>
                </div>
              }
              animeList={latestAnime?.anime_list || []}
              loading={latestLoading}
              aspectRatio="portrait"
              viewType="grid"
            />
          </section>

          {/* Latest Comics Section with Modern Design */}
          <section className="relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold relative">
                Latest Comics
                <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary rounded-full"></span>
              </h2>
              <Link to="/comics" className="text-sm font-medium text-primary hover:underline flex items-center">
                View All <i className="fas fa-arrow-right ml-1 text-xs"></i>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {latestComicsLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <Skeleton className="h-48 md:h-56 w-full" />
                        <div className="p-2 md:p-3">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : latestComics?.comic_list.slice(0, 6).map((comic) => (
                    <Link
                      key={comic.url}
                      to={`/comic/${comic.url.match(/\/komik\/([^/]+)\/?$/)?.[1] || comic.url}`}
                      className="block"
                    >
                      <Card className="overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 h-full bg-card/80 backdrop-blur-sm border border-muted/50">
                        <CardContent className="p-0 relative">
                          {/* Hot icon */}
                          {comic.is_hot && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center z-10 shadow-md">
                              <i className="fas fa-fire-alt text-xs"></i>
                            </span>
                          )}
                          <div className="relative">
                            <img
                              src={comic.image_url}
                              alt={comic.title}
                              className="w-full h-48 md:h-56 object-cover"
                              loading="lazy"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent"></div>
                            {/* Chapter info */}
                            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                              <span className="text-xs text-white font-medium px-2 py-1 bg-black/50 rounded-md">
                                {comic.latest_chapter}
                              </span>
                              <span className="text-xs text-white px-2 py-1 bg-black/50 rounded-md">
                                {comic.update_time}
                              </span>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-semibold line-clamp-1 mb-2 text-sm">
                              {comic.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                {getFlagImage(comic.type) && (
                                  <img
                                    src={getFlagImage(comic.type)}
                                    alt={getFlagAltText(comic.type)}
                                    className="w-4 h-3 mr-1 inline-block object-cover"
                                  />
                                )}
                                {comic.type}
                              </span>
                              {comic.is_colored && (
                                <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-md">
                                  Colored
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
            </div>
          </section>

          {/* Popular Comics Section with Modern Design */}
          <section className="relative pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold relative">
                Popular Comics
                <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary rounded-full"></span>
              </h2>
              <Link to="/comics/popular" className="text-sm font-medium text-primary hover:underline flex items-center">
                View All <i className="fas fa-arrow-right ml-1 text-xs"></i>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {popularComicsLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <Skeleton className="h-48 md:h-56 w-full" />
                        <div className="p-2 md:p-3">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : popularComics?.slice(0, 6).map((comic) => (
                    <Link
                      key={comic.url}
                      to={`/comic/${comic.url.match(/\/komik\/([^/]+)\/?$/)?.[1] || comic.url}`}
                      className="block"
                    >
                      <Card className="overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 h-full bg-card/80 backdrop-blur-sm border border-muted/50">
                        <CardContent className="p-0 relative">
                          {/* Rank badge */}
                          <span className="absolute top-2 left-2 bg-amber-500 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center z-10 shadow-md text-xs">
                            #{comic.rank}
                          </span>
                          
                          <div className="relative">
                            <img
                              src={comic.image_url}
                              alt={comic.title}
                              className="w-full h-48 md:h-56 object-cover"
                              loading="lazy"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent"></div>
                            
                            {/* Rating badge */}
                            <div className="absolute bottom-2 right-2 flex items-center bg-black/50 px-2 py-1 rounded-md">
                              <i className="fas fa-star text-yellow-400 mr-1 text-xs"></i>
                              <span className="text-xs font-medium text-white">{comic.rating}</span>
                            </div>
                          </div>
                          
                          <div className="p-3">
                            <h3 className="font-semibold line-clamp-1 mb-2 text-sm">
                              {comic.title}
                            </h3>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                <i className="fas fa-user mr-1 text-xs"></i>
                                {comic.author || 'Unknown Author'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;