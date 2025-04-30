import { useQuery } from "@tanstack/react-query";
import { fetchLatestComics } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Import gambar bendera
import japanFlag from "@/assets/images/japan-flag.png";
import koreaFlag from "@/assets/images/korea-flag.png";
import chinaFlag from "@/assets/images/china-flag.png";

const LatestComics = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["latestComics", page],
    queryFn: () => fetchLatestComics(page),
  });

  // Fungsi untuk mendapatkan gambar bendera berdasarkan tipe komik
  const getFlagImage = (type) => {
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

  // Fungsi untuk mendapatkan alt text bendera
  const getFlagAltText = (type) => {
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

  // Fungsi untuk menangani perubahan halaman
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= (data?.total_pages || 1)) {
      setPage(newPage);
      // Scroll ke atas halaman
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fungsi untuk membuat array halaman yang akan ditampilkan
  const getPagination = () => {
    const totalPages = data?.total_pages || 1;
    const currentPage = page;
    let pages = [];
    
    // Selalu tampilkan halaman pertama
    pages.push(1);
    
    // Kalkulasi rentang halaman yang akan ditampilkan
    let start = Math.max(2, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);
    
    // Tambahkan ellipsis jika ada jarak dari halaman pertama
    if (start > 2) {
      pages.push('...');
    }
    
    // Tambahkan halaman di tengah
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Tambahkan ellipsis jika ada jarak ke halaman terakhir
    if (end < totalPages - 1) {
      pages.push('...');
    }
    
    // Selalu tampilkan halaman terakhir jika lebih dari 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Latest Comics</h1>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Skeleton className="h-[180px] sm:h-[220px] md:h-[260px] lg:h-[280px] w-full" />
                      <div className="p-2 sm:p-3 md:p-4">
                        <Skeleton className="h-3 sm:h-4 w-3/4 mb-1 sm:mb-2" />
                        <Skeleton className="h-2 sm:h-3 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : data?.comic_list.map((comic) => (
                  <Link
                    key={comic.url}
                    to={`/comic/${comic.url.replace(
                      "https://komikindo4.com/komik/",
                      ""
                    )}`}
                    className="block"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-0 relative">
                        {/* Ikon fire di pojok kiri atas */}
                        {comic.is_hot && (
                          <span className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center z-10 shadow-md">
                            <i className="fas fa-fire-alt text-[10px] sm:text-xs"></i>
                          </span>
                        )}
                        <div className="relative">
                          <img
                            src={comic.image_url}
                            alt={comic.title}
                            className="w-full h-[180px] sm:h-[220px] md:h-[260px] lg:h-[280px] object-cover"
                            loading="lazy"
                          />
                          {/* Overlay gradient untuk meningkatkan keterbacaan teks */}
                          <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-black/70 to-transparent"></div>
                          {/* Chapter update di bagian bawah gambar */}
                          <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2 flex justify-between items-center">
                            <span className="text-[10px] sm:text-xs text-white font-medium px-1 sm:px-2 py-0.5 sm:py-1 bg-black/50 rounded-md">
                              {comic.latest_chapter}
                            </span>
                            <span className="text-[10px] sm:text-xs text-white px-1 sm:px-2 py-0.5 sm:py-1 bg-black/50 rounded-md">
                              {comic.update_time}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 sm:p-3">
                          <h3 className="font-semibold line-clamp-2 mb-1 sm:mb-2 text-xs sm:text-sm">
                            {comic.title}
                          </h3>
                          <div className="flex flex-wrap gap-1 sm:gap-2 text-[10px] sm:text-xs">
                            <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md">
                              {getFlagImage(comic.type) && (
                                <img
                                  src={getFlagImage(comic.type)}
                                  alt={getFlagAltText(comic.type)}
                                  className="w-3 sm:w-4 h-2 sm:h-3 mr-0.5 sm:mr-1 inline-block object-cover"
                                />
                              )}
                              {comic.type}
                            </span>
                            {comic.is_colored && (
                              <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md">
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

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8">
              {/* Tampilkan tombol Previous hanya jika tidak berada di halaman 1 */}
              {page > 1 && (
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={isFetching}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
                >
                  &lt; Prev
                </Button>
              )}
              
              {getPagination().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`} className="mx-1">...</span>
                ) : (
                  <Button
                    key={`page-${pageNum}`}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isFetching}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    className="min-w-6 sm:min-w-8 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
                  >
                    {pageNum}
                  </Button>
                )
              ))}
              
              {/* Tampilkan tombol Next hanya jika tidak berada di halaman terakhir */}
              {page < data.total_pages && (
                <Button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={isFetching}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
                >
                  Next &gt;
                </Button>
              )}
            </div>
          )}
          
          <div className="text-center text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
            {data && `Page ${page} of ${data.total_pages}`}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LatestComics;