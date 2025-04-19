
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/latest" element={<LatestAnime />} />
            <Route path="/top" element={<TopAnime />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/anime/*" element={<AnimeDetails />} />
            <Route path="/episode/*" element={<WatchEpisode />} />
            <Route path="/comics" element={<LatestComics />} />
            <Route path="/comics/popular" element={<PopularComics />} />
            <Route path="/comic/*" element={<ComicDetails />} />
            <Route path="/read/*" element={<ReadChapter />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
