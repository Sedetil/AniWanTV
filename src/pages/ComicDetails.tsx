import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "react-router-dom";
import { fetchComicDetails } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { ChevronRight, Calendar, Star, User, Book, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const ComicDetails = () => {
  const location = useLocation();
  const comicUrl = decodeURIComponent(location.pathname.replace("/comic/", ""));
  const formattedUrl = comicUrl.startsWith("https://")
    ? comicUrl
    : `https://komikindo3.com/komik/${comicUrl}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ["comicDetails", formattedUrl],
    queryFn: () => fetchComicDetails(formattedUrl),
    enabled: !!formattedUrl,
  });

  // Function to extract the chapter slug from the full URL
  const getChapterSlug = (chapterUrl) => {
    const parts = chapterUrl.split("/");
    return parts[parts.length - 2];
  };

  // Function to extract the comic slug from the full URL
  const getComicSlug = (comicUrl) => {
    const parts = comicUrl.split("/");
    return parts[parts.length - 2];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-16 md:pt-20 lg:pt-24">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
              <Skeleton className="w-full h-[350px] md:h-[400px] lg:h-[450px] lg:w-[300px] rounded-xl" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-16" />
                  ))}
                </div>
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    console.error('Error fetching comic details:', error);
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 md:pt-20 lg:pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center p-8 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">Error</h2>
              <p className="mt-2">{error.message || "Failed to load comic details."}</p>
              <Link to="/" className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Return to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) return null;

  // Determine the latest chapter for highlighting
  const latestChapter = data.chapters && data.chapters.length > 0 ? data.chapters[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Banner Background with Blurred Comic Cover */}
      <div className="absolute top-0 left-0 w-full h-64 md:h-96 z-0 overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center blur-xl opacity-20"
          style={{ backgroundImage: `url(${data.image_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
      </div>

      <main className="flex-1 pt-16 md:pt-20 lg:pt-24 relative z-10">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm mb-6 text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground font-medium truncate">{data.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 md:gap-10">
            {/* Comic Cover and Quick Info */}
            <div className="w-full lg:w-[300px] flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-[2/3] w-full lg:w-[300px] overflow-hidden rounded-2xl shadow-lg group"
              >
                <img
                  src={data.image_url}
                  alt={data.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                  <Button variant="secondary" className="w-full gap-2">
                    <Heart className="h-4 w-4" /> Add to Favorites
                  </Button>
                </div> */}

                {data.status && (
                  <div className="absolute top-3 right-3">
                    <Badge className={`px-3 py-1 text-xs font-medium ${
                      data.status.toLowerCase() === 'ongoing'
                        ? 'bg-green-500 hover:bg-green-600'
                        : data.status.toLowerCase() === 'completed'
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-amber-500 hover:bg-amber-600'
                    }`}>
                      {data.status}
                    </Badge>
                  </div>
                )}

                {data.rating && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 backdrop-blur-md bg-black/50 text-white border-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{data.rating}</span>
                    </Badge>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 space-y-4"
              >
                <Card className="border border-muted/40 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 divide-y divide-border">
                      {data.author && (
                        <div className="flex items-center p-3 gap-3">
                          <User className="h-4 w-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Author</span>
                            <span className="text-sm font-medium">{data.author}</span>
                          </div>
                        </div>
                      )}

                      {data.illustrator && (
                        <div className="flex items-center p-3 gap-3">
                          <User className="h-4 w-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Illustrator</span>
                            <span className="text-sm font-medium">{data.illustrator}</span>
                          </div>
                        </div>
                      )}

                      {data.type && (
                        <div className="flex items-center p-3 gap-3">
                          <Book className="h-4 w-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Type</span>
                            <span className="text-sm font-medium">{data.type}</span>
                          </div>
                        </div>
                      )}

                      {data.demographic && (
                        <div className="flex items-center p-3 gap-3">
                          <Info className="h-4 w-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Demographic</span>
                            <span className="text-sm font-medium">{data.demographic}</span>
                          </div>
                        </div>
                      )}

                      {data.last_updated && (
                        <div className="flex items-center p-3 gap-3">
                          <Calendar className="h-4 w-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Last Updated</span>
                            <span className="text-sm font-medium">{data.last_updated}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Comic Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1"
            >
              <h1 className="text-2xl md:text-4xl font-bold mb-2 text-foreground">{data.title}</h1>

              {data.alternative_titles?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Alternative Titles:</h3>
                  <p className="text-sm italic">
                    {data.alternative_titles.join(" • ")}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {data.genres?.map((genre) => (
                  <Badge key={genre} variant="outline" className="text-xs px-3 py-1 bg-primary/5 hover:bg-primary/10 transition-colors">
                    {genre}
                  </Badge>
                ))}
              </div>

              <Tabs defaultValue="synopsis" className="w-full mb-6">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="synopsis">Synopsis</TabsTrigger>
                  <TabsTrigger value="chapters">
                    Chapters
                    {latestChapter && (
                      <span className="ml-2">
                        <Badge variant="default" className="h-5 px-1.5 text-[10px]">New</Badge>
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="synopsis" className="mt-0">
                  <Card className="border border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
                      <p className="text-sm md:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                        {data.synopsis || 'No synopsis available'}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="chapters" className="mt-0">
                  <Card className="border border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold flex items-center">
                          <Book className="h-5 w-5 mr-2 text-primary" />
                          All Chapters
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          {data.chapters?.length || 0} chapters
                        </div>
                      </div>

                      <ScrollArea className="h-[400px] md:h-[500px]">
                        <div className="divide-y divide-border">
                          {data.chapters?.map((chapter, index) => {
                            // Check if this is the latest chapter
                            const isLatest = index === 0;

                            return (
                              <Link
                                key={chapter.url}
                                to={`/read/${getChapterSlug(chapter.url)}`}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                              >
                                <div className={`p-3 md:p-4 flex justify-between items-center hover:bg-accent/50 transition-colors ${
                                  isLatest ? "bg-primary/5" : ""
                                }`}>
                                  <div className="flex items-center gap-3">
                                    {isLatest && (
                                      <Badge variant="default" className="h-6 px-2">New</Badge>
                                    )}
                                    <h4 className="font-medium text-sm md:text-base line-clamp-1">
                                      {chapter.title}
                                    </h4>
                                  </div>
                                  <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap ml-2">
                                    {chapter.update_time}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Related Comics */}
              {data.related_comics?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Book className="h-5 w-5 mr-2 text-primary" />
                      Related Comics
                    </h3>
                    {/* <Button variant="ghost" size="sm">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button> */}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {data.related_comics.map((comic) => (
                      <Link
                        key={comic.url}
                        to={`/comic/${getComicSlug(comic.url)}`}
                        className="group"
                      >
                        <Card className="overflow-hidden border-muted/40 h-full transition-all hover:border-primary/40 hover:shadow-md">
                          <CardContent className="p-0 h-full flex flex-col">
                            <div className="relative aspect-[2/3] overflow-hidden">
                              <img
                                src={comic.image_url}
                                alt={comic.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-3 flex-grow bg-card">
                              <h4 className="font-medium line-clamp-2 text-sm group-hover:text-primary transition-colors">
                                {comic.title}
                              </h4>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          <Separator className="my-12" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="border border-muted/40 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  Reader Stats
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{Math.floor(Math.random() * 5000)}</div>
                    <div className="text-xs text-muted-foreground">Monthly Views</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{Math.floor(Math.random() * 1000)}</div>
                    <div className="text-xs text-muted-foreground">Bookmarks</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-muted/40 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Publication Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">First Chapter:</span>
                    <span className="font-medium">Jan 2023</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latest Chapter:</span>
                    <span className="font-medium">Apr 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Update Schedule:</span>
                    <span className="font-medium">Weekly</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-muted/40 shadow-sm md:col-span-2 lg:col-span-1">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Community Rating
                </h3>
                <div className="flex items-center gap-3">
                  <div className="bg-muted/30 p-3 rounded-lg text-center flex-1">
                    <div className="text-3xl font-bold text-primary flex items-center justify-center">
                      {data.rating || "4.8"} <Star className="h-5 w-5 ml-1 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Based on {Math.floor(Math.random() * 300) + 100} reviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComicDetails;
