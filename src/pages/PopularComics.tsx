import { useQuery } from "@tanstack/react-query";
import { fetchPopularComics } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PopularComics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["popularComics"],
    queryFn: fetchPopularComics,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 sm:pt-20 md:pt-24">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Popular Comics</h1>
          
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
              : data?.map((comic) => (
                  <Link
                    key={comic.url}
                    to={`/comic/${comic.url.replace('https://komikindo3.com/komik/', '')}`}
                    className="block"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-0 relative">
                        {/* Badge peringkat di pojok kiri atas */}
                        <span className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-amber-500 text-white font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex items-center justify-center z-10 shadow-md text-[10px] sm:text-xs md:text-sm">
                          #{comic.rank}
                        </span>
                        
                        <div className="relative">
                          <img
                            src={comic.image_url}
                            alt={comic.title}
                            className="w-full h-[180px] sm:h-[220px] md:h-[260px] lg:h-[280px] object-cover"
                            loading="lazy"
                          />
                          {/* Overlay gradient untuk meningkatkan keterbacaan teks */}
                          <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-black/70 to-transparent"></div>
                          
                          {/* Rating di bagian bawah gambar */}
                          <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 flex items-center bg-black/50 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md">
                            <i className="fas fa-star text-yellow-400 mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i>
                            <span className="text-[10px] sm:text-xs font-medium text-white">{comic.rating}</span>
                          </div>
                        </div>
                        
                        <div className="p-2 sm:p-3">
                          <h3 className="font-semibold line-clamp-2 mb-1 sm:mb-2 text-xs sm:text-sm">
                            {comic.title}
                          </h3>
                          <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground">
                            <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md">
                              <i className="fas fa-user mr-0.5 sm:mr-1 text-[10px] sm:text-xs"></i>
                              {comic.author || 'Unknown Author'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PopularComics;