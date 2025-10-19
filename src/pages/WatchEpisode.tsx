import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEpisodeStreams } from "@/api/animeApi";
import {
  ChevronLeft,
  Download,
  MessageSquare,
  Share2,
  ThumbsUp,
  RefreshCw,
} from "lucide-react";
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
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import VideoPlayer from "@/components/VideoPlayer";

const WatchEpisode = () => {
  const { "*": slug } = useParams();
  const location = useLocation();
  const [iframeKey, setIframeKey] = useState(0);
  const [currentStreamUrl, setCurrentStreamUrl] = useState(null);
  const [useVideoTag, setUseVideoTag] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Mengambil judul episode dari state navigasi
  const episodeTitle = location.state?.episodeTitle || "Unknown Episode";

  const handleShare = async () => {
    const shareData = {
      title: episodeTitle || "Tonton Anime",
      text: `Tonton ${episodeTitle} di AniWanTV`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        setErrorMessage("Link berhasil disalin ke clipboard!");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      setErrorMessage("Gagal membagikan konten");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const episodeUrl = `https://winbu.tv${location.pathname}`;

  const { data, isLoading, error } = useQuery({
    queryKey: ["episodeStream", episodeUrl],
    queryFn: () => fetchEpisodeStreams(episodeUrl),
    retry: 1,
  });

  const isValidStreamUrl = (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.endsWith(".mp4") ||
      lowerUrl.endsWith(".m3u8") ||
      lowerUrl.endsWith(".mpd") ||
      lowerUrl.includes("/embed") ||
      lowerUrl.includes("/player") ||
      lowerUrl.includes("/stream") ||
      lowerUrl.includes("krakenfiles.com/embed-video") ||
      lowerUrl.includes("mega.nz/embed") ||
      lowerUrl.includes("pixeldrain.com")
    );
  };

  const isEmbedUrl = (url) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.includes("/embed") ||
      lowerUrl.includes("/player") ||
      lowerUrl.includes("krakenfiles.com/embed-video") ||
      lowerUrl.includes("mega.nz/embed")
    );
  };

  const getSandboxAttribute = (url) => {
    if (!url) return "allow-scripts allow-same-origin allow-forms allow-popups";
    const lowerUrl = url.toLowerCase();
    if (
      lowerUrl.includes("krakenfiles.com/embed-video") ||
      lowerUrl.includes("mega.nz/embed")
    ) {
      console.log(`Removing sandbox for trusted URL: ${url}`);
      return null;
    }
    return "allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-modals";
  };

  const transformUrl = (url) => {
    if (!url) return url;
    console.log(`Transforming URL: ${url}`);

    if (url.includes("pixeldrain.com/u/")) {
      const fileId = url.split("/u/")[1].split("?")[0];
      const transformed = `https://pixeldrain.com/api/file/${fileId}`;
      console.log(`Transformed PixelDrain URL to: ${transformed}`);
      return transformed;
    }

    if (url.includes("mega.nz/file/")) {
      const parts = url.split("/file/");
      if (parts.length > 1) {
        const fileId = parts[1].split("#")[0];
        const embedUrl = `https://mega.nz/embed/${fileId}`;
        console.log(`Transformed Mega file URL to embed: ${embedUrl}`);
        return embedUrl;
      }
    }

    console.log(`URL passed through unchanged: ${url}`);
    return url;
  };

  const getAnimeUrl = () => {
    const path = location.pathname;
    if (path.startsWith("/episode/")) {
      // Ambil slug episode lalu potong sebelum "-episode-..."
      const episodeSlug = path.replace("/episode/", "").replace(/\/+$/, "");
      const baseSlug = episodeSlug.replace(/-episode-.+$/i, "");
      return `/anime/${baseSlug}/`;
    }
    // Fallback: jika sudah di /anime/ kembalikan path, jika tidak, pulang ke beranda
    if (path.startsWith("/anime/")) return path;
    if (path.startsWith("/episode/")) return path.replace(/^\/episode\//, "/anime/");
    return "/";
  };


  useEffect(() => {
    if (data) {
      console.log("Backend response:", JSON.stringify(data, null, 2));

      let streamUrl = null;
      let shouldUseVideoTag = false;

      console.log(
        "All stream sources:",
        data.all_stream_sources?.map(transformUrl) || []
      );
      console.log(
        "Direct stream URLs:",
        data.direct_stream_urls?.map((s) => ({
          quality: s.quality,
          host: s.host,
          url: transformUrl(s.url),
        })) || []
      );

      // Prioritize PixelDrain streams from direct_stream_urls (any quality)
      const pixeldrainStream = data.direct_stream_urls?.find(
        (stream) => stream.host.toLowerCase().includes("pixeldrain")
      );

      if (pixeldrainStream && isValidStreamUrl(pixeldrainStream.url)) {
        streamUrl = transformUrl(pixeldrainStream.url);
        shouldUseVideoTag = !isEmbedUrl(streamUrl);
        console.log("Selected PixelDrain stream:", streamUrl, `(${pixeldrainStream.quality})`);
      }
      // Fallback to 480p Krakenfiles from direct_stream_urls
      else {
        const kraken480pStream = data.direct_stream_urls?.find(
          (stream) =>
            stream.quality === "480p" &&
            stream.host.toLowerCase().includes("krakenfiles")
        );

        if (kraken480pStream && isValidStreamUrl(kraken480pStream.url)) {
          streamUrl = transformUrl(kraken480pStream.url);
          shouldUseVideoTag = !isEmbedUrl(streamUrl);
          console.log("Selected 480p Krakenfiles stream:", streamUrl);
        } else {
          console.warn(
            "No PixelDrain or 480p Krakenfiles stream found, falling back to other sources..."
          );
          // Fallback to embed URLs
          streamUrl =
            data.stream_url && isEmbedUrl(data.stream_url)
              ? transformUrl(data.stream_url)
              : data.all_stream_sources?.find((url) =>
                  isEmbedUrl(transformUrl(url))
                ) ||
                data.direct_stream_urls?.find((stream) =>
                  isEmbedUrl(transformUrl(stream.url))
                )?.url ||
                // Then any valid stream
                data.all_stream_sources?.find((url) =>
                  isValidStreamUrl(transformUrl(url))
                ) ||
                data.direct_stream_urls?.find((stream) =>
                  isValidStreamUrl(transformUrl(stream.url))
                )?.url ||
                null;

          shouldUseVideoTag = streamUrl && !isEmbedUrl(streamUrl);
        }
      }

      console.log(
        "Final selected stream URL:",
        streamUrl,
        "Use video tag:",
        shouldUseVideoTag
      );

      if (!streamUrl) {
        console.error("No valid stream URL selected");
        setErrorMessage("No playable stream found. Please try another source.");
      } else {
        setCurrentStreamUrl(streamUrl);
        setUseVideoTag(shouldUseVideoTag);
        setIframeKey((prev) => prev + 1);
        setErrorMessage(null);
      }
    }
  }, [data]);

  const switchStream = (url) => {
    const transformedUrl = transformUrl(url);
    if (isValidStreamUrl(transformedUrl)) {
      const shouldUseVideoTag = !isEmbedUrl(transformedUrl);
      console.log(
        "Switching to stream:",
        transformedUrl,
        "Use video tag:",
        shouldUseVideoTag
      );
      setCurrentStreamUrl(transformedUrl);
      setUseVideoTag(shouldUseVideoTag);
      setIframeKey((prev) => prev + 1);
      setErrorMessage(null);
    } else {
      console.warn("Invalid stream URL:", transformedUrl);
      setErrorMessage(
        "Selected stream source is invalid. Please try another source."
      );
    }
  };

  const handleStreamError = () => {
    console.error("Stream failed to load:", currentStreamUrl);
    if (data?.all_stream_sources?.length > 1) {
      const nextUrl = data.all_stream_sources.find(
        (url) => url !== currentStreamUrl && isValidStreamUrl(transformUrl(url))
      );
      if (nextUrl) {
        console.log("Switching to next stream:", nextUrl);
        switchStream(nextUrl);
      } else {
        setErrorMessage(
          "No valid stream sources available. Please try another episode or source."
        );
      }
    } else {
      setErrorMessage(
        "Failed to load stream. No alternative sources available."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
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
                    <div
                      key={i}
                      className="h-10 w-10 bg-muted-foreground/20 rounded-full"
                    />
                  ))}
                </div>
                <div className="h-10 w-32 bg-muted-foreground/20 rounded" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Episode</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't load this episode. Please try again later.
            </p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (
    !currentStreamUrl &&
    (!data.all_stream_sources || data.all_stream_sources.length === 0) &&
    (!data.direct_stream_urls || data.direct_stream_urls.length === 0)
  ) {
    console.error("No streams available. Data:", JSON.stringify(data, null, 2));
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">No Streams Available</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find any streams for this episode.
            </p>
            <Link to={getAnimeUrl()}>
              <Button>Back to Anime</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div>
            <Link
              to={getAnimeUrl()}
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Back to Anime</span>
            </Link>
          </div>

          {errorMessage && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {errorMessage}
            </div>
          )}

          {currentStreamUrl ? (
            useVideoTag ? (
              <VideoPlayer
                key={iframeKey}
                src={currentStreamUrl}
                title={data.title}
                onError={handleStreamError}
              />
            ) : (
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-border">
                <iframe
                  key={iframeKey}
                  src={currentStreamUrl}
                  title={data.title}
                  allowFullScreen
                  className="w-full h-full"
                  sandbox={getSandboxAttribute(currentStreamUrl)}
                  onError={handleStreamError}
                />
              </div>
            )
          ) : (
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-border flex items-center justify-center">
              <p className="text-muted-foreground">
                No stream available for this episode
              </p>
            </div>
          )}

          <h1 className="text-2xl font-bold">{episodeTitle}</h1>

          {data.all_stream_sources && data.all_stream_sources.length > 1 && (
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
                      const transformedUrl = transformUrl(url);
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
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>

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
                  {Object.entries(data.download_links).map(
                    ([quality, links]) => (
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
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {data.direct_stream_urls && data.direct_stream_urls.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Direct Stream Options</h3>
              <div className="flex flex-wrap gap-2">
                {data.direct_stream_urls.map((stream, idx) => {
                  const transformedUrl = transformUrl(stream.url);
                  console.log(
                    `Rendering direct stream option: ${stream.host} - ${
                      stream.quality
                    }, URL: ${transformedUrl}, Valid: ${isValidStreamUrl(
                      transformedUrl
                    )}`
                  );
                  return (
                    <Button
                      key={idx}
                      variant={
                        currentStreamUrl === transformedUrl
                          ? "default"
                          : "secondary"
                      }
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
    </div>
  );
};

export default WatchEpisode;
