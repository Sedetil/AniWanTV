
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTopAnime, fetchLatestAnime, TopAnime, LatestAnime } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import AnimeGrid from "@/components/AnimeGrid";

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
  
  // Set featured anime from top and latest anime
  useEffect(() => {
    if (topAnime && topAnime.length > 0) {
      // Get top 5 anime for featured section
      const featured = topAnime.slice(0, 5);
      setFeaturedAnime(featured);
    }
  }, [topAnime]);
  
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
              title="Top Anime"
              animeList={topAnime || []}
              loading={topLoading}
              aspectRatio="portrait"
              viewType="grid"
            />
          </section>
          
          {/* Latest Releases Section */}
          <section>
            <AnimeGrid
              title="Latest Releases"
              animeList={latestAnime?.anime_list || []}
              loading={latestLoading}
              aspectRatio="portrait"
              viewType="grid"
            />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
