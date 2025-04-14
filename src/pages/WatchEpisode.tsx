import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEpisodeStreams } from "@/api/animeApi";
import { ChevronLeft, Download, MessageSquare, Share2, ThumbsUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const WatchEpisode = () => {
  const { "*": slug } = useParams();
  const location = useLocation();
  const [iframeKey, setIframeKey] = useState(0);
  const [currentStreamUrl, setCurrentStreamUrl] = useState(null);
  const [useVideoTag, setUseVideoTag] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Construct full URL from the slug
  const episodeUrl = `https://winbu.tv${location.pathname}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ['episodeStream', episodeUrl],
    queryFn: () => fetchEpisodeStreams(episodeUrl),
    retry: 1,
  });

  // Validate stream URLs
  const isValidStreamUrl = (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.endsWith('.mp4') ||
      lowerUrl.endsWith('.m3u8') ||
      lowerUrl.endsWith('.mpd') ||
      lowerUrl.includes('/embed') ||
      lowerUrl.includes('/player') ||
      lowerUrl.includes('/stream') ||
      lowerUrl.includes('pixeldrain.com/api/file')
    );
  };

  // Check if URL is likely an embed player
  const isEmbedUrl = (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('/embed') || lowerUrl.includes('/player');
  };

  // Transform Pixeldrain URLs
  const transformPixeldrainUrl = (url) => {
    if (url.includes('pixeldrain.com/u/')) {
      const fileId = url.split('/u/')[1].split('?')[0];
      // Try embed URL first; fall back to direct stream if embed isn't supported
      return `https://pixeldrain.com/api/file/${fileId}`; // Remove ?download to avoid forcing download
    }
    return url;
  };

  // Get anime series URL
  const getAnimeUrl = () => {
    const urlParts = location.pathname.split('/');
    return urlParts.slice(0, -1).join('/');
  };

  // Set initial stream URL and handle fallbacks
  useEffect(() => {
    if (data) {
      let streamUrl = transformPixeldrainUrl(data.stream_url);
      let shouldUseVideoTag = false;

      // Prioritize embed URLs for iframe
      if (!streamUrl || !isValidStreamUrl(streamUrl) || !isEmbedUrl(streamUrl)) {
        console.warn("Main stream_url invalid or not an embed, checking alternatives...");
        // Try embed URLs from all_stream_sources
        streamUrl = data.all_stream_sources?.find(url => isEmbedUrl(transformPixeldrainUrl(url))) ||
                   data.direct_stream_urls?.find(stream => isEmbedUrl(transformPixeldrainUrl(stream.url)))?.url;
        
        // If no embed URL, try direct streams with <video> tag
        if (!streamUrl) {
          streamUrl = data.all_stream_sources?.find(url => isValidStreamUrl(transformPixeldrainUrl(url))) ||
                     data.direct_stream_urls?.find(stream => isValidStreamUrl(transformPixeldrainUrl(stream.url)))?.url ||
                     null;
          shouldUseVideoTag = streamUrl && !isEmbedUrl(streamUrl);
        }
      }

      console.log("Selected stream URL:", streamUrl, "Use video tag:", shouldUseVideoTag);
      setCurrentStreamUrl(streamUrl);
      setUseVideoTag(shouldUseVideoTag);
      setIframeKey(prev => prev + 1);
      setErrorMessage(null);
    }
  }, [data]);

  // Switch to a different stream URL
  const switchStream = (url) => {
    const transformedUrl = transformPixeldrainUrl(url);
    if (isValidStreamUrl(transformedUrl)) {
      const shouldUseVideoTag = !isEmbedUrl(transformedUrl);
      console.log("Switching to stream:", transformedUrl, "Use video tag:", shouldUseVideoTag);
      setCurrentStreamUrl(transformedUrl);
      setUseVideoTag(shouldUseVideoTag);
      setIframeKey(prev => prev + 1);
      setErrorMessage(null);
    } else {
      console.warn("Invalid stream URL:", transformedUrl);
      setErrorMessage("Selected stream source is invalid. Please try another source.");
    }
  };

  // Handle iframe or video loading errors
  const handleStreamError = () => {
    console.error("Stream failed to load:", currentStreamUrl);
    if (data?.all_stream_sources?.length > 1) {
      const nextUrl = data.all_stream_sources.find(url => url !== currentStreamUrl && isValidStreamUrl(transformPixeldrainUrl(url)));
      if (nextUrl) {
        console.log("Switching to next stream:", nextUrl);
        switchStream(nextUrl);
      } else {
        setErrorMessage("No valid stream sources available. Please try another episode or source.");
      }
    } else {
      setErrorMessage("Failed to load stream. No alternative sources available.");
    }
  };

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
              <div className="w-full aspect-video bg-muted-foreground/20 rounded-lg" />
              <div className="h-8 bg-muted-foreground/20 rounded w-3/4" />
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

  // No stream URLs available
  if (!currentStreamUrl &&
      (!data.all_stream_sources || data.all_stream_sources.length === 0) &&
      (!data.direct_stream_urls || data.direct_stream_urls.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">No Streams Available</h1>
            <p className="text-muted-foreground mb-6">We couldn't find any streams for this episode.</p>
            <Link to={getAnimeUrl()}>
              <Button>Back to Anime</Button>
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

          {/* Error message */}
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Video player */}
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-border">
            {currentStreamUrl ? (
              useVideoTag ? (
                <video
                  key={iframeKey}
                  src={currentStreamUrl}
                  title={data.title}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onError={handleStreamError}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  key={iframeKey}
                  src={currentStreamUrl}
                  title={data.title}
                  allowFullScreen
                  className="w-full h-full"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  onError={handleStreamError}
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">No stream available for this episode</p>
              </div>
            )}
          </div>

          {/* Episode title */}
          <h1 className="text-2xl font-bold">{data.title}</h1>

          {/* Stream source selector */}
          {(data.all_stream_sources && data.all_stream_sources.length > 1) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Stream Sources</h3>
              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Change Source</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Available Sources</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {data.all_stream_sources.map((url, index) => {
                      const transformedUrl = transformPixeldrainUrl(url);
                      return (
                        <DropdownMenuItem
                          key={index}
                          onClick={() => switchStream(url)}
                          className="cursor-pointer"
                          disabled={!isValidStreamUrl(transformedUrl)}
                        >
                          Source {index + 1}
                          {transformedUrl === currentStreamUrl && " (Current)"}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

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
                    <DropdownMenuGroup key={quality}>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          {quality}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
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
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Direct stream URLs */}
          {data.direct_stream_urls && data.direct_stream_urls.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Direct Stream Options</h3>
              <div className="flex flex-wrap gap-2">
                {data.direct_stream_urls.map((stream, idx) => {
                  const transformedUrl = transformPixeldrainUrl(stream.url);
                  return (
                    <Button
                      key={idx}
                      variant={currentStreamUrl === transformedUrl ? "default" : "secondary"}
                      size="sm"
                      onClick={() => switchStream(stream.url)}
                      disabled={!isValidStreamUrl(transformedUrl)}
                    >
                      {stream.quality} - {stream.host}
                    </Button>
                  );
                })}
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