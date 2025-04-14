import { useEffect, useState } from "react";
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
    queryKey: ["latestAnime", currentPage],
    queryFn: () => fetchLatestAnime(currentPage),
    placeholderData: (previousData) => previousData,
  });

  // Perhatikan perubahan di sini: matikan loading setelah data berubah
  useEffect(() => {
    setIsChangingPage(false);
  }, [data]);

  const handlePageChange = (page: number) => {
    setIsChangingPage(true);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8 relative">
          {/* Inline loading overlay (tidak fullscreen) */}
          {isChangingPage && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
              <div className="flex flex-col items-center gap-2">
                <Loader className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-foreground font-medium">
                  Memuat halaman {currentPage}...
                </p>
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
