import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAnimexinSeriesDetails,
  AnimexinSeriesDetails,
  AnimexinEpisode,
} from "@/api/animeApi";
import { ChevronLeft, Play, Calendar, Star, Tag, Bookmark as BookmarkIcon, BookmarkCheck, Globe, Clock, Tv, Languages } from "lucide-react";
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

const DonghuaDetails = () => {
  const { "*": slug } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isBookmarkedState, setIsBookmarkedState] = useState(false);
  const [bookmarkData, setBookmarkData] = useState<BookmarkType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BookmarkType["category"]>("Sedang Ditonton");

  // Retrieve the title passed from AnimeCard via navigation state
  const passedTitle = location.state?.animeTitle || "Unknown Title";

  // Normalize slug for consistent bookmark ID
  const normalizedSlug = slug ? slug.trim().toLowerCase() : "";

  // Construct full URL from the slug
  const donghuaUrl = `https://animexin.dev/${slug}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ["donghuaDetails", donghuaUrl],
    queryFn: () => fetchAnimexinSeriesDetails(donghuaUrl),
    retry: 1,
  });

  // Check if donghua is bookmarked
  useEffect(() => {
    if (normalizedSlug) {
      const bookmarked = isBookmarked(normalizedSlug);
      setIsBookmarkedState(bookmarked);
      
      if (bookmarked) {
        const bookmark = getBookmark(normalizedSlug);
        setBookmarkData(bookmark);
        setSelectedCategory(bookmark?.category || "Sedang Ditonton");
      }
    }
  }, [normalizedSlug]);

  // Determine the title to display
  const displayTitle = data?.title || passedTitle;

  // Function to extract the correct path for navigation
  const getEpisodePath = (fullUrl: string) => {
    const path = fullUrl.replace("https://animexin.dev", "");
    return `/donghua-episode${path}`;
  };

  // Fallback image
  const backgroundImageUrl =
    data?.image && data.image !== "N/A"
      ? data.image
      : "https://via.placeholder.com/1920x1080?text=Donghua+Banner";

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
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 lg:w-1/4 h-[400px] bg-muted-foreground/20 rounded-lg" />
                <div className="flex-1 space-y-6">
                  <div className="h-8 bg-muted-foreground/20 rounded w-3/4" />
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted-foreground/20 rounded w-full" />
                    <div className="h-4 bg-muted-foreground/20 rounded w-full" />
                    <div className="h-4 bg-muted-foreground/20 rounded w-2/3" />
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-6 bg-muted-foreground/20 rounded w-16"
                      />
                    ))}
                  </div>
                  <div className="h-10 bg-muted-foreground/20 rounded w-32" />
                </div>
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
            <h1 className="text-2xl font-bold mb-4">Error Loading Donghua</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't load the details for this donghua. Please try again
              later.
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

  // Group episodes by season or in chunks of 25
  const groupEpisodes = (episodes: AnimexinEpisode[]) => {
    if (episodes.length <= 25) {
      return { "All Episodes": episodes };
    }

    const seasonRegex = /season\s*(\d+)/i;
    let hasSeasons = false;

    for (const ep of episodes) {
      if (seasonRegex.test(ep.title.toLowerCase())) {
        hasSeasons = true;
        break;
      }
    }

    if (hasSeasons) {
      const groups: Record<string, AnimexinEpisode[]> = {};
      for (const ep of episodes) {
        const match = ep.title.toLowerCase().match(seasonRegex);
        const season = match ? `Season ${match[1]}` : "Other Episodes";
        if (!groups[season]) {
          groups[season] = [];
        }
        groups[season].push(ep);
      }
      return groups;
    } else {
      const groups: Record<string, AnimexinEpisode[]> = {};
      const chunkSize = 25;
      for (let i = 0; i < episodes.length; i += chunkSize) {
        const start = i + 1;
        const end = Math.min(i + chunkSize, episodes.length);
        const groupName = `Episodes ${start}-${end}`;
        groups[groupName] = episodes.slice(i, i + chunkSize);
      }
      return groups;
    }
  };

  const episodeGroups = groupEpisodes(data.episodes || []);

  const handleAddBookmark = () => {
    if (!data || !normalizedSlug) return;
    
    const bookmark = {
      id: normalizedSlug,
      title: displayTitle,
      type: "anime" as const,
      lastProgress: 0,
      category: selectedCategory || "Sedang Ditonton",
      imageUrl: backgroundImageUrl,
    };
    
    addBookmark(bookmark);
    setIsBookmarkedState(true);
    setBookmarkData(getBookmark(normalizedSlug));
    toast.success("Donghua added to bookmarks!");
  };

  const handleRemoveBookmark = () => {
    if (!normalizedSlug) return;
    
    removeBookmark(normalizedSlug);
    setIsBookmarkedState(false);
    setBookmarkData(null);
    toast.success("Donghua removed from bookmarks!");
  };

  const handleUpdateCategory = (category: BookmarkType["category"]) => {
    if (!normalizedSlug) return;
    
    updateCategory(normalizedSlug, category);
    const updated = getBookmark(normalizedSlug);
    setBookmarkData(updated);
    setSelectedCategory(category);
    toast.success("Bookmark category updated!");
  };

  const handleEpisodeClick = (episode: AnimexinEpisode) => {
    // Update progress when episode is clicked
    if (normalizedSlug) {
      // Check if bookmark exists, if not create it
      if (!isBookmarked(normalizedSlug)) {
        const bookmark = {
          id: normalizedSlug,
          title: displayTitle,
          type: "anime" as const,
          lastProgress: 0,
          category: "Sedang Ditonton" as const,
          imageUrl: backgroundImageUrl,
        };
        addBookmark(bookmark);
        setIsBookmarkedState(true);
        setBookmarkData(getBookmark(normalizedSlug));
      }
      
      // Update progress
      const episodeNumber = extractEpisodeNumber(episode.title);
      updateProgress(normalizedSlug, episodeNumber);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div
        className="w-full h-[30vh] md:h-[45vh] bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.8)), url("${backgroundImageUrl}")`,
          backgroundPosition: "center 25%",
          backgroundColor: "var(--background, #000)",
          backgroundSize: "cover",
        }}
      />
      <main className="flex-1 relative">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              to="/donghua"
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Donghua</span>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
              <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-lg border border-border">
                <img
                  src={
                    data.image && data.image !== "N/A"
                      ? data.image
                      : "https://via.placeholder.com/300x450?text=Donghua+Poster"
                  }
                  alt={displayTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                {data.status && data.status !== "N/A" && (
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline">{data.status}</Badge>
                  </div>
                )}
                {data.type && data.type !== "N/A" && (
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">Type:</span>
                    <div className="flex items-center">
                      <Tv className="h-4 w-4 mr-1" />
                      <span>{data.type}</span>
                    </div>
                  </div>
                )}
                {data.duration && data.duration !== "N/A" && (
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{data.duration}</span>
                    </div>
                  </div>
                )}
                {data.released && data.released !== "N/A" && (
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">Released:</span>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{data.released}</span>
                    </div>
                  </div>
                )}
                {data.country && data.country !== "N/A" && (
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">Country:</span>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <span>{data.country}</span>
                    </div>
                  </div>
                )}
                {data.genres && data.genres.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-muted-foreground">Genres:</span>
                      <Tag className="h-4 w-4" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.genres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="bg-primary/10 hover:bg-primary/20 text-primary dark:bg-muted dark:hover:bg-muted/80 dark:text-foreground"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{displayTitle}</h1>
              {data.alternate_title && data.alternate_title !== "N/A" && (
                <p className="text-muted-foreground mb-4">{data.alternate_title}</p>
              )}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="episodes">Episodes</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Synopsis</h2>
                    <div className="space-y-4">
                      {data.synopsis?.english && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">English</h3>
                          <p className="text-muted-foreground leading-relaxed text-base">
                            {data.synopsis.english}
                          </p>
                        </div>
                      )}
                      {data.synopsis?.indonesia && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">Indonesia</h3>
                          <p className="text-muted-foreground leading-relaxed text-base">
                            {data.synopsis.indonesia}
                          </p>
                        </div>
                      )}
                      {!data.synopsis?.english && !data.synopsis?.indonesia && (
                        <p className="text-muted-foreground leading-relaxed text-base">
                          No synopsis available for this donghua.
                        </p>
                      )}
                    </div>
                  </div>

                  {data.episodes && data.episodes.length > 0 && (
                    <div className="py-4">
                      <Link
                        to={getEpisodePath(data.episodes[0].url)}
                        state={{ episodeTitle: data.episodes[0].title }}
                        onClick={() => handleEpisodeClick(data.episodes[0])}
                      >
                        <Button size="lg" className="gap-3 px-8 py-3 text-base">
                          <Play className="h-5 w-5" />
                          Start Watching
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {/* Recommended Series Section */}
                  {data.recommended_series && data.recommended_series.length > 0 && (
                    <div className="space-y-6 pt-6">
                      <h2 className="text-2xl font-semibold">Recommended Series</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {data.recommended_series.map((series, index: number) => (
                          <Link
                            key={index}
                            to={`/donghua/${series.url.replace("https://animexin.dev/", "")}`}
                            className="group space-y-3"
                          >
                            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted shadow-md">
                              <img
                                src={
                                  series.image && series.image !== "N/A"
                                    ? series.image
                                    : "https://via.placeholder.com/300x450?text=Donghua+Poster"
                                }
                                alt={series.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                {series.title}
                              </h3>
                              {series.status && series.status !== "N/A" && (
                                <Badge variant="outline" className="text-xs">
                                  {series.status}
                                </Badge>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                </TabsContent>
                <TabsContent value="episodes" className="space-y-6">
                  {Object.keys(episodeGroups).length > 0 ? (
                    Object.entries(episodeGroups).map(
                      ([groupName, episodes]) => (
                        <div key={groupName} className="space-y-4">
                          <h3 className="text-lg font-semibold">{groupName}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                            {episodes.map((episode) => (
                              <Link
                                key={episode.url}
                                to={getEpisodePath(episode.url)}
                                state={{ episodeTitle: episode.title }}
                                onClick={() => handleEpisodeClick(episode)}
                                className="p-3 rounded-md bg-card hover:bg-card/80 border border-border flex items-center justify-between transition-colors"
                              >
                                <span className="text-foreground truncate">
                                  {episode.title}
                                </span>
                                <Play className="h-4 w-4 text-primary" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No episodes available
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonghuaDetails;