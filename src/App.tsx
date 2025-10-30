import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import LatestAnime from "./pages/LatestAnime";
import TopAnime from "./pages/TopAnime";
import AnimeDetails from "./pages/AnimeDetails";
import WatchEpisode from "./pages/WatchEpisode";
import SearchResults from "./pages/SearchResults";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";
import LatestComics from "./pages/LatestComics";
import PopularComics from "./pages/PopularComics";
import ComicDetails from "./pages/ComicDetails";
import ReadChapter from "./pages/ReadChapter";
import Bookmarks from "./pages/Bookmarks";
import Donghua from "./pages/Donghua";
import DonghuaDetails from "./pages/DonghuaDetails";
import WatchDonghuaEpisode from "./pages/WatchDonghuaEpisode";
import BottomNavigation from "./components/BottomNavigation";
import ConditionalBottomNavigation from "./components/ConditionalBottomNavigation";
import { cleanupDuplicateBookmarks } from "@/utils/bookmarkUtils";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
      when: "afterChildren"
    }
  }
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="min-h-full"
      key="page-wrapper"
    >
      {children}
    </motion.div>
  );
};

const AppWithTransitions = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  
  // Clean up duplicate bookmarks on app initialization
  useEffect(() => {
    cleanupDuplicateBookmarks();
  }, []);
  
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen pb-safe-area md:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
            <Route path="/latest" element={<PageWrapper><LatestAnime /></PageWrapper>} />
            <Route path="/latest-anime" element={<PageWrapper><LatestAnime /></PageWrapper>} />
            <Route path="/top" element={<PageWrapper><TopAnime /></PageWrapper>} />
            <Route path="/search" element={<PageWrapper><SearchResults /></PageWrapper>} />
            <Route path="/schedule" element={<PageWrapper><Schedule /></PageWrapper>} />
            <Route path="/donghua" element={<PageWrapper><Donghua /></PageWrapper>} />
            <Route path="/donghua/*" element={<PageWrapper><DonghuaDetails /></PageWrapper>} />
            <Route path="/donghua-episode/*" element={<PageWrapper><WatchDonghuaEpisode /></PageWrapper>} />
            <Route path="/anime/*" element={<PageWrapper><AnimeDetails /></PageWrapper>} />
            <Route path="/series/*" element={<PageWrapper><AnimeDetails /></PageWrapper>} />
            <Route path="/film/*" element={<PageWrapper><AnimeDetails /></PageWrapper>} />
            <Route path="/episode/*" element={<PageWrapper><WatchEpisode /></PageWrapper>} />
            <Route path="/comics" element={<PageWrapper><LatestComics /></PageWrapper>} />
            <Route path="/latest-comics" element={<PageWrapper><LatestComics /></PageWrapper>} />
            <Route path="/comics/popular" element={<PageWrapper><PopularComics /></PageWrapper>} />
            <Route path="/comic/*" element={<PageWrapper><ComicDetails /></PageWrapper>} />
            <Route path="/read/*" element={<PageWrapper><ReadChapter /></PageWrapper>} />
            <Route path="/bookmarks" element={<PageWrapper><Bookmarks /></PageWrapper>} />
            <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </div>
      <ConditionalBottomNavigation />
    </>
  );
};

const App = () => <AppWithTransitions />;

export default App;