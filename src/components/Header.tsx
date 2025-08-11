import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "./ThemeToggle";
import {
  searchAnime,
  searchComics,
  AnimeBasic,
  ComicBasic,
} from "@/api/animeApi";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../hooks/useDebounce";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const navigate = useNavigate();

  const { data: animeResults } = useQuery({
    queryKey: ["searchAnime", debouncedSearch],
    queryFn: () => searchAnime(debouncedSearch),
    enabled: debouncedSearch.length > 2,
  });

  const { data: comicResults } = useQuery({
    queryKey: ["searchComics", debouncedSearch],
    queryFn: () => searchComics(debouncedSearch),
    enabled: debouncedSearch.length > 2,
  });

  useEffect(() => {
    setShowResults(
      debouncedSearch.length > 2 &&
        ((animeResults && animeResults.length > 0) ||
          (comicResults && comicResults.length > 0))
    );
  }, [debouncedSearch, animeResults, comicResults]);

  const handleResultClick = (url: string, title: string) => {
    let path = url
      .replace("https://winbu.tv", "")
      .replace("https://komikindo3.com", "")
      .replace("/komik", "");
  
    const newPath = url.includes("komikindo3.com") ? `/comic${path}` : path;
    
    navigate(newPath, { state: { title } });
  
    setTimeout(() => {
      setSearchQuery("");
      setShowResults(false);
      setIsOpen(false);
    }, 100);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      navigate(`/search?q=${encodedQuery}`);
      setSearchQuery("");
      setShowResults(false);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setShowResults(
      debouncedSearch.length > 2 &&
        ((animeResults && animeResults.length > 0) ||
          (comicResults && comicResults.length > 0))
    );
  }, [debouncedSearch, animeResults, comicResults]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md"
          : "bg-background/95"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gradient">AniWanTV</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <nav className="flex items-center space-x-2 xl:space-x-4">
              <Link
                to="/"
                className="text-foreground/80 hover:text-primary transition-colors text-sm xl:text-base"
              >
                Home
              </Link>
              <Link
                to="/latest"
                className="text-foreground/80 hover:text-primary transition-colors text-sm xl:text-base"
              >
                Latest
              </Link>
              <Link
                to="/top"
                className="text-foreground/80 hover:text-primary transition-colors text-sm xl:text-base"
              >
                Top Anime
              </Link>
              <Link
                to="/schedule"
                className="text-foreground/80 hover:text-primary transition-colors text-sm xl:text-base"
              >
                Schedule
              </Link>
              <Link
                to="/comics"
                className="text-foreground/80 hover:text-primary transition-colors text-sm xl:text-base"
              >
                Comics
              </Link>
              <Link
                to="/comics/popular"
                className="text-foreground/80 hover:text-primary transition-colors text-sm xl:text-base"
              >
                Popular
              </Link>
              <a
                href="https://github.com/Sedetil/AniWanTV-Mobile/releases/download/v1.0.0/app-arm64-v8a-release.apk"
                className="text-foreground/80 hover:text-primary transition-colors bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 xl:px-3 py-1 rounded-full text-xs xl:text-sm font-medium hover:from-blue-600 hover:to-purple-700 whitespace-nowrap"
                >
                📱 App
              </a>
            </nav>

            <div className="relative">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search anime..."
                  className="pl-9 w-[200px] md:w-[250px] h-9 bg-muted"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  onBlur={() => {
                    // Increased delay to ensure click events register properly
                    setTimeout(() => setShowResults(false), 300);
                  }}
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </form>
              {showResults &&
                (animeResults?.length > 0 || comicResults?.length > 0) && (
                  <div className="absolute top-full mt-1 w-full bg-popover rounded-md shadow-lg overflow-hidden z-50">
                    <div className="max-h-[300px] overflow-y-auto py-1">
                      {animeResults && animeResults.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-sm font-semibold text-muted-foreground bg-muted">
                            Anime
                          </div>
                          {animeResults.map(
                            (anime: AnimeBasic, index: number) => (
                              <button
                                key={index}
                                className="w-full px-4 py-2 text-left hover:bg-accent flex items-center space-x-2"
                                onClick={() =>
                                  handleResultClick(anime.url, anime.title)
                                }
                              >
                                <img
                                  src={anime.image_url}
                                  alt={anime.title}
                                  className="w-8 h-12 object-cover rounded"
                                />
                                <span className="flex-1 truncate">
                                  {anime.title}
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                      {comicResults && comicResults.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-sm font-semibold text-muted-foreground bg-muted">
                            Komik
                          </div>
                          {comicResults.map(
                            (comic: ComicBasic, index: number) => (
                              <button
                                key={index}
                                className="w-full px-4 py-2 text-left hover:bg-accent flex items-center space-x-2"
                                onClick={() =>
                                  handleResultClick(comic.url, comic.title)
                                }
                              >
                                <img
                                  src={comic.image_url}
                                  alt={comic.title}
                                  className="w-8 h-12 object-cover rounded"
                                />
                                <span className="flex-1 truncate">
                                  {comic.title}
                                </span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>

            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-card px-4 py-5 animate-fade-in">
          <div className="relative mb-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search anime & comics..."
                className="pl-9 w-full h-9 bg-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                onBlur={() => {
                  // Delay hiding results to allow click events to register
                  setTimeout(() => setShowResults(false), 200);
                }}
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </form>
            {showResults &&
              (animeResults?.length > 0 || comicResults?.length > 0) && (
                <div className="absolute top-full mt-1 w-full bg-popover rounded-md shadow-lg overflow-hidden z-50">
                  <div className="max-h-[300px] overflow-y-auto py-1">
                    {animeResults && animeResults.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-sm font-semibold text-muted-foreground bg-muted">
                          Anime
                        </div>
                        {animeResults.map(
                          (anime: AnimeBasic, index: number) => (
                            <button
                              key={index}
                              className="w-full px-4 py-2 text-left hover:bg-accent flex items-center space-x-2"
                              onClick={() =>
                                handleResultClick(anime.url, anime.title)
                              }
                            >
                              <img
                                src={anime.image_url}
                                alt={anime.title}
                                className="w-8 h-12 object-cover rounded"
                              />
                              <span className="flex-1 truncate">
                                {anime.title}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    )}
                    {comicResults && comicResults.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-sm font-semibold text-muted-foreground bg-muted">
                          Komik
                        </div>
                        {comicResults.map(
                          (comic: ComicBasic, index: number) => (
                            <button
                              key={index}
                              className="w-full px-4 py-2 text-left hover:bg-accent flex items-center space-x-2"
                              onClick={() =>
                                handleResultClick(comic.url, comic.title)
                              }
                            >
                              <img
                                src={comic.image_url}
                                alt={comic.title}
                                className="w-8 h-12 object-cover rounded"
                              />
                              <span className="flex-1 truncate">
                                {comic.title}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
          <nav className="flex flex-col space-y-4">
            <Link
              to="/"
              className="text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/latest"
              className="text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Latest
            </Link>
            <Link
              to="/top"
              className="text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Top Anime
            </Link>
            <Link
              to="/schedule"
              className="text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Jadwal Rilis
            </Link>
            <Link
              to="/comics"
              className="text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Latest Comics
            </Link>
            <Link
              to="/comics/popular"
              className="text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Popular Comics
            </Link>
            <a
              href="https://github.com/Sedetil/AniWanTV-Mobile/releases/download/v1.0.0/app-arm64-v8a-release.apk"
              className="text-foreground/80 hover:text-primary transition-colors bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-700 text-center"
            >
              📱 Download Aplikasi AniWanTV Mobile Sekarang
            </a>
            <div className="pt-2 border-t border-border">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
