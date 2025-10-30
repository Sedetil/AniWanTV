import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchReleaseSchedule } from "@/api/animeApi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimeGrid from "@/components/AnimeGrid";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState("senin");

  function getCurrentDay() {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const today = new Date().getDay();
    return days[today].toLowerCase();
  }

  const { data, isLoading } = useQuery({
    queryKey: ["releaseSchedule", selectedDay],
    queryFn: () => fetchReleaseSchedule(selectedDay),
  });

  const formatAnimeData = () => {
    if (!data || !data.schedule) return [];

    return data.schedule.map((anime) => ({
      title: anime.title,
      url: anime.url,
      image_url: anime.image_url,
      rating: anime.rating,
      episode: `${anime.time}`,
      views: anime.genres?.join(", ") || "N/A",
      duration: anime.type || "TV",
      rank: null,
    }));
  };

  const availableDays =
    data?.available_days?.length > 0
      ? data.available_days
      : ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold">Jadwal Rilis Anime</h1>
            </div>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Pilih hari untuk melihat anime yang akan tayang
            </p>

            <div className="flex overflow-x-auto pb-2 mb-6 md:flex-wrap gap-2">
              {availableDays.map((day) => (
                <Button
                  key={day}
                  variant={
                    selectedDay.toLowerCase() === day.toLowerCase()
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setSelectedDay(day.toLowerCase())}
                  className="min-w-20 rounded-full"
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  Anime Rilis Hari{" "}
                  <span className="text-primary">
                    {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
                  </span>
                </h2>
              </div>

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatAnimeData().length} anime
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-md aspect-[2/3] mb-2"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <AnimeGrid
                title="Jadwal Rilis Anime"
                animeList={formatAnimeData()}
                loading={false}
                aspectRatio="portrait"
                viewType="grid"
              />
            )}

            {!isLoading && (!data?.schedule || data.schedule.length === 0) && (
              <div className="py-12 text-center">
                <div className="inline-flex justify-center items-center rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
                  Tidak ada anime yang dijadwalkan untuk hari {selectedDay}
                </p>
                <p className="mt-2 text-gray-400 dark:text-gray-500">
                  Silakan pilih hari lain untuk melihat jadwal anime
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Schedule;
