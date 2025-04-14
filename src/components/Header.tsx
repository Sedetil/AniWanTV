
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
      console.log(`Navigating to search with query: ${encodedQuery}`);
      navigate(`/search?q=${encodedQuery}`);
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gradient">AniWanTV</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-4">
              <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/latest" className="text-foreground/80 hover:text-primary transition-colors">
                Latest
              </Link>
              <Link to="/top" className="text-foreground/80 hover:text-primary transition-colors">
                Top Anime
              </Link>
            </nav>

            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search anime..."
                className="pl-9 w-[200px] md:w-[250px] h-9 bg-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </form>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-card px-4 py-5 animate-fade-in">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Input
              type="search"
              placeholder="Search anime..."
              className="pl-9 w-full h-9 bg-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </form>
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
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
