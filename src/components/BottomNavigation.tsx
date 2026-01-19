import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Tv2,
  BookOpen,
  Bookmark,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
  badge?: number;
}

const BottomNavigation = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      id: "anime",
      label: "Anime",
      icon: Tv2,
      path: "/latest-anime",
    },
    {
      id: "comics",
      label: "Comics",
      icon: BookOpen,
      path: "/latest-comics",
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      path: "/bookmarks",
    },
    {
      id: "donate",
      label: "Donate",
      icon: Heart,
      path: "https://saweria.co/Alwanpriyanto",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" id="bottom-navigation">
      {/* Glassmorphism Background Container */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]" />

      {/* Navigation Content */}
      <nav className="relative flex justify-around items-center h-20 px-4 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.path ||
            (item.id === "home" && activeTab === "/") ||
            (item.id !== "home" && activeTab.startsWith(item.path));

          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full group outline-none"
              onClick={() => setActiveTab(item.path)}
            >
              {/* Active Indicator Background */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute top-2 w-12 h-12 bg-primary/15 rounded-2xl"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <div className="relative z-10 p-1">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all duration-300",
                    isActive
                      ? "text-primary drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]"
                      : "text-muted-foreground group-hover:text-primary/70"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Notification Badge */}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-background">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-300 mt-1",
                  isActive
                    ? "text-primary translate-y-0 opacity-100"
                    : "text-muted-foreground translate-y-1 opacity-70 group-hover:text-primary/70 group-hover:translate-y-0 group-hover:opacity-100"
                )}
              >
                {item.label}
              </span>

              {/* Active Bottom Bar Indicator (Matches the image's line idea) */}
              {isActive && (
                <motion.div
                  layoutId="activeTabBottomLine"
                  className="absolute bottom-1 w-8 h-1 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Safe Area Spacer */}
      <div className="h-[env(safe-area-inset-bottom)] bg-background/80 backdrop-blur-xl" />
    </div>
  );
};

export default BottomNavigation;