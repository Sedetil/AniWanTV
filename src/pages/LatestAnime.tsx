
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestAnime } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimeGrid from "@/components/AnimeGrid";

const LatestAnime = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['latestAnime', currentPage],
    queryFn: () => fetchLatestAnime(currentPage),
    placeholderData: (previousData) => previousData,
  });
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8">
          <AnimeGrid
            title="Latest Anime Releases"
            animeList={data?.anime_list || []}
            loading={isLoading}
            pagination={{
              currentPage: currentPage,
              totalPages: data?.total_pages || 1,
              onPageChange: handlePageChange,
            }}
            aspectRatio="portrait"
            viewType="grid"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LatestAnime;
