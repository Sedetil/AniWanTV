import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "react-router-dom";
import { fetchComicDetails } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    return parts[parts.length - 2]; // Assuming URL is like https://komikindo3.com/the-crazy-genius-composer-returns-chapter-62/
  };

  // Function to extract the comic slug from the full URL
  const getComicSlug = (comicUrl: string) => {
    const parts = comicUrl.split("/");
    return parts[parts.length - 2]; // Assuming URL is like https://komikindo3.com/komik/magic-emperor/
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="w-[300px] h-[450px]" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2">
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
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-red-500">
              <h2 className="text-xl sm:text-2xl font-bold">Error</h2>
              <p>{error.message || "Failed to load comic details."}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Comic Cover and Info */}
            <div className="w-full md:w-[300px]">
              <img
                src={data.image_url}
                alt={data.title}
                className="w-full h-[450px] object-cover rounded-lg"
              />
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-semibold">Status:</span> {data.status || 'Unknown'}
                </p>
                <p>
                  <span className="font-semibold">Rating:</span> {data.rating || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Author:</span> {data.author || 'Unknown'}
                </p>
                <p>
                  <span className="font-semibold">Illustrator:</span>{" "}
                  {data.illustrator || 'Unknown'}
                </p>
                <p>
                  <span className="font-semibold">Type:</span> {data.type || 'Unknown'}
                </p>
                <p>
                  <span className="font-semibold">Demographic:</span>{" "}
                  {data.demographic || 'Unknown'}
                </p>
                <p>
                  <span className="font-semibold">Last Updated:</span>{" "}
                  {data.last_updated || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Comic Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{data.title}</h1>

              {data.alternative_titles?.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Alternative Titles:</h3>
                  <p className="text-muted-foreground">
                    {data.alternative_titles.join(" • ")}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {data.genres?.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-2">Synopsis</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {data.synopsis || 'No synopsis available'}
                </p>
              </div>

              {/* Chapters List */}
              <div>
                <h3 className="font-semibold mb-4">Chapters</h3>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-2">
                    {data.chapters?.map((chapter) => (
                      <Link
                        key={chapter.url}
                        to={`/read/${getChapterSlug(chapter.url)}`}
                      >
                        <Card className="hover:bg-accent transition-colors">
                          <CardContent className="p-4 flex justify-between items-center">
                            <h4 className="font-medium">{chapter.title}</h4>
                            <span className="text-sm text-muted-foreground">
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
                  <h3 className="font-semibold mb-4">Related Comics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {data.related_comics.map((comic) => (
                      <Link
                        key={comic.url}
                        to={`/comic/${getComicSlug(comic.url)}`}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <CardContent className="p-0">
                            <img
                              src={comic.image_url}
                              alt={comic.title}
                              className="w-full h-[200px] object-cover"
                              loading="lazy"
                            />
                            <div className="p-2">
                              <h4 className="font-medium line-clamp-2 text-sm">
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