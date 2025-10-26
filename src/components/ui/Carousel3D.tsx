import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { TopAnime, LatestAnime, LatestComic } from "@/api/animeApi";

interface Carousel3DProps {
  items: (TopAnime | LatestAnime | LatestComic)[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  className?: string;
}

const Carousel3D: React.FC<Carousel3DProps> = ({
  items,
  autoSlide = true,
  autoSlideInterval = 5000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || items.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, autoSlideInterval, items.length]);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Check if item is anime or comic and its type
  const getItemType = (item: TopAnime | LatestAnime | LatestComic) => {
    const isTopAnime = "rating" in item && !("type" in item);
    const isLatestAnime = "episode" in item;
    const isComic = "type" in item && "latest_chapter" in item;

    if (isComic) return "comic";
    if (isLatestAnime) return "latest-anime";
    return "top-anime";
  };

  // Get item URL based on type
  const getItemUrl = (item: TopAnime | LatestAnime | LatestComic) => {
    const type = getItemType(item);
    if (type === "comic") {
      return `/comic/${(item as LatestComic).url.match(/\/komik\/([^/]+)\/?$/)?.[1] || (item as LatestComic).url}`;
    }
    return (item as any).url.split(".tv")[1];
  };

  // Get item title based on type
  const getItemTitle = (item: TopAnime | LatestAnime | LatestComic) => {
    return item.title;
  };

  // Get item badge based on type
  const getItemBadge = (item: TopAnime | LatestAnime | LatestComic) => {
    const type = getItemType(item);
    if (type === "latest-anime" && (item as LatestAnime).episode !== "N/A") {
      return { text: `Episode ${(item as LatestAnime).episode}`, className: "bg-primary/80" };
    }
    return null;
  };

  // Get item metadata based on type
  const getItemMetadata = (item: TopAnime | LatestAnime | LatestComic) => {
    const type = getItemType(item);
    const metadata = [];

    if (type === "top-anime" && (item as TopAnime).rating && (item as TopAnime).rating !== "N/A") {
      metadata.push({
        icon: (
          <svg
            className="w-4 h-4 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        ),
        text: (item as TopAnime).rating,
      });
    }

    if (type === "latest-anime") {
      if ((item as LatestAnime).views && (item as LatestAnime).views !== "N/A") {
        metadata.push({
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ),
          text: (item as LatestAnime).views,
        });
      }

      if ((item as LatestAnime).duration && (item as LatestAnime).duration !== "N/A") {
        metadata.push({
          icon: (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          text: (item as LatestAnime).duration,
        });
      }
    }

    if (type === "comic") {
      metadata.push({
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        ),
        text: (item as LatestComic).type,
      });

      if ((item as LatestComic).is_hot) {
        metadata.push({
          icon: <span className="text-xs">🔥</span>,
          text: "Hot",
        });
      }

      if ((item as LatestComic).is_colored) {
        metadata.push({
          icon: <span className="text-xs">🎨</span>,
          text: "Colored",
        });
      }
    }

    if ((item as any).rank && (item as any).rank !== "N/A") {
      metadata.push({
        icon: null,
        text: `Rank ${(item as any).rank}`,
      });
    }

    return metadata;
  };

  const slideVariants = {
    hiddenNext: {
      x: "100%",
      opacity: 0,
      scale: 0.9,
    },
    hiddenPrev: {
      x: "-100%",
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exitNext: {
      x: "-100%",
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exitPrev: {
      x: "100%",
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`relative w-full h-[70vh] overflow-hidden ${className}`}>
      {/* Carousel Container */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial={direction > 0 ? "hiddenNext" : "hiddenPrev"}
            animate="visible"
            exit={direction > 0 ? "exitNext" : "exitPrev"}
            className="absolute w-full h-full"
          >
            <div className="relative w-full h-full">
              {/* Background Image with Overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url("${
                    items[currentIndex].image_url && items[currentIndex].image_url !== "N/A"
                      ? items[currentIndex].image_url
                      : "https://via.placeholder.com/1920x1080?text=Banner"
                  }")`,
                }}
              />

              {/* Content Container */}
              <div className="relative z-10 container mx-auto px-4 pb-16 md:pb-24 mt-auto h-full flex items-end">
                <div className="max-w-4xl w-full">
                  {/* Badge */}
                  {getItemBadge(items[currentIndex]) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-4"
                    >
                      <span className={`inline-block px-3 py-1 rounded-full text-sm text-white ${getItemBadge(items[currentIndex])?.className}`}>
                        {getItemBadge(items[currentIndex])?.text}
                      </span>
                    </motion.div>
                  )}

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-5xl font-bold mb-4 text-white dark:text-white"
                  >
                    {getItemTitle(items[currentIndex])}
                  </motion.h1>

                  {/* Metadata */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-3 mb-6"
                  >
                    {getItemMetadata(items[currentIndex]).map((meta, index) => (
                      <div
                        key={index}
                        className="flex items-center text-sm bg-black/50 dark:bg-black/50 text-white dark:text-white px-3 py-1 rounded-full backdrop-blur-sm"
                      >
                        {meta.icon && <span className="mr-1">{meta.icon}</span>}
                        <span>{meta.text}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      size="lg"
                      className="gap-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white"
                      asChild
                    >
                      <a href={getItemUrl(items[currentIndex])}>
                        {getItemType(items[currentIndex]) === "comic" ? (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            <span>Read Now</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Watch Now</span>
                          </>
                        )}
                      </a>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 rounded-full"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 rounded-full"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dot Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel3D;