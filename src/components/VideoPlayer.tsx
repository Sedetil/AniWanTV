import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  SkipBack,
  SkipForward,
  PictureInPicture,
  PictureInPicture2,
  X,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  AlertTriangle
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
  maxRetries?: number;
}

const VideoPlayer = ({
  src,
  title,
  poster,
  className,
  onError,
  onEnded,
  maxRetries = 3
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [volumeSliderOpen, setVolumeSliderOpen] = useState(false);
  const [isOrientationLocked, setIsOrientationLocked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
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
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    
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
    resetControlsTimer();
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
    resetControlsTimer();
  }, []);

  // Lock screen orientation to landscape
  const lockOrientation = useCallback(async () => {
    if (!isMobile) return;
    
    try {
      // Check if Screen Orientation API is supported
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape');
        setIsOrientationLocked(true);
        console.log('Screen orientation locked to landscape');
      } else if ((screen as any).lockOrientation) {
        // Fallback for older browsers
        (screen as any).lockOrientation('landscape');
        setIsOrientationLocked(true);
        console.log('Screen orientation locked to landscape (fallback)');
      } else if ((screen as any).mozLockOrientation) {
        // Firefox fallback
        (screen as any).mozLockOrientation('landscape');
        setIsOrientationLocked(true);
        console.log('Screen orientation locked to landscape (Firefox)');
      } else if ((screen as any).msLockOrientation) {
        // IE/Edge fallback
        (screen as any).msLockOrientation('landscape');
        setIsOrientationLocked(true);
        console.log('Screen orientation locked to landscape (IE/Edge)');
      } else {
        console.warn('Screen orientation lock not supported on this device');
      }
    } catch (error) {
      console.error('Failed to lock screen orientation:', error);
    }
  }, [isMobile]);

  // Unlock screen orientation
  const unlockOrientation = useCallback(() => {
    if (!isMobile || !isOrientationLocked) return;
    
    try {
      if (screen.orientation && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
        setIsOrientationLocked(false);
        console.log('Screen orientation unlocked');
      } else if ((screen as any).unlockOrientation) {
        (screen as any).unlockOrientation();
        setIsOrientationLocked(false);
        console.log('Screen orientation unlocked (fallback)');
      } else if ((screen as any).mozUnlockOrientation) {
        (screen as any).mozUnlockOrientation();
        setIsOrientationLocked(false);
        console.log('Screen orientation unlocked (Firefox)');
      } else if ((screen as any).msUnlockOrientation) {
        (screen as any).msUnlockOrientation();
        setIsOrientationLocked(false);
        console.log('Screen orientation unlocked (IE/Edge)');
      }
    } catch (error) {
      console.error('Failed to unlock screen orientation:', error);
    }
  }, [isMobile, isOrientationLocked]);

  // Toggle fullscreen with orientation lock
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      try {
        // Enter fullscreen
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
        
        // Lock orientation to landscape on mobile devices
        if (isMobile) {
          // Small delay to ensure fullscreen is active before locking orientation
          setTimeout(() => {
            lockOrientation();
          }, 300);
        }
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    } else {
      try {
        // Unlock orientation before exiting fullscreen
        if (isMobile && isOrientationLocked) {
          unlockOrientation();
        }
        
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    }
  }, [isFullscreen, isMobile, isOrientationLocked, lockOrientation, unlockOrientation]);

  // Toggle theater mode
  const toggleTheaterMode = useCallback(() => {
    setIsTheaterMode(!isTheaterMode);
  }, [isTheaterMode]);

  // Toggle mini player
  const toggleMiniPlayer = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      if (!isMiniPlayer) {
        await videoRef.current.requestPictureInPicture();
        setIsMiniPlayer(true);
      } else {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsMiniPlayer(false);
        }
      }
    } catch (error) {
      console.error("Picture-in-Picture error:", error);
    }
  }, [isMiniPlayer]);

  // Handle playback speed change
  const handleSpeedChange = useCallback((speed: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setSettingsMenuOpen(false);
  }, []);

  // Handle quality change
  const handleQualityChange = useCallback((newQuality: string) => {
    setQuality(newQuality);
    // In a real implementation, you would switch to a different video source
    console.log(`Quality changed to: ${newQuality}`);
    setSettingsMenuOpen(false);
  }, []);

  // Reset controls timer
  const resetControlsTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Handle mouse movement
  const handleMouseMove = useCallback(() => {
    resetControlsTimer();
  }, [resetControlsTimer]);

  // Handle video click for play/pause
  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  }, [togglePlay]);

  // Handle double click for fullscreen
  const handleVideoDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFullscreen();
  }, [toggleFullscreen]);

  // Show/hide controls on mouse movement
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseenter", handleMouseMove);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseenter", handleMouseMove);
      }
    };
  }, [handleMouseMove]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuOpen) {
        setSettingsMenuOpen(false);
      }
      if (volumeSliderOpen) {
        setVolumeSliderOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSettingsMenuOpen(false);
        setVolumeSliderOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settingsMenuOpen, volumeSliderOpen]);

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
      console.error("Video error occurred, retry count:", retryCount);
      
      // For PixelDrain, fail immediately without retry since it consistently returns 403
      const isPixelDrainError = src.includes("pixeldrain.com");
      if (isPixelDrainError) {
        console.log("PixelDrain error detected - failing immediately without retry");
        setError("PixelDrain access denied. This source consistently fails. Please try Krakenfiles or MEGA instead.");
        setIsLoading(false);
        if (onError) onError();
        return;
      }
      
      // Implement retry logic for other errors
      if (retryCount < maxRetries) {
        console.log(`Retrying video load (${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
        setIsRetrying(true);
        
        // Add a delay before retry
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.load();
            setIsRetrying(false);
          }
        }, 2000);
        return;
      }
      
      setError("Failed to load video. Please try another source.");
      setIsLoading(false);
      if (onError) onError();
    };
    
    const handleNetworkError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      if (target.error) {
        console.error("Video error:", target.error);
        
        // Check for specific PixelDrain 403 error
        const isPixelDrainError = src.includes("pixeldrain.com");
        const is403Error = target.error.code === target.error.MEDIA_ERR_SRC_NOT_SUPPORTED;
        
        // For PixelDrain, fail immediately without retry since it consistently returns 403
        if (isPixelDrainError && is403Error) {
          console.log("PixelDrain 403 error detected - failing immediately without retry");
          setError("PixelDrain access denied. This source consistently fails. Please try Krakenfiles or MEGA instead.");
          setIsLoading(false);
          if (onError) onError();
          return;
        }
        
        // Implement retry logic for other errors
        if (retryCount < maxRetries) {
          console.log(`Retrying video load (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
          setIsRetrying(true);
          
          // Add a delay before retry with different approach
          setTimeout(() => {
            if (videoRef.current) {
              // Try to reload with a timestamp to bypass caching
              let newSrc = src;
              if (isPixelDrainError) {
                // For PixelDrain, update the timestamp parameter
                const baseUrl = src.split('?t=')[0];
                newSrc = `${baseUrl}?t=${Date.now()}`;
              } else {
                // For other sources, add timestamp
                const separator = src.includes('?') ? '&' : '?';
                newSrc = `${src}${separator}_t=${Date.now()}`;
              }
              videoRef.current.src = newSrc;
              videoRef.current.load();
              setIsRetrying(false);
            }
          }, 2000);
          return;
        }
        
        switch (target.error.code) {
          case target.error.MEDIA_ERR_ABORTED:
            setError("Video loading was aborted.");
            break;
          case target.error.MEDIA_ERR_NETWORK:
            setError("Network error. Please check your connection and try again.");
            break;
          case target.error.MEDIA_ERR_DECODE:
            setError("Video format is not supported.");
            break;
          case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            if (isPixelDrainError) {
              setError("PixelDrain access denied. This source consistently fails. Please try Krakenfiles or MEGA instead.");
            } else {
              setError("Video source is not supported. Please try another source.");
            }
            break;
          default:
            setError("Failed to load video. Please try another source.");
        }
      }
      setIsLoading(false);
      if (onError) onError();
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setRetryCount(0); // Reset retry count on successful load
    };
    
    const handleWaiting = () => {
      setIsBuffering(true);
    };
    
    const handlePlaying = () => {
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleEnterPiP = () => {
      setIsMiniPlayer(true);
    };

    const handleLeavePiP = () => {
      setIsMiniPlayer(false);
    };
    
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleNetworkError);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("enterpictureinpicture", handleEnterPiP);
    video.addEventListener("leavepictureinpicture", handleLeavePiP);
    
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleNetworkError);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("enterpictureinpicture", handleEnterPiP);
      video.removeEventListener("leavepictureinpicture", handleLeavePiP);
    };
  }, [onError, onEnded]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If we're no longer in fullscreen, unlock orientation
      if (!isCurrentlyFullscreen && isMobile && isOrientationLocked) {
        unlockOrientation();
      }
    };
    
    // Listen for fullscreen changes
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    
    // Listen for orientation changes
    const handleOrientationChange = () => {
      if (screen.orientation) {
        console.log('Screen orientation changed to:', (screen.orientation as any).angle, (screen.orientation as any).type);
      }
    };
    
    if (screen.orientation) {
      (screen.orientation as any).addEventListener('change', handleOrientationChange);
    }
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
      
      // Clean up orientation lock when component unmounts
      if (isOrientationLocked) {
        unlockOrientation();
      }
    };
  }, [isMobile, isOrientationLocked, unlockOrientation]);

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
          skip(-5);
          break;
        case "ArrowRight":
          skip(5);
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
        case "t":
          toggleTheaterMode();
          break;
        case "i":
          toggleMiniPlayer();
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skip, handleVolumeChange, toggleMute, toggleFullscreen, toggleTheaterMode, toggleMiniPlayer, volume]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black overflow-hidden transition-all duration-300 ease-in-out",
        isFullscreen
          ? "fixed inset-0 w-screen h-screen z-50"
          : isTheaterMode
            ? "w-full max-w-none"
            : "w-full aspect-video",
        isMiniPlayer ? "fixed bottom-4 right-4 w-80 h-45 z-50 rounded-lg shadow-2xl" : "",
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={cn(
          "w-full h-full object-contain transition-all duration-300 ease-in-out",
          isFullscreen ? "max-w-full max-h-full" : ""
        )}
        onClick={handleVideoClick}
        onDoubleClick={handleVideoDoubleClick}
        crossOrigin="anonymous"
        controls={false}
        playsInline
        style={{
          aspectRatio: isFullscreen ? "16/9" : "auto"
        }}
      />
      
      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white text-sm">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Buffering indicator */}
      <AnimatePresence>
        {isBuffering && !isLoading && (
          <motion.div
            className="absolute top-4 right-4 z-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white text-xs">Buffering...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Retry indicator */}
      <AnimatePresence>
        {isRetrying && (
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 bg-orange-500/90 backdrop-blur-sm rounded-full px-4 py-2">
              <RefreshCw className="w-4 h-4 text-white animate-spin" />
              <span className="text-white text-sm">Retrying... ({retryCount}/{maxRetries})</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Network status indicator */}
      <AnimatePresence>
        {networkStatus === 'offline' && (
          <motion.div
            className="absolute top-4 left-4 z-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
              <WifiOff className="h-3 w-3 text-orange-400" />
              <span className="text-white text-xs">Offline</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center p-6 max-w-md">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                {src.includes("pixeldrain.com") ? (
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                ) : (
                  <X className="h-8 w-8 text-red-500" />
                )}
              </div>
              <p className="text-white mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={() => {
                    setRetryCount(0);
                    setError(null);
                    setIsLoading(true);
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                {onError && (
                  <Button
                    onClick={onError}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Try Another Source
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Video controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="relative w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group z-40"
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
                className="absolute h-full bg-purple-600 rounded-full transition-all duration-100 group-hover:h-2"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
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
                    className="text-white hover:text-purple-400 hover:bg-white/20 h-10 w-10"
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
                    className="text-white hover:text-purple-400 hover:bg-white/20 h-8 w-8"
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
                      className="text-white hover:text-purple-400 hover:bg-white/20 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSettingsMenuOpen(!settingsMenuOpen);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    <AnimatePresence>
                      {settingsMenuOpen && (
                        <motion.div
                          className="fixed inset-0 z-40"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSettingsMenuOpen(false)}
                        >
                          <motion.div
                            className="absolute bottom-20 right-4 w-56 bg-black/95 backdrop-blur-sm border border-white/10 rounded-md shadow-lg overflow-hidden"
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 space-y-1">
                              <div className="px-3 py-2 text-sm font-medium text-white border-b border-white/10">
                                Settings
                              </div>
                              
                              {/* Playback Speed */}
                              <div className="px-3 py-2">
                                <div className="text-xs text-gray-300 mb-2">Playback Speed</div>
                                <div className="grid grid-cols-4 gap-1">
                                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                                    <button
                                      key={speed}
                                      onClick={() => handleSpeedChange(speed)}
                                      className={cn(
                                        "text-xs py-1 px-2 rounded transition-colors",
                                        playbackSpeed === speed
                                          ? "bg-purple-600 text-white"
                                          : "bg-white/10 hover:bg-white/20 text-white"
                                      )}
                                    >
                                      {speed}x
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Quality */}
                              <div className="px-3 py-2">
                                <div className="text-xs text-gray-300 mb-2">Quality</div>
                                <div className="grid grid-cols-2 gap-1">
                                  {["auto", "1080p", "720p", "480p", "360p"].map((q) => (
                                    <button
                                      key={q}
                                      onClick={() => handleQualityChange(q)}
                                      className={cn(
                                        "text-xs py-1 px-2 rounded transition-colors",
                                        quality === q
                                          ? "bg-purple-600 text-white"
                                          : "bg-white/10 hover:bg-white/20 text-white"
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
                                className="flex items-center justify-center w-full px-3 py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                              >
                                <Download className="h-3 w-3 mr-2" />
                                Download
                              </a>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Fullscreen button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="text-white hover:text-purple-400 hover:bg-white/20 h-8 w-8"
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
                    className="text-white hover:text-purple-400 hover:bg-white/20 h-10 w-10 rounded-full"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                  </Button>
                  
                  {/* Skip buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      skip(-5);
                    }}
                    className="text-white hover:text-purple-400 hover:bg-white/20 h-8 w-8 rounded-full"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      skip(5);
                    }}
                    className="text-white hover:text-purple-400 hover:bg-white/20 h-8 w-8 rounded-full"
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
                      className="text-white hover:text-purple-400 hover:bg-white/20 h-8 w-8 rounded-full"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <AnimatePresence>
                      {volumeSliderOpen && (
                        <motion.div
                          className="w-24"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "6rem" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Slider
                            value={[isMuted ? 0 : volume]}
                            max={1}
                            step={0.05}
                            onValueChange={handleVolumeChange}
                            className="w-full"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVolumeSliderOpen(!volumeSliderOpen);
                      }}
                      className="text-white hover:text-purple-400 hover:bg-white/20 h-6 w-6 rounded-full"
                    >
                      {volumeSliderOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>
                  
                  {/* Time display */}
                  <div className="text-white text-sm font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Theater mode button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTheaterMode();
                    }}
                    className={cn(
                      "h-8 w-8 rounded-full",
                      isTheaterMode 
                        ? "text-purple-400 bg-white/20" 
                        : "text-white hover:text-purple-400 hover:bg-white/20"
                    )}
                  >
                    <PictureInPicture2 className="h-4 w-4" />
                  </Button>
                  
                  {/* Mini player button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMiniPlayer();
                    }}
                    className="text-white hover:text-purple-400 hover:bg-white/20 h-8 w-8 rounded-full"
                  >
                    <PictureInPicture className="h-4 w-4" />
                  </Button>
                  
                  {/* Settings button */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-purple-400 hover:bg-white/20 h-8 w-8 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSettingsMenuOpen(!settingsMenuOpen);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    <AnimatePresence>
                      {settingsMenuOpen && (
                        <motion.div
                          className="fixed inset-0 z-40"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSettingsMenuOpen(false)}
                        >
                          <motion.div
                            className="absolute bottom-20 right-4 w-56 bg-black/95 backdrop-blur-sm border border-white/10 rounded-md shadow-lg overflow-hidden"
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 space-y-1">
                              <div className="px-3 py-2 text-sm font-medium text-white border-b border-white/10">
                                Settings
                              </div>
                              
                              {/* Playback Speed */}
                              <div className="px-3 py-2">
                                <div className="text-xs text-gray-300 mb-2">Playback Speed</div>
                                <div className="grid grid-cols-4 gap-1">
                                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                                    <button
                                      key={speed}
                                      onClick={() => handleSpeedChange(speed)}
                                      className={cn(
                                        "text-xs py-1 px-2 rounded transition-colors",
                                        playbackSpeed === speed
                                          ? "bg-purple-600 text-white"
                                          : "bg-white/10 hover:bg-white/20 text-white"
                                      )}
                                    >
                                      {speed}x
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Quality */}
                              <div className="px-3 py-2">
                                <div className="text-xs text-gray-300 mb-2">Quality</div>
                                <div className="grid grid-cols-2 gap-1">
                                  {["auto", "1080p", "720p", "480p", "360p"].map((q) => (
                                    <button
                                      key={q}
                                      onClick={() => handleQualityChange(q)}
                                      className={cn(
                                        "text-xs py-1 px-2 rounded transition-colors",
                                        quality === q
                                          ? "bg-purple-600 text-white"
                                          : "bg-white/10 hover:bg-white/20 text-white"
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
                                className="flex items-center justify-center w-full px-3 py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                              >
                                <Download className="h-3 w-3 mr-2" />
                                Download
                              </a>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Download button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-purple-400 hover:bg-white/20 h-8 w-8 rounded-full"
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
                    className="text-white hover:text-purple-400 hover:bg-white/20 h-8 w-8 rounded-full"
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
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Play button overlay - different for mobile and desktop */}
      <AnimatePresence>
        {!isPlaying && !isLoading && !error && (
          <>
            {isMobile ? (
              // Mobile: Smaller play button at the bottom center
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            ) : (
              // Desktop: Larger play button in the center
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;
