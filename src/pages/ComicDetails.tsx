import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "react-router-dom";
import { fetchComicDetails } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Calendar, Star, User, Book, Info } from "lucide-react";

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
  const getChapterSlug = (chapterUrl: string) => {
    const parts = chapterUrl.split("/");
    return parts[parts.length - 2];
  };

  // Function to extract the comic slug from the full URL
  const getComicSlug = (comicUrl: string) => {
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16 md:pt-20 lg:pt-24">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm mb-6 text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground font-medium truncate">{data.title}</span>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Comic Cover and Info */}
            <div className="w-full lg:w-[300px] flex flex-col">
              <div className="relative aspect-[2/3] w-full lg:w-[300px] overflow-hidden rounded-xl shadow-md">
                <img
                  src={data.image_url}
                  alt={data.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {data.status && (
                  <div className="absolute top-2 right-2">
                    <Badge className={`${data.status.toLowerCase() === 'ongoing' ? 'bg-green-500' : data.status.toLowerCase() === 'completed' ? 'bg-blue-500' : 'bg-amber-500'}`}>
                      {data.status}
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="mt-6 space-y-3 bg-card p-4 rounded-lg shadow-sm">
                <div className="grid grid-cols-2 gap-y-3">
                  {data.rating && (
                    <div className="flex items-center col-span-2">
                      <Star className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="font-medium">{data.rating}</span>
                    </div>
                  )}
                  
                  {data.author && (
                    <div className="flex items-center col-span-2">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Author: </span>
                        {data.author}
                      </span>
                    </div>
                  )}
                  
                  {data.illustrator && (
                    <div className="flex items-center col-span-2">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Illustrator: </span>
                        {data.illustrator}
                      </span>
                    </div>
                  )}
                  
                  {data.type && (
                    <div className="flex items-center">
                      <Book className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Type: </span>
                        {data.type}
                      </span>
                    </div>
                  )}
                  
                  {data.demographic && (
                    <div className="flex items-center">
                      <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Demographic: </span>
                        {data.demographic}
                      </span>
                    </div>
                  )}
                  
                  {data.last_updated && (
                    <div className="flex items-center col-span-2">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Updated: </span>
                        {data.last_updated}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comic Details */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{data.title}</h1>

              {data.alternative_titles?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Alternative Titles:</h3>
                  <p className="text-sm">
                    {data.alternative_titles.join(" • ")}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {data.genres?.map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="mb-8 bg-card p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Synopsis</h3>
                <p className="text-sm md:text-base text-muted-foreground whitespace-pre-line">
                  {data.synopsis || 'No synopsis available'}
                </p>
              </div>

              {/* Chapters List */}
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Book className="h-5 w-5 mr-2" />
                  Chapters
                </h3>
                
                <ScrollArea className="h-[300px] md:h-[400px]">
                  <div className="space-y-2 pr-4">
                    {data.chapters?.map((chapter) => (
                      <Link
                        key={chapter.url}
                        to={`/read/${getChapterSlug(chapter.url)}`}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} // Scroll to top on click
                      >
                        <Card className="hover:bg-accent/50 transition-colors border-muted/50">
                          <CardContent className="p-3 md:p-4 flex justify-between items-center">
                            <h4 className="font-medium text-sm md:text-base line-clamp-1">{chapter.title}</h4>
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

              {/* Related Comics */}
              {data.related_comics?.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Book className="h-5 w-5 mr-2" />
                    Related Comics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {data.related_comics.map((comic) => (
                      <Link
                        key={comic.url}
                        to={`/comic/${getComicSlug(comic.url)}`}
                        className="group"
                      >
                        <Card className="overflow-hidden border-muted/50 h-full transition-all group-hover:shadow-md">
                          <CardContent className="p-0 h-full flex flex-col">
                            <div className="relative aspect-[2/3] overflow-hidden">
                              <img
                                src={comic.image_url}
                                alt={comic.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            </div>
                            <div className="p-2 flex-grow">
                              <h4 className="font-medium line-clamp-2 text-xs md:text-sm group-hover:text-primary transition-colors">
                                {comic.title}
                              </h4>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComicDetails;