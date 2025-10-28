import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchAnime, searchComics, searchDonghua } from "@/api/animeApi";
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

  const { data: donghuaData, isLoading: isLoadingDonghua } = useQuery({
    queryKey: ["searchDonghua", initialQuery],
    queryFn: () => searchDonghua(initialQuery),
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

  // Debug: Log data asli dari API
  console.log("Raw anime data from API:", animeData);
  console.log("Raw comic data from API:", comicData);
  console.log("Raw donghua data from API:", donghuaData);

  const transformedAnimeResults = animeData
    ? animeData.map((anime) => ({
        ...anime,
        // Pertahankan rating asli jika ada, gunakan "N/A" hanya jika tidak ada
        rating: anime.rating || "N/A",
        rank: anime.rank || "N/A",
        episode: anime.episode || "N/A",
        views: anime.views || "N/A",
        duration: anime.duration || "N/A",
      }))
    : [];

  const transformedComicResults = comicData
    ? comicData.map((comic) => ({
        ...comic,
        // Pertahankan rating asli jika ada, gunakan "N/A" hanya jika tidak ada
        rating: comic.rating || "N/A",
        rank: comic.rank || "N/A",
        episode: comic.episode || "N/A",
        views: comic.views || "N/A",
        duration: comic.duration || "N/A",
        type: "comic" as const,
      }))
    : [];

  const transformedDonghuaResults = donghuaData
    ? donghuaData.map((donghua) => ({
        ...donghua,
        // Pastikan field yang diperlukan ada
        title: donghua.title,
        url: donghua.url,
        image_url: donghua.image, // AnimexinBasic menggunakan 'image' bukan 'image_url'
        // Pertahankan rating asli jika ada, gunakan "N/A" hanya jika tidak ada
        rating: donghua.rating || "N/A",
        rank: donghua.rank || "N/A",
        episode: donghua.episode || "N/A",
        views: donghua.views || "N/A",
        duration: donghua.duration || "N/A",
        type: "donghua" as const,
      }))
    : [];

  // Debug: Log hasil transformasi
  console.log("Transformed anime results:", transformedAnimeResults);
  console.log("Transformed comic results:", transformedComicResults);
  console.log("Transformed donghua results:", transformedDonghuaResults);

  const isLoading = isLoadingAnime || isLoadingComics || isLoadingDonghua;
  const hasResults = (animeData?.length || 0) + (comicData?.length || 0) + (donghuaData?.length || 0) > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-safe-area md:pb-0">
        <div className="container mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search anime, comics, or donghua..."
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
              <AnimeGrid
                title={<h2 className="text-2xl font-bold">Anime Results</h2>}
                animeList={transformedAnimeResults}
                loading={isLoadingAnime}
                aspectRatio="portrait"
                viewType="grid"
              />

              {/* Comic Results */}
              <AnimeGrid
                title={<h2 className="text-2xl font-bold">Comic Results</h2>}
                animeList={transformedComicResults}
                loading={isLoadingComics}
                aspectRatio="portrait"
                viewType="grid"
              />

              {/* Donghua Results */}
              <AnimeGrid
                title={<h2 className="text-2xl font-bold">Donghua Results</h2>}
                animeList={transformedDonghuaResults}
                loading={isLoadingDonghua}
                aspectRatio="portrait"
                viewType="grid"
                isDonghua={true}
              />
            </div>
          )}

          {/* No results message */}
          {!isLoading && initialQuery && !hasResults && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find any anime, comics, or donghua matching "{initialQuery}".
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
                Enter a search term to find your favorite anime, comics, and donghua.
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