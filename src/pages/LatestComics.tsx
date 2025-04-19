import { useQuery } from "@tanstack/react-query";
import { fetchLatestComics } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LatestComics = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["latestComics", page],
    queryFn: () => fetchLatestComics(page),
  });

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
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
                            <span>{comic.type}</span>
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

          {data && data.current_page < data.total_pages && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={isFetching}
                variant="outline"
                size="lg"
              >
                {isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LatestComics;
