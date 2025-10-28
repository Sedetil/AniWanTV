import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Search,
  Bookmark,
  User,
  Tv2,
  BookOpen,
  Heart
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

  // Animation variants for the active indicator
  const indicatorVariants = {
    inactive: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    active: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  // Animation variants for the icon
  const iconVariants = {
    inactive: {
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    active: {
      y: -2,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        type: "spring",
        stiffness: 400,
        damping: 17,
      },
    },
  };

  // Glow effect for active item
  const glowVariants = {
    inactive: {
      boxShadow: "0 0 0 rgba(139, 92, 246, 0)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    active: {
      boxShadow: "0 0 20px rgba(139, 92, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" id="bottom-navigation">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl border-t border-gray-800/50" />
      
      {/* Navigation container */}
      <nav className="relative flex justify-around items-center h-16 px-2">
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
              onClick={() => setActiveTab(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-full py-2 transition-all duration-300",
                "group"
              )}
            >
              {/* Active indicator with glow */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-purple-600/20"
                  variants={glowVariants}
                  initial="inactive"
                  animate="active"
                  style={{
                    margin: "4px 8px",
                  }}
                />
              )}
              
              {/* Icon container */}
              <motion.div
                className="relative flex flex-col items-center justify-center"
                variants={iconVariants}
                animate={isActive ? "active" : "inactive"}
              >
                {/* Icon */}
                <Icon
                  className={cn(
                    "relative z-10 transition-colors duration-300",
                    isActive
                      ? "text-purple-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                      : "text-gray-400 group-hover:text-gray-300"
                  )}
                  width={20}
                  height={20}
                />
                
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"
                    variants={indicatorVariants}
                    initial="inactive"
                    animate="active"
                  />
                )}
                
                {/* Badge if needed */}
                {item.badge && item.badge > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                    }}
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </motion.div>
                )}
              </motion.div>
              
              {/* Label */}
              <motion.span
                className={cn(
                  "text-xs mt-1 transition-colors duration-300 font-medium",
                  isActive 
                    ? "text-purple-400" 
                    : "text-gray-500 group-hover:text-gray-400"
                )}
                animate={{
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeInOut",
                }}
              >
                {item.label}
              </motion.span>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-purple-600/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                   style={{ margin: "4px 8px" }} />
            </Link>
          );
        })}
      </nav>
      
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-black/90" />
    </div>
  );
};

export default BottomNavigation;