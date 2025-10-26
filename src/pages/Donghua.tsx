import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAnimexinPopularToday,
  fetchAnimexinLatestRelease,
  fetchAnimexinRecommendation,
  AnimexinPopularToday,
  AnimexinLatestRelease,
  AnimexinRecommendation
} from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimeGrid from "@/components/AnimeGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";

const Donghua = () => {
  const [activeTab, setActiveTab] = useState("popular");

  const { data: popularToday, isLoading: popularLoading } = useQuery({
    queryKey: ['animexinPopularToday'],
    queryFn: fetchAnimexinPopularToday,
  });

  const { data: latestRelease, isLoading: latestLoading } = useQuery({
    queryKey: ['animexinLatestRelease'],
    queryFn: fetchAnimexinLatestRelease,
  });

  const { data: recommendation, isLoading: recommendationLoading } = useQuery({
    queryKey: ['animexinRecommendation'],
    queryFn: fetchAnimexinRecommendation,
  });

  // Transform data to match AnimeGrid interface
  const transformPopularData = (data: AnimexinPopularToday[]) => {
    return data.map(item => ({
      title: item.title,
      url: item.url,
      image_url: item.image,
      episode: item.episode,
      type: item.type,
    }));
  };

  const transformLatestData = (data: AnimexinLatestRelease[]) => {
    return data.map(item => ({
      title: item.title,
      url: item.url,
      image_url: item.image,
      episode: item.episode,
      type: item.type,
    }));
  };

  const transformRecommendationData = (data: AnimexinRecommendation[]) => {
    return data.map(item => ({
      title: item.title,
      url: item.url,
      image_url: item.image,
      type: item.type,
      status: item.status,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Donghua Collection
            </h1>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              Explore the latest Chinese animation (Donghua) series with Indonesian subtitles
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="popular">Popular Today</TabsTrigger>
              <TabsTrigger value="latest">Latest Release</TabsTrigger>
              <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
            </TabsList>

            <TabsContent value="popular" className="space-y-6">
              <motion.section
                initial="hidden"
                animate="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
              >
                {popularLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                          <Skeleton className="h-64 w-full" />
                          <div className="p-3">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <AnimeGrid
                    title={
                      <div className="text-2xl md:text-3xl font-bold relative">
                        Popular Today
                        <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary rounded-full"></span>
                      </div>
                    }
                    animeList={transformPopularData(popularToday || [])}
                    loading={popularLoading}
                    aspectRatio="portrait"
                    viewType="grid"
                    isDonghua={true}
                  />
                )}
              </motion.section>
            </TabsContent>

            <TabsContent value="latest" className="space-y-6">
              <motion.section
                initial="hidden"
                animate="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
              >
                {latestLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                          <Skeleton className="h-64 w-full" />
                          <div className="p-3">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <AnimeGrid
                    title={
                      <div className="text-2xl md:text-3xl font-bold relative">
                        Latest Release
                        <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary rounded-full"></span>
                      </div>
                    }
                    animeList={transformLatestData(latestRelease || [])}
                    loading={latestLoading}
                    aspectRatio="portrait"
                    viewType="grid"
                    isDonghua={true}
                  />
                )}
              </motion.section>
            </TabsContent>

            <TabsContent value="recommendation" className="space-y-6">
              <motion.section
                initial="hidden"
                animate="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
              >
                {recommendationLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-0">
                          <Skeleton className="h-64 w-full" />
                          <div className="p-3">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <AnimeGrid
                    title={
                      <div className="text-2xl md:text-3xl font-bold relative">
                        Recommendation
                        <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary rounded-full"></span>
                      </div>
                    }
                    animeList={transformRecommendationData(recommendation || [])}
                    loading={recommendationLoading}
                    aspectRatio="portrait"
                    viewType="grid"
                    isDonghua={true}
                  />
                )}
              </motion.section>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Donghua;