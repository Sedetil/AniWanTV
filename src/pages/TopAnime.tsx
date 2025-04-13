
import { useQuery } from "@tanstack/react-query";
import { fetchTopAnime } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimeGrid from "@/components/AnimeGrid";

const TopAnime = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['topAnime'],
    queryFn: fetchTopAnime,
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8">
          <AnimeGrid
            title="Top Anime Series"
            animeList={data || []}
            loading={isLoading}
            aspectRatio="portrait"
            viewType="grid"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TopAnime;
