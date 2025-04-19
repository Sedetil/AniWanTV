import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchAnime, searchComics } from "@/api/animeApi";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimeGrid from "@/components/AnimeGrid";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const initialQuery = searchParams.get("q") || "";

  const { data: animeData, isLoading: isLoadingAnime } = useQuery({
    queryKey: ["searchAnime", initialQuery],
    queryFn: () => searchAnime(initialQuery),
    enabled: !!initialQuery,
  });

  const { data: comicData, isLoading: isLoadingComics } = useQuery({
    queryKey: ["searchComics", initialQuery],
    queryFn: () => searchComics(initialQuery),
    enabled: !!initialQuery,
  });

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      console.log("Searching for:", searchQuery);
    } else {
      toast.error("Please enter a search term");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  const transformedAnimeResults = animeData
    ? animeData.map((anime) => ({
        ...anime,
        rating: "N/A",
        rank: "N/A",
        episode: "N/A",
        views: "N/A",
        duration: "N/A",
      }))
    : [];

  const isLoading = isLoadingAnime || isLoadingComics;
  const hasResults = (animeData?.length || 0) + (comicData?.length || 0) > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search anime or comics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          {initialQuery && (
            <div className="space-y-8">
              {/* Anime Results */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Anime Results</h2>
                <AnimeGrid
                  animeList={transformedAnimeResults}
                  loading={isLoadingAnime}
                  aspectRatio="portrait"
                  viewType="grid"
                />
              </div>

              {/* Comic Results */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Comic Results</h2>
                {isLoadingComics ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardContent className="p-0">
                          <div className="h-[300px] bg-muted" />
                          <div className="p-4 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {comicData?.map((comic) => (
                      <Link
                        key={comic.url}
                        to={`/comic/${encodeURIComponent(comic.url)}`}
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
                              <Badge variant="secondary">Comic</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No results message */}
          {!isLoading && initialQuery && !hasResults && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find any anime or comics matching "{initialQuery}".
                Try a different search term.
              </p>
              <Link to="/">
                <Button variant="outline">Return to Home</Button>
              </Link>
            </div>
          )}

          {/* No search query message */}
          {!initialQuery && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Search</h2>
              <p className="text-muted-foreground">
                Enter a search term to find your favorite anime and comics.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
