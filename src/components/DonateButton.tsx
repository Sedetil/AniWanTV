import { Coffee, Heart, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DonateButton = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  // Optional: Hide the "NEW" badge after a certain period
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBadge(false);
    }, 60000 * 60 * 24); // Hide after 24 hours

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://saweria.co/Alwanpriyanto"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Enhanced Notification Badge */}
              {showBadge && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse z-10 font-medium flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  <span>NEW</span>
                </span>
              )}

              <Button
                variant="default"
                size="lg"
                className="rounded-full shadow-xl transition-all duration-300 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 hover:scale-105 group px-4 py-2 relative overflow-hidden"
              >
                {/* Enhanced Glowing Effect */}
                <span className="absolute w-24 h-24 bg-yellow-200 opacity-40 rounded-full -z-10 blur-2xl animate-ping"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent opacity-30 transform translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></span>

                <div className="flex items-center gap-2">
                  {isHovering ? (
                    <Heart className="w-5 h-5 text-white drop-shadow animate-pulse" />
                  ) : (
                    <Coffee className="w-5 h-5 text-white drop-shadow" />
                  )}
                  <span className="hidden md:inline font-bold text-white drop-shadow tracking-wide">
                    Dukung Kami
                  </span>
                </div>
              </Button>
            </a>
          </TooltipTrigger>

          <TooltipContent
            side="top"
            className="bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border border-yellow-300 shadow-lg font-medium text-sm px-4 py-2 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              <span>Traktir kopi biar makin semangat update fitur! 🚀☕</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default DonateButton;