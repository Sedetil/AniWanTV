import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchAnime } from "@/api/animeApi";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimeGrid from "@/components/AnimeGrid";
import { toast } from "sonner";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const initialQuery = searchParams.get("q") || "";

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["searchAnime", initialQuery],
    queryFn: () => searchAnime(initialQuery),
    enabled: !!initialQuery,
  });

  // Update search query when URL params change
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      refetch();
      console.log("Searching for:", searchQuery);
    } else {
      toast.error("Please enter a search term");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  // Transform the search results to match the expected type
  const transformedResults = data
    ? data.map((anime) => ({
        ...anime,
        rating: "N/A",
        rank: "N/A",
        episode: "N/A",
        views: "N/A",
        duration: "N/A",
      }))
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Search results */}
          {initialQuery && (
            <AnimeGrid
              title={`Search Results for "${initialQuery}"`}
              animeList={transformedResults}
              loading={isLoading}
              aspectRatio="portrait"
              viewType="grid"
            />
          )}

          {/* No results message */}
          {!isLoading && initialQuery && data && data.length === 0 && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find any anime matching "{initialQuery}". Try a
                different search term.
              </p>
              <Link to="/">
                <Button variant="outline">Return to Home</Button>
              </Link>
            </div>
          )}

          {/* No search query message */}
          {!initialQuery && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Search for Anime</h2>
              <p className="text-muted-foreground">
                Enter a search term to find your favorite anime.
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
