import { useQuery } from "@tanstack/react-query";
import { fetchLatestComics } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Impor gambar bendera
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
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Latest Comics</h1>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <Skeleton className="h-[300px] w-full" />
                      <div className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : data?.comic_list.map((comic) => (
                  <Link
                    key={comic.url}
                    to={`/comic/${comic.url.replace(
                      "https://komikindo3.com/komik/",
                      ""
                    )}`}
                    className="block"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <img
                          src={comic.image_url}
                          alt={comic.title}
                          className="w-full h-[300px] object-cover"
                          loading="lazy"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-2 mb-2">
                            {comic.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              {getFlagImage(comic.type) && (
                                <img
                                  src={getFlagImage(comic.type)}
                                  alt={getFlagAltText(comic.type)}
                                  className="w-5 h-3 mr-1 inline-block object-cover"
                                />
                              )}
                              {comic.type}
                            </span>
                            {comic.is_colored && (
                              <span className="text-green-500">Colored</span>
                            )}
                            {comic.is_hot && (
                              <span className="text-red-500">Hot</span>
                            )}
                          </div>
                          <p className="text-sm mt-2">{comic.latest_chapter}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {comic.update_time}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {/* Tampilkan tombol Previous hanya jika tidak berada di halaman 1 */}
              {page > 1 && (
                <Button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={isFetching}
                  variant="outline"
                  size="sm"
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
                    className="min-w-8"
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
                >
                  Next &gt;
                </Button>
              )}
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground mt-4">
            {data && `Page ${page} of ${data.total_pages}`}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LatestComics;