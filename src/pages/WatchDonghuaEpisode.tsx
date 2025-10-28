import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAnimexinEpisodeDetails,
  AnimexinEpisodeDetails,
} from "@/api/animeApi";
import { ChevronLeft, Play, ExternalLink, Share2, Bookmark as BookmarkIcon, BookmarkCheck, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
  getBookmark,
  updateCategory,
  updateProgress,
  extractEpisodeNumber,
} from "@/utils/bookmarkUtils";
import { Bookmark as BookmarkType } from "@/types/bookmark";
import { toast } from "sonner";

const WatchDonghuaEpisode = () => {
  const { "*": slug } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("watch");
  const [selectedServer, setSelectedServer] = useState(0);
  const [isBookmarkedState, setIsBookmarkedState] = useState(false);
  const [bookmarkData, setBookmarkData] = useState<BookmarkType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BookmarkType["category"]>("Sedang Ditonton");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Retrieve the title passed from navigation state
  const passedTitle = location.state?.episodeTitle || "Unknown Episode";

  // Normalize slug for consistent bookmark ID
  const normalizedSlug = slug ? slug.trim().toLowerCase() : "";

  // Construct full URL from the slug
  const episodeUrl = `https://animexin.dev/${slug}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ["donghuaEpisodeDetails", episodeUrl],
    queryFn: () => fetchAnimexinEpisodeDetails(episodeUrl),
    retry: 1,
  });

  // Check if series is bookmarked
  useEffect(() => {
    if (data?.series_url) {
      const seriesSlug = data.series_url.replace("https://animexin.dev/", "").trim().toLowerCase();
      const bookmarked = isBookmarked(seriesSlug);
      setIsBookmarkedState(bookmarked);
      
      if (bookmarked) {
        const bookmark = getBookmark(seriesSlug);
        setBookmarkData(bookmark);
        setSelectedCategory(bookmark?.category || "Sedang Ditonton");
      }
    }
  }, [data]);

  // Set default server when data loads
  useEffect(() => {
    if (data?.streaming_servers && data.streaming_servers.length > 0) {
      setSelectedServer(0);
    }
  }, [data]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Determine the title to display
  const displayTitle = data?.episode?.title || passedTitle;

  // Fallback image
  const backgroundImageUrl =
    "https://via.placeholder.com/1920x1080?text=Donghua+Episode";

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-muted-foreground/20 rounded-full" />
                <div className="h-6 bg-muted-foreground/20 rounded w-1/4" />
              </div>
              <div className="aspect-video bg-muted-foreground/20 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted-foreground/20 rounded w-3/4" />
                <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Episode</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't load this episode. Please try again later.
            </p>
            <Link to="/donghua">
              <Button>Return to Donghua</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddBookmark = () => {
    if (!data?.series_url) return;
    
    const seriesSlug = data.series_url.replace("https://animexin.dev/", "").trim().toLowerCase();
    
    const bookmark = {
      id: seriesSlug,
      title: data.series_title,
      type: "anime" as const,
      lastProgress: 0,
      category: selectedCategory || "Sedang Ditonton",
      imageUrl: backgroundImageUrl,
    };
    
    addBookmark(bookmark);
    setIsBookmarkedState(true);
    setBookmarkData(getBookmark(seriesSlug));
    toast.success("Donghua added to bookmarks!");
  };

  const handleRemoveBookmark = () => {
    if (!data?.series_url) return;
    
    const seriesSlug = data.series_url.replace("https://animexin.dev/", "").trim().toLowerCase();
    
    removeBookmark(seriesSlug);
    setIsBookmarkedState(false);
    setBookmarkData(null);
    toast.success("Donghua removed from bookmarks!");
  };

  const handleUpdateCategory = (category: BookmarkType["category"]) => {
    if (!data?.series_url) return;
    
    const seriesSlug = data.series_url.replace("https://animexin.dev/", "").trim().toLowerCase();
    
    updateCategory(seriesSlug, category);
    const updated = getBookmark(seriesSlug);
    setBookmarkData(updated);
    setSelectedCategory(category);
    toast.success("Bookmark category updated!");
  };

  const handleUpdateProgress = () => {
    if (!data?.series_url) return;
    
    const seriesSlug = data.series_url.replace("https://animexin.dev/", "").trim().toLowerCase();
    
    // Check if bookmark exists, if not create it
    if (!isBookmarked(seriesSlug)) {
      handleAddBookmark();
    }
    
    // Update progress
    const episodeNumber = extractEpisodeNumber(data.episode.title);
    updateProgress(seriesSlug, episodeNumber);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayTitle,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!isFullscreen) {
      // Check if it's a mobile device and request landscape orientation
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile && screen.orientation && (screen.orientation as any).lock) {
        (screen.orientation as any).lock('landscape').catch(() => {
          // Ignore errors if orientation lock is not supported or denied
        });
      }
      
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      } else if ((videoContainerRef.current as any).webkitRequestFullscreen) {
        (videoContainerRef.current as any).webkitRequestFullscreen();
      } else if ((videoContainerRef.current as any).mozRequestFullScreen) {
        (videoContainerRef.current as any).mozRequestFullScreen();
      } else if ((videoContainerRef.current as any).msRequestFullscreen) {
        (videoContainerRef.current as any).msRequestFullscreen();
      }
    } else {
      // Unlock orientation when exiting fullscreen on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile && screen.orientation && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
      }
      
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  };

  const currentServer = data.streaming_servers[selectedServer];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              to={`/donghua${data.series_url.replace("https://animexin.dev", "")}`}
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Donghua Details</span>
            </Link>
          </div>

          <div className="space-y-8">
            {/* Video Player Section */}
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold">{displayTitle}</h1>
              
              {/* Video Player */}
              <div
                ref={videoContainerRef}
                className="aspect-video bg-black rounded-lg overflow-hidden relative"
              >
                {currentServer && currentServer.url !== "Not Available" ? (
                  <>
                    <iframe
                      src={currentServer.url}
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture; presentation; encrypted-media; *"
                      frameBorder="0"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Video Player"
                      style={{ border: 'none' }}
                    />
                    {/* Fullscreen Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white border-white/20 min-h-[44px] min-w-[44px] md:min-h-[40px] md:min-w-[40px] z-10"
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <p className="text-white">Video source not available</p>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedServer((prev) => (prev + 1) % data.streaming_servers.length)}
                      >
                        Try Next Server
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Server Selection */}
              {data.streaming_servers.length > 1 && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Server:</span>
                  <Select
                    value={selectedServer.toString()}
                    onValueChange={(value) => setSelectedServer(parseInt(value))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {data.streaming_servers.map((server, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {server.server_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Episode Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="mb-6">
                    <TabsTrigger value="watch">Watch</TabsTrigger>
                    <TabsTrigger value="info">Episode Info</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="watch" className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="info" className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Episode Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Episode Number:</span>
                            <span>{data.episode.number}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtitle:</span>
                            <span>{data.episode.subtitle}</span>
                          </div>
                          {data.episode.release_date && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Release Date:</span>
                              <span>{data.episode.release_date}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                {/* Series Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Series Information</h3>
                  <div className="space-y-2">
                    <Link
                      to={`/donghua${data.series_url.replace("https://animexin.dev", "")}`}
                      className="text-primary hover:underline"
                    >
                      {data.series_title}
                    </Link>
                  </div>
                </div>

                {/* Bookmark Section */}
                <div className="space-y-3">
                  {isBookmarkedState ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookmarkCheck className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">Bookmarked</span>
                          {bookmarkData && (
                            <Badge variant="secondary" className="text-xs">
                              {bookmarkData.category}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveBookmark}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Category:</span>
                        <Select
                          value={selectedCategory}
                          onValueChange={(value) => handleUpdateCategory(value as BookmarkType["category"])}
                        >
                          <SelectTrigger className="h-8 text-xs w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sedang Ditonton">Sedang Ditonton</SelectItem>
                            <SelectItem value="Favorit">Favorit</SelectItem>
                            <SelectItem value="Selesai">Selesai</SelectItem>
                            <SelectItem value="Ingin Ditonton">Ingin Ditonton</SelectItem>
                            <SelectItem value="Ingin Dibaca">Ingin Dibaca</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {bookmarkData && bookmarkData.lastProgress > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Last watched: Episode {bookmarkData.lastProgress}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Category:</span>
                        <Select
                          value={selectedCategory}
                          onValueChange={(value) => setSelectedCategory(value as BookmarkType["category"])}
                        >
                          <SelectTrigger className="h-8 text-xs w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sedang Ditonton">Sedang Ditonton</SelectItem>
                            <SelectItem value="Favorit">Favorit</SelectItem>
                            <SelectItem value="Selesai">Selesai</SelectItem>
                            <SelectItem value="Ingin Ditonton">Ingin Ditonton</SelectItem>
                            <SelectItem value="Ingin Dibaca">Ingin Dibaca</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleAddBookmark}
                      >
                        <BookmarkIcon className="h-4 w-4" />
                        Add to Bookmarks
                      </Button>
                    </div>
                  )}
                </div>

                {/* Recommended Series */}
                {data.recommended_series && data.recommended_series.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recommended Series</h3>
                    <div className="space-y-3">
                      {data.recommended_series.slice(0, 5).map((series, index: number) => (
                        <Link
                          key={index}
                          to={`/donghua${series.url.replace("https://animexin.dev", "")}`}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors"
                        >
                          <div className="w-12 h-16 overflow-hidden rounded">
                            <img
                              src={
                                series.image && series.image !== "N/A"
                                  ? series.image
                                  : "https://via.placeholder.com/48x64?text=Donghua"
                              }
                              alt={series.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{series.title}</p>
                            {series.status && series.status !== "N/A" && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {series.status}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
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

export default WatchDonghuaEpisode;