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
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Popular Comics</h1>
          
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
              : data?.map((comic) => (
                  <Link
                    key={comic.url}
                    to={`/comic/${comic.url.replace('https://komikindo3.com/komik/', '')}`}
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
                          <h3 className="font-semibold line-clamp-2 mb-2">{comic.title}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span>Author: {comic.author}</span>
                            <span>Rating: {comic.rating}</span>
                            <span>Rank: {comic.rank}</span>
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