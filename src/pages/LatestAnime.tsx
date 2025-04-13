
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestAnime } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimeGrid from "@/components/AnimeGrid";
import { Loader } from "lucide-react";

const LatestAnime = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['latestAnime', currentPage],
    queryFn: () => fetchLatestAnime(currentPage),
    placeholderData: (previousData) => previousData,
    onSettled: () => {
      setIsChangingPage(false);
    },
  });
  
  const handlePageChange = (page: number) => {
    setIsChangingPage(true);
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8">
          {isChangingPage && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-2">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <p className="text-foreground font-medium">Loading page {currentPage}...</p>
              </div>
            </div>
          )}
          
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
