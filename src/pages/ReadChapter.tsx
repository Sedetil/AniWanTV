import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { fetchChapterImages, fetchComicDetails } from "@/api/animeApi";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  List,
  ArrowUp,
  RotateCw,
  Menu,
  Settings,
  X,
  Maximize2,
  Minimize2,
  Music,
  Home,
  Book,
  Search
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHotkeys } from "react-hotkeys-hook";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const ReadChapter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Construct full URL from the slug for chapter images
  const chapterPath = location.pathname.replace("/read/", "");
  const chapterUrl = `https://komikindo4.com/${chapterPath}/`;
  const [showControls, setShowControls] = useState(true);
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<number, boolean>>({});
  const [imageErrorStatus, setImageErrorStatus] = useState<Record<number, boolean>>({});
  const [retryCount, setRetryCount] = useState<Record<number, number>>({});
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [showSettings, setShowSettings] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [readingMode, setReadingMode] = useState<"vertical" | "horizontal">(
    (localStorage.getItem("readingMode") as "vertical" | "horizontal") || "vertical"
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const getSlug = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 2];
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["chapterImages", chapterUrl],
    queryFn: () => fetchChapterImages(chapterUrl),
    enabled: !!chapterUrl,
    staleTime: 1000 * 60 * 5,
  });

  const { data: comicData, isLoading: isLoadingComic } = useQuery({
    queryKey: [
      "comicDetails",
      data?.navigation?.chapter_list ? getSlug(data.navigation.chapter_list) : "",
    ],
    queryFn: () => fetchComicDetails(data?.navigation?.chapter_list || ""),
    enabled: !!data?.navigation?.chapter_list,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Detect connection speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType || '4g';
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setConnectionSpeed('slow');
        } else if (effectiveType === '3g') {
          setConnectionSpeed('medium');
        } else {
          setConnectionSpeed('fast');
        }
      }
    }
  }, [chapterUrl]);

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

  useHotkeys("f", () => {
    setIsFullScreen((prev) => !prev);
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (!isFullScreen) {
        setShowControls(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollProgress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, [isFullScreen]);

  useEffect(() => {
    localStorage.setItem("readingMode", readingMode);
  }, [readingMode]);

  const handleImageLoad = (index: number) => {
    setImageLoadStatus((prev) => ({ ...prev, [index]: true }));
    setImageErrorStatus((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setImageErrorStatus((prev) => ({ ...prev, [index]: true }));
    
    // Auto-retry mechanism (max 3 retries)
    const currentRetryCount = retryCount[index] || 0;
    if (currentRetryCount < 3) {
      setTimeout(() => {
        setRetryCount((prev) => ({ ...prev, [index]: currentRetryCount + 1 }));
        // Force image reload by changing src
        const imgElement = document.getElementById(`chapter-img-${index}`) as HTMLImageElement;
        if (imgElement) {
          const originalSrc = imgElement.src;
          imgElement.src = '';
          setTimeout(() => {
            imgElement.src = originalSrc + `?retry=${currentRetryCount + 1}`;
          }, 100);
        }
      }, 1000 * (currentRetryCount + 1)); // Exponential backoff
    }
  };

  const manualRetryImage = (index: number) => {
    setImageErrorStatus((prev) => ({ ...prev, [index]: false }));
    setRetryCount((prev) => ({ ...prev, [index]: 0 }));
    
    const imgElement = document.getElementById(`chapter-img-${index}`) as HTMLImageElement;
    if (imgElement) {
      const originalSrc = imgElement.src.split('?')[0]; // Remove any retry params
      imgElement.src = '';
      setTimeout(() => {
        imgElement.src = originalSrc;
      }, 100);
    }
  };

  // Preload adjacent images for smoother reading experience
  const preloadAdjacentImages = (currentIndex: number) => {
    if (!data?.images) return;
    
    // Adjust preloading strategy based on connection speed
    let preloadIndices: number[] = [];
    
    if (connectionSpeed === 'slow') {
      // Only preload next image on slow connections
      preloadIndices = [currentIndex + 1];
    } else if (connectionSpeed === 'medium') {
      // Preload previous and next on medium connections
      preloadIndices = [currentIndex - 1, currentIndex + 1];
    } else {
      // Preload more aggressively on fast connections
      preloadIndices = [
        currentIndex - 1, // Previous image
        currentIndex + 1, // Next image
        currentIndex + 2, // Next next image
      ];
    }
    
    preloadIndices.forEach((index) => {
      if (
        index >= 0 &&
        index < data.images.length &&
        !preloadedImages.has(data.images[index].url)
      ) {
        const img = new Image();
        img.src = data.images[index].url;
        setPreloadedImages((prev) => new Set(prev).add(data.images[index].url));
      }
    });
  };

  // Preload images when component mounts or when current image loads
  useEffect(() => {
    const loadedIndexes = Object.keys(imageLoadStatus).filter(
      (index) => imageLoadStatus[parseInt(index)]
    );
    
    if (loadedIndexes.length > 0) {
      const lastIndex = Math.max(...loadedIndexes.map(Number));
      preloadAdjacentImages(lastIndex);
    }
  }, [imageLoadStatus, data?.images]);

  const calculateProgress = () => {
    if (!data?.images?.length) return 0;
    const loadedCount = Object.values(imageLoadStatus).filter(Boolean).length;
    return Math.round((loadedCount / data.images.length) * 100);
  };

  const openLoFiPlaylist = () => {
    window.open(
      "https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM?si=2c7b79e9d7e94e4b",
      "_blank"
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 pt-16 md:pt-20 lg:pt-24">
          <div className="container mx-auto px-4 py-6 sm:px-6 md:px-8 sm:py-8">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="mt-4 text-lg font-medium">Loading chapter...</p>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-64 sm:h-80 md:h-96 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching chapter images:", error);
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 pt-16 md:pt-20 lg:pt-24">
          <div className="container mx-auto px-4 py-6 sm:px-6 md:px-8 sm:py-8">
            <div className="text-center p-6 sm:p-8 rounded-lg shadow-lg bg-background border border-red-200 dark:border-red-800">
              <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-4">Error Loading Chapter</h2>
              <p className="mb-6 text-muted-foreground">
                {error.message || "Failed to load chapter images."}
              </p>
              <Button onClick={() => refetch()} className="inline-flex items-center">
                <RotateCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data) return null;

  const allImagesLoaded =
    data.images &&
    data.images.length > 0 &&
    Object.keys(imageLoadStatus).length === data.images.length &&
    Object.values(imageLoadStatus).every(Boolean);

  const filteredChapters = comicData?.chapters?.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isFullScreen && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm py-1">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${scrollProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      <main className={`flex-1 ${!isFullScreen ? "pt-16 sm:pt-20 md:pt-24" : "pt-0"} relative`}>
        {showSettings && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowSettings(false)}
          >
            <div
              className="bg-background rounded-lg shadow-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Reading Settings</h3>
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
                      className="flex-1 text-sm"
                    >
                      Vertical
                    </Button>
                    <Button
                      variant={readingMode === "horizontal" ? "default" : "outline"}
                      onClick={() => setReadingMode("horizontal")}
                      className="flex-1 text-sm"
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
                    <p>F: Toggle Full Screen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showChapterList && comicData && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowChapterList(false)}
          >
            <div
              className="bg-background rounded-lg shadow-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Book className="h-5 w-5 mr-2" />
                  <h3 className="text-base sm:text-lg font-semibold">Chapters</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowChapterList(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search chapters..."
                  className="w-full p-2 border border-muted rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[300px] md:h-[400px]">
                <div className="space-y-2 pr-4">
                  {filteredChapters?.map((chapter) => (
                    <Link
                      key={chapter.url}
                      to={`/read/${getSlug(chapter.url)}`}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setShowChapterList(false);
                      }}
                    >
                      <Card
                        className={`hover:bg-accent/50 transition-colors border-muted/50 ${
                          getSlug(chapter.url) === chapterPath
                            ? "bg-primary/10 border-primary/50"
                            : ""
                        }`}
                      >
                        <CardContent className="p-3 md:p-4 flex justify-between items-center">
                          <h4 className="font-medium text-sm md:text-base line-clamp-1">
                            {chapter.title}
                          </h4>
                          <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap ml-2">
                            {chapter.update_time}
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
        {!allImagesLoaded && data.images && data.images.length > 0 && !isFullScreen && (
          <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm py-1">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div className={`container mx-auto px-2 sm:px-4 md:px-6 ${isFullScreen ? "max-w-full px-0" : "py-4 sm:py-6 md:py-8"}`}>
          {!isFullScreen && (
            <div
              className={`flex flex-wrap justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-background/95 backdrop-blur-sm z-30 py-2 sm:py-3 gap-2 px-2 sm:px-4 rounded-lg shadow-sm transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate max-w-[120px] sm:max-w-[200px] md:max-w-[300px]">
                  {data.title}
                </h1>
              </div>
              <div className="flex gap-1 sm:gap-2 items-center flex-wrap flex-grow justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => setIsFullScreen(true)}
                  title="Enter Full Screen"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={openLoFiPlaylist}
                  title="Play Lo-Fi Music"
                >
                  <Music className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  title="Scroll to Top"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => setShowSettings(true)}
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {data.navigation?.prev_chapter && (
                  <Link
                    to={`/read/${getSlug(data.navigation.prev_chapter)}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs">
                      <ChevronLeft className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                  </Link>
                )}
                {data.navigation?.chapter_list && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 sm:h-8 text-xs"
                    onClick={() => setShowChapterList(true)}
                  >
                    <List className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Chapters</span>
                  </Button>
                )}
                {data.navigation?.next_chapter && (
                  <Link
                    to={`/read/${getSlug(data.navigation.next_chapter)}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <Button variant="default" size="sm" className="h-7 sm:h-8 text-xs">
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                  </Link>
                )}
                <Link to="/">
                  <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs">
                    <Home className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}
          {data.description && data.description !== "No description available" && !isFullScreen && (
            <div className="mb-4 sm:mb-6 text-sm sm:text-base text-muted-foreground bg-muted/30 p-3 sm:p-4 rounded-lg">
              <p>{data.description}</p>
            </div>
          )}
          <div className={`${readingMode === "horizontal" ? "flex overflow-x-auto snap-x snap-mandatory gap-2 sm:gap-4 pb-4 sm:pb-6" : "space-y-2 sm:space-y-4"}`}>
            {data.images && data.images.length > 0 ? (
              data.images.map((image, index) => (
                <div
                  key={index}
                  className={`flex justify-center ${readingMode === "horizontal" ? "snap-center min-w-full flex-shrink-0" : ""}`}
                >
                  <div className="relative w-full max-w-[800px]">
                    {/* Loading skeleton with retry indicator */}
                    {!imageLoadStatus[index] && !imageErrorStatus[index] && (
                      <div className="relative">
                        <Skeleton className="w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-md sm:rounded-lg" />
                        {(retryCount[index] || 0) > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md sm:rounded-lg">
                            <div className="text-center space-y-2">
                              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"></div>
                              <p className="text-sm text-muted-foreground">
                                Retrying... ({retryCount[index] || 0}/3)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Error state with retry button */}
                    {imageErrorStatus[index] && (
                      <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] flex flex-col items-center justify-center bg-muted/30 rounded-md sm:rounded-lg p-4">
                        <div className="text-center space-y-4">
                          <div className="text-muted-foreground">
                            <p className="text-lg font-medium">Failed to load image</p>
                            <p className="text-sm">Page {index + 1}</p>
                            <p className="text-xs mt-2">
                              Retry attempts: {retryCount[index] || 0}/3
                            </p>
                          </div>
                          <Button
                            onClick={() => manualRetryImage(index)}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <RotateCw className="h-4 w-4" />
                            Retry
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Actual image */}
                    <img
                      id={`chapter-img-${index}`}
                      src={image.url}
                      alt={image.alt || `Page ${index + 1}`}
                      className={`w-full h-auto object-contain rounded-md sm:rounded-lg transition-opacity duration-300 ${
                        imageLoadStatus[index] ? "opacity-100" : "opacity-0 absolute inset-0"
                      }`}
                      loading={connectionSpeed === 'slow' ? 'lazy' : 'eager'}
                      onLoad={() => {
                        console.log(`Image ${index} loaded successfully:`, image.url);
                        handleImageLoad(index);
                      }}
                      onError={(e) => {
                        console.error(`Failed to load image ${index}:`, image.url);
                        console.error('Error event:', e);
                        handleImageError(index);
                      }}
                      style={{
                        display: imageLoadStatus[index] || imageErrorStatus[index] ? "block" : "none",
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground bg-muted/30 p-6 sm:p-8 rounded-lg">
                <p>No images available for this chapter.</p>
              </div>
            )}
          </div>
          {!isFullScreen && (
            <div
              className={`fixed bottom-2 sm:bottom-4 left-2 right-2 sm:left-4 sm:right-4 bg-background/95 backdrop-blur-sm z-50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg shadow-lg transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="flex justify-between items-center max-w-4xl mx-auto">
                <div>
                  {data.navigation?.prev_chapter ? (
                    <Link
                      to={`/read/${getSlug(data.navigation.prev_chapter)}`}
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                      <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                    </Link>
                  ) : (
                    <div className="w-16 sm:w-20"></div>
                  )}
                </div>
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    title="Scroll to Top"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    onClick={() => setIsFullScreen(true)}
                    title="Enter Full Screen"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    onClick={openLoFiPlaylist}
                    title="Play Lo-Fi Music"
                  >
                    <Music className="h-4 w-4" />
                  </Button>
                  {data.navigation?.chapter_list && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      title="Chapter List"
                      onClick={() => setShowChapterList(true)}
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    onClick={() => setShowSettings(true)}
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  {data.navigation?.next_chapter ? (
                    <Link
                      to={`/read/${getSlug(data.navigation.next_chapter)}`}
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                      <Button variant="default" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  ) : (
                    <div className="w-16 sm:w-20"></div>
                  )}
                </div>
              </div>
            </div>
          )}
          {isFullScreen && (
            <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 bg-background/95 backdrop-blur-sm"
                onClick={() => setIsFullScreen(false)}
                title="Exit Full Screen"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReadChapter;