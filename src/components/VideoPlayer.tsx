import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Download,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  SkipBack,
  SkipForward
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
  onError?: () => void;
  onEnded?: () => void;
}

const VideoPlayer = ({
  src,
  title,
  poster,
  className,
  onError,
  onEnded
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  
  const isMobile = useIsMobile();

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Format time for display
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number[]) => {
    const vol = newVolume[0];
    if (!videoRef.current) return;
    
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // Handle seek
  const handleSeek = useCallback((newTime: number[]) => {
    if (!videoRef.current) return;
    
    const time = newTime[0];
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Skip forward/backward
  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime += seconds;
    setCurrentTime(videoRef.current.currentTime);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Handle playback speed change
  const handleSpeedChange = useCallback((speed: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, []);

  // Handle quality change
  const handleQualityChange = useCallback((newQuality: string) => {
    setQuality(newQuality);
    // In a real implementation, you would switch to a different video source
    // For now, we'll just update the quality state
    console.log(`Quality changed to: ${newQuality}`);
  }, []);

  // Show/hide controls on mouse movement
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseenter", handleMouseMove);
    }
    
    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseenter", handleMouseMove);
      }
    };
  }, [isPlaying]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuOpen) {
        setSettingsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && settingsMenuOpen) {
        setSettingsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settingsMenuOpen]);

  // Update video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      setError(null);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Update buffered progress
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    
    const handleError = () => {
      setError("Failed to load video. Please try another source.");
      setIsLoading(false);
      if (onError) onError();
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
    };
    
    const handleWaiting = () => {
      setIsBuffering(true);
    };
    
    const handlePlaying = () => {
      setIsLoading(false);
      setIsBuffering(false);
    };
    
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
    };
  }, [onError, onEnded]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          skip(-10);
          break;
        case "ArrowRight":
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange([Math.min(1, volume + 0.1)]);
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange([Math.max(0, volume - 0.1)]);
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skip, handleVolumeChange, toggleMute, toggleFullscreen, volume]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl",
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-sm">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Buffering indicator */}
      {isBuffering && !isLoading && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white text-xs">Buffering...</span>
          </div>
        </div>
      )}
      
      {/* Network status indicator */}
      {networkStatus === 'offline' && (
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <WifiOff className="h-3 w-3 text-orange-400" />
            <span className="text-white text-xs">Offline</span>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
          <div className="text-center p-6 max-w-md">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <MoreVertical className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-white mb-4">{error}</p>
            <Button onClick={togglePlay} className="bg-primary hover:bg-primary/90">
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      {/* Video controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div
          ref={progressBarRef}
          className="relative w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer group z-40"
          onClick={(e) => {
            e.stopPropagation();
            if (!videoRef.current || !progressBarRef.current) return;
            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            handleSeek([pos * duration]);
          }}
        >
          <div
            className="absolute h-full bg-white/30 rounded-full"
            style={{ width: `${buffered}%` }}
          ></div>
          <div
            className="absolute h-full bg-primary rounded-full transition-all duration-100 group-hover:h-3"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
        
        {isMobile ? (
          // Mobile layout with controls at the bottom
          <div className="flex items-center justify-between z-40">
            <div className="flex items-center space-x-3">
              {/* Play/Pause button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="text-white hover:text-primary hover:bg-white/20 h-10 w-10"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              
              {/* Time display */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Volume control - simplified for mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="text-white hover:text-primary hover:bg-white/20 h-8 w-8"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              {/* Settings button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-primary hover:bg-white/20 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSettingsMenuOpen(!settingsMenuOpen);
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                {settingsMenuOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setSettingsMenuOpen(false)}>
                    <div
                      className="absolute bottom-20 right-4 w-56 bg-background/95 backdrop-blur-sm border border-border rounded-md shadow-lg overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2 space-y-1">
                        <div className="px-3 py-2 text-sm font-medium text-foreground border-b border-border">
                          Settings
                        </div>
                        
                        {/* Playback Speed */}
                        <div className="px-3 py-2">
                          <div className="text-xs text-muted-foreground mb-2">Playback Speed</div>
                          <div className="grid grid-cols-4 gap-1">
                            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => {
                                  handleSpeedChange(speed);
                                  setSettingsMenuOpen(false);
                                }}
                                className={cn(
                                  "text-xs py-1 px-2 rounded transition-colors",
                                  playbackSpeed === speed
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80 text-foreground"
                                )}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Quality */}
                        <div className="px-3 py-2">
                          <div className="text-xs text-muted-foreground mb-2">Quality</div>
                          <div className="grid grid-cols-2 gap-1">
                            {["auto", "1080p", "720p", "480p", "360p"].map((q) => (
                              <button
                                key={q}
                                onClick={() => {
                                  handleQualityChange(q);
                                  setSettingsMenuOpen(false);
                                }}
                                className={cn(
                                  "text-xs py-1 px-2 rounded transition-colors",
                                  quality === q
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80 text-foreground"
                                )}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Download */}
                        <a
                          href={src}
                          download
                          title={title}
                          className="flex items-center justify-center w-full px-3 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground rounded transition-colors"
                        >
                          <Download className="h-3 w-3 mr-2" />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fullscreen button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="text-white hover:text-primary hover:bg-white/20 h-8 w-8"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Desktop layout with horizontal controls
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Play/Pause button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="text-white hover:text-primary hover:bg-white/20 h-10 w-10 rounded-full"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
              </Button>
              
              {/* Skip buttons */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  skip(-10);
                }}
                className="text-white hover:text-primary hover:bg-white/20 h-8 w-8 rounded-full"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  skip(10);
                }}
                className="text-white hover:text-primary hover:bg-white/20 h-8 w-8 rounded-full"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              
              {/* Volume control */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="text-white hover:text-primary hover:bg-white/20 h-8 w-8 rounded-full"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.05}
                    onValueChange={handleVolumeChange}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Time display */}
              <div className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Settings button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-primary hover:bg-white/20 h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSettingsMenuOpen(!settingsMenuOpen);
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                {settingsMenuOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setSettingsMenuOpen(false)}>
                    <div
                      className="absolute bottom-20 right-4 w-56 bg-background/95 backdrop-blur-sm border border-border rounded-md shadow-lg overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2 space-y-1">
                        <div className="px-3 py-2 text-sm font-medium text-foreground border-b border-border">
                          Settings
                        </div>
                        
                        {/* Playback Speed */}
                        <div className="px-3 py-2">
                          <div className="text-xs text-muted-foreground mb-2">Playback Speed</div>
                          <div className="grid grid-cols-4 gap-1">
                            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => {
                                  handleSpeedChange(speed);
                                  setSettingsMenuOpen(false);
                                }}
                                className={cn(
                                  "text-xs py-1 px-2 rounded transition-colors",
                                  playbackSpeed === speed
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80 text-foreground"
                                )}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Quality */}
                        <div className="px-3 py-2">
                          <div className="text-xs text-muted-foreground mb-2">Quality</div>
                          <div className="grid grid-cols-2 gap-1">
                            {["auto", "1080p", "720p", "480p", "360p"].map((q) => (
                              <button
                                key={q}
                                onClick={() => {
                                  handleQualityChange(q);
                                  setSettingsMenuOpen(false);
                                }}
                                className={cn(
                                  "text-xs py-1 px-2 rounded transition-colors",
                                  quality === q
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted hover:bg-muted/80 text-foreground"
                                )}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Download */}
                        <a
                          href={src}
                          download
                          title={title}
                          className="flex items-center justify-center w-full px-3 py-2 text-xs bg-muted hover:bg-muted/80 text-foreground rounded transition-colors"
                        >
                          <Download className="h-3 w-3 mr-2" />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Download button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary hover:bg-white/20 h-8 w-8 rounded-full"
                asChild
              >
                <a href={src} download title={title}>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
              
              {/* Fullscreen button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="text-white hover:text-primary hover:bg-white/20 h-8 w-8 rounded-full"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Play button overlay - different for mobile and desktop */}
      {!isPlaying && !isLoading && !error && (
        <>
          {isMobile ? (
            // Mobile: Smaller play button at the bottom center
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 pointer-events-none z-30">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white pointer-events-auto transition-all duration-200 hover:scale-105"
              >
                <Play className="h-7 w-7 ml-1" />
              </Button>
            </div>
          ) : (
            // Desktop: Larger play button in the center
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white pointer-events-auto transition-all duration-200 hover:scale-105"
              >
                <Play className="h-10 w-10 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoPlayer;