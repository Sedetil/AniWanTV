import { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAnimeDetails,
  AnimeDetails as IAnimeDetails,
  AnimeEpisode,
} from "@/api/animeApi";
import { ChevronLeft, Play, Calendar, Star, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const AnimeDetails = () => {
  const { "*": slug } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Construct full URL from the slug
  const animeUrl = `https://winbu.tv${location.pathname}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ["animeDetails", animeUrl],
    queryFn: () => fetchAnimeDetails(animeUrl),
    retry: 1,
  });

  // Debugging: Log the fetched data
  console.log("Fetched anime details:", data);

  // Function to extract the correct path for navigation
  const getEpisodePath = (fullUrl: string) => {
    const path = fullUrl.replace("https://winbu.tv", "");
    if (path.includes("/episode/")) {
      return path;
    }
    return `/episode${path.endsWith("/") ? path.slice(0, -1) : path}`;
  };

  // Fallback image
  const backgroundImageUrl =
    data?.image_url && data.image_url !== "N/A"
      ? data.image_url
      : "https://via.placeholder.com/1920x1080?text=Anime+Banner";

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
            <h1 className="text-2xl font-bold mb-4">Error Loading Anime</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't load the details for this anime. Please try again later.
            </p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Group episodes by season or in chunks of 25
  const groupEpisodes = (episodes: AnimeEpisode[]) => {
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
      const groups: Record<string, AnimeEpisode[]> = {};
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
      const groups: Record<string, AnimeEpisode[]> = {};
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
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
              <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-lg border border-border">
                <img
                  src={
                    data.image_url && data.image_url !== "N/A"
                      ? data.image_url
                      : "https://via.placeholder.com/300x450?text=Anime+Poster"
                  }
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                {data.rating && data.rating !== "N/A" && (
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center">
                      <Star
                        className="h-4 w-4 text-yellow-500 mr-1"
                        fill="currentColor"
                      />
                      <span>{data.rating}</span>
                    </div>
                  </div>
                )}
                {data.release_date && data.release_date !== "N/A" && (
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">Released:</span>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{data.release_date}</span>
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
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{data.title || "Unknown Anime"}</h1>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="episodes">Episodes</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Synopsis</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {data.synopsis || "No synopsis available for this anime."}
                    </p>
                  </div>
                  {data.episodes && data.episodes.length > 0 && (
                    <div>
                      <Link to={getEpisodePath(data.episodes[0].url)}>
                        <Button className="gap-2">
                          <Play className="h-5 w-5" />
                          Start Watching
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="episodes" className="space-y-6">
                  {Object.keys(episodeGroups).length > 0 ? (
                    Object.entries(episodeGroups).map(([groupName, episodes]) => (
                      <div key={groupName} className="space-y-4">
                        <h3 className="text-lg font-semibold">{groupName}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                          {episodes.map((episode) => (
                            <Link
                              key={episode.url}
                              to={getEpisodePath(episode.url)}
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
                    ))
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

export default AnimeDetails;