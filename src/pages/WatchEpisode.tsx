
import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEpisodeStreams } from "@/api/animeApi";
import { ChevronLeft, Download, MessageSquare, Share2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const WatchEpisode = () => {
  const { "*": slug } = useParams<{ "*": string }>();
  const location = useLocation();
  const [iframeKey, setIframeKey] = useState(0);
  
  // Construct full URL from the slug
  const episodeUrl = `https://winbu.tv${location.pathname}`;
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['episodeStream', episodeUrl],
    queryFn: () => fetchEpisodeStreams(episodeUrl),
    retry: 1,
  });
  
  // Extract anime series URL from episode URL
  const getAnimeUrl = () => {
    const urlParts = location.pathname.split('/');
    return urlParts.slice(0, -1).join('/');
  };
  
  // Reload iframe when data changes
  useEffect(() => {
    if (data) {
      setIframeKey(prev => prev + 1);
    }
  }, [data?.stream_url]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              {/* Back button */}
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-muted-foreground/20 rounded-full" />
                <div className="h-6 bg-muted-foreground/20 rounded w-1/4" />
              </div>
              
              {/* Video placeholder */}
              <div className="w-full aspect-video bg-muted-foreground/20 rounded-lg" />
              
              {/* Title placeholder */}
              <div className="h-8 bg-muted-foreground/20 rounded w-3/4" />
              
              {/* Controls placeholder */}
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 w-10 bg-muted-foreground/20 rounded-full" />
                  ))}
                </div>
                <div className="h-10 w-32 bg-muted-foreground/20 rounded" />
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
            <p className="text-muted-foreground mb-6">We couldn't load this episode. Please try again later.</p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Render the video player with controls
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Back button */}
          <div>
            <Link to={getAnimeUrl()} className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Anime</span>
            </Link>
          </div>
          
          {/* Video player */}
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-border">
            {data.stream_url ? (
              <iframe
                key={iframeKey}
                src={data.stream_url}
                title={data.title}
                allowFullScreen
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">No stream available for this episode</p>
              </div>
            )}
          </div>
          
          {/* Episode title */}
          <h1 className="text-2xl font-bold">{data.title}</h1>
          
          {/* Player controls */}
          <div className="flex flex-wrap justify-between items-center gap-4 border-t border-b border-border py-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsUp className="h-4 w-4" />
                <span className="hidden sm:inline">Like</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Comment</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
            
            {/* Download dropdown */}
            {Object.keys(data.download_links).length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Download Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {Object.entries(data.download_links).map(([quality, links]) => (
                    <div key={quality}>
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        {quality}
                      </DropdownMenuLabel>
                      {links.map((link) => (
                        <DropdownMenuItem key={link.url} asChild>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="cursor-pointer"
                          >
                            {link.host}
                          </a>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Player options */}
          {data.player_options && data.player_options.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Player Options</h3>
              <div className="flex flex-wrap gap-2">
                {data.player_options.map((option) => (
                  <Button key={option} variant="secondary" size="sm">
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WatchEpisode;
