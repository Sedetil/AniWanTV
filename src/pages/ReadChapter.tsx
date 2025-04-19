import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { fetchChapterImages } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  List, 
  ArrowUp, 
  RotateCw, 
  Menu, 
  Settings, 
  X 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHotkeys } from "react-hotkeys-hook";

const ReadChapter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const chapterSlug = location.pathname.replace("/read/", "");
  const [showControls, setShowControls] = useState(true);
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<number, boolean>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [readingMode, setReadingMode] = useState<"vertical" | "horizontal">(
    localStorage.getItem("readingMode") as "vertical" | "horizontal" || "vertical"
  );

  // Function to extract the slug from a URL
  const getSlug = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 2]; // Assumes URL ends with a trailing slash
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["chapterImages", chapterSlug],
    queryFn: () => fetchChapterImages(chapterSlug),
    enabled: !!chapterSlug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle keyboard navigation
  useHotkeys("left", () => {
    if (data?.navigation?.prev_chapter) {
      navigate(`/read/${getSlug(data.navigation.prev_chapter)}`);
    }
  }, [data?.navigation?.prev_chapter]);

  useHotkeys("right", () => {
    if (data?.navigation?.next_chapter) {
      navigate(`/read/${getSlug(data.navigation.next_chapter)}`);
    }
  }, [data?.navigation?.next_chapter]);

  useHotkeys("esc", () => {
    if (data?.navigation?.chapter_list) {
      navigate(`/comic/${getSlug(data.navigation.chapter_list)}`);
    }
  }, [data?.navigation?.chapter_list]);

  // Toggle controls visibility on scroll
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  // Save reading mode preference
  useEffect(() => {
    localStorage.setItem("readingMode", readingMode);
  }, [readingMode]);

  // Track image loading status
  const handleImageLoad = (index: number) => {
    setImageLoadStatus(prev => ({ ...prev, [index]: true }));
  };

  // Calculate loading progress
  const calculateProgress = () => {
    if (!data?.images?.length) return 0;
    const loadedCount = Object.values(imageLoadStatus).filter(Boolean).length;
    return Math.round((loadedCount / data.images.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-16 md:pt-20 lg:pt-24">
          <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="mt-4 text-lg font-medium">Loading chapter...</p>
            </div>
            <div className="space-y-4 sm:space-y-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-64 sm:h-96 md:h-128 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    console.error('Error fetching chapter images:', error);
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-16 md:pt-20 lg:pt-24">
          <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <div className="text-center p-8 rounded-lg shadow-lg bg-background border border-red-200 dark:border-red-800">
              <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-4">Error Loading Chapter</h2>
              <p className="mb-6 text-muted-foreground">{error.message || "Failed to load chapter images."}</p>
              <Button onClick={() => refetch()} className="inline-flex items-center">
                <RotateCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) return null;

  const allImagesLoaded = data.images && 
    data.images.length > 0 && 
    Object.keys(imageLoadStatus).length === data.images.length && 
    Object.values(imageLoadStatus).every(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16 md:pt-20 lg:pt-24 relative">
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
            <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Reading Settings</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Reading Direction</p>
                  <div className="flex gap-2">
                    <Button 
                      variant={readingMode === "vertical" ? "default" : "outline"}
                      onClick={() => setReadingMode("vertical")}
                      className="flex-1"
                    >
                      Vertical
                    </Button>
                    <Button 
                      variant={readingMode === "horizontal" ? "default" : "outline"}
                      onClick={() => setReadingMode("horizontal")}
                      className="flex-1"
                    >
                      Horizontal
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2 text-sm font-medium">Keyboard Shortcuts</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>← Left Arrow: Previous Chapter</p>
                    <p>→ Right Arrow: Next Chapter</p>
                    <p>ESC: Return to Chapter List</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Progress */}
        {!allImagesLoaded && data.images && data.images.length > 0 && (
          <div className="fixed top-16 md:top-20 lg:top-24 left-0 right-0 z-40 bg-background/80 backdrop-blur py-1">
            <div className="container mx-auto px-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Chapter Navigation - Fixed at top */}
          <div 
            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 sticky top-16 md:top-20 lg:top-24 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30 py-2 sm:py-4 gap-3 sm:gap-0 px-2 rounded-lg shadow-sm transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold truncate max-w-[200px] sm:max-w-md lg:max-w-lg">{data.title}</h1>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4" />
              </Button>
              
              {data.navigation?.prev_chapter && (
                <Link to={`/read/${getSlug(data.navigation.prev_chapter)}`}>
                  <Button variant="outline" size="sm" className="h-8 sm:h-10">
                    <ChevronLeft className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                </Link>
              )}
              
              {data.navigation?.chapter_list && (
                <Link to={`/comic/${getSlug(data.navigation.chapter_list)}`}>
                  <Button variant="outline" size="sm" className="h-8 sm:h-10">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Chapters</span>
                  </Button>
                </Link>
              )}
              
              {data.navigation?.next_chapter && (
                <Link to={`/read/${getSlug(data.navigation.next_chapter)}`}>
                  <Button variant="default" size="sm" className="h-8 sm:h-10">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Chapter Description */}
          {data.description && data.description !== "No description available" && (
            <div className="mb-6 sm:mb-8 text-sm sm:text-base text-muted-foreground bg-muted/30 p-4 rounded-lg">
              <p>{data.description}</p>
            </div>
          )}

          {/* Chapter Images */}
          <div className={`${readingMode === "horizontal" ? "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6" : "space-y-2 sm:space-y-4"}`}>
            {data.images && data.images.length > 0 ? (
              data.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`flex justify-center ${readingMode === "horizontal" ? "snap-center min-w-full flex-shrink-0" : ""}`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `Page ${index + 1}`}
                    className="max-w-full h-auto object-contain rounded-lg"
                    loading="lazy"
                    onLoad={() => handleImageLoad(index)}
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground bg-muted/30 p-8 rounded-lg">
                <p>No images available for this chapter.</p>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div 
            className={`fixed bottom-4 sm:bottom-8 left-4 right-4 sm:left-8 sm:right-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 py-2 sm:py-4 px-4 sm:px-6 rounded-lg shadow-lg transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <div>
                {data.navigation?.prev_chapter ? (
                  <Link to={`/read/${getSlug(data.navigation.prev_chapter)}`}>
                    <Button variant="outline" size="sm" className="h-10">
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      <span>Previous</span>
                    </Button>
                  </Link>
                ) : (
                  <div className="w-24"></div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                
                {data.navigation?.chapter_list && (
                  <Link to={`/comic/${getSlug(data.navigation.chapter_list)}`}>
                    <Button variant="secondary" size="icon" className="h-10 w-10">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div>
                {data.navigation?.next_chapter ? (
                  <Link to={`/read/${getSlug(data.navigation.next_chapter)}`}>
                    <Button variant="default" size="sm" className="h-10">
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <div className="w-24"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReadChapter;