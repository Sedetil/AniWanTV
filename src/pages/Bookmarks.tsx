import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark as BookmarkType } from "@/types/bookmark";
import {
  getBookmarks,
  getBookmarksByType,
  getBookmarksByCategory,
  removeBookmark,
  updateCategory,
} from "@/utils/bookmarkUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark as BookmarkIcon, Trash2, Edit, Tv, Book, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const loadBookmarks = () => {
      const allBookmarks = getBookmarks();
      setBookmarks(allBookmarks);
      setFilteredBookmarks(allBookmarks);
    };

    loadBookmarks();
    
    // Listen for storage changes to sync across tabs
    const handleStorageChange = () => {
      loadBookmarks();
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    let filtered = bookmarks;

    if (activeTab === "anime") {
      filtered = getBookmarksByType("anime");
    } else if (activeTab === "komik") {
      filtered = getBookmarksByType("komik");
    } else if (activeTab !== "all") {
      filtered = getBookmarksByCategory(activeTab as BookmarkType["category"]);
    }

    setFilteredBookmarks(filtered);
  }, [bookmarks, activeTab]);

  const handleRemoveBookmark = (id: string) => {
    const updatedBookmarks = removeBookmark(id);
    setBookmarks(updatedBookmarks);
    toast.success("Bookmark removed successfully");
  };

  const handleUpdateCategory = (id: string, category: BookmarkType["category"]) => {
    const updatedBookmarks = updateCategory(id, category);
    setBookmarks(updatedBookmarks);
    setEditingId(null);
    setSelectedCategory("");
    toast.success("Category updated successfully");
  };

  const getCategoryColor = (category: BookmarkType["category"]) => {
    switch (category) {
      case "Sedang Dibaca":
        return "bg-blue-500";
      case "Sedang Ditonton":
        return "bg-purple-500";
      case "Favorit":
        return "bg-red-500";
      case "Selesai":
        return "bg-green-500";
      case "Ingin Ditonton":
        return "bg-yellow-500";
      case "Ingin Dibaca":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getProgressText = (bookmark: BookmarkType) => {
    const type = bookmark.type === "anime" ? "Episode" : "Chapter";
    return `${type} ${bookmark.lastProgress}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBookmarkUrl = (bookmark: BookmarkType) => {
    if (bookmark.type === "anime") {
      return `/anime/${encodeURIComponent(bookmark.id)}`;
    } else {
      return `/comic/${encodeURIComponent(bookmark.id)}`;
    }
  };

  const categories: BookmarkType["category"][] = [
    "Sedang Dibaca",
    "Sedang Ditonton",
    "Favorit",
    "Selesai",
    "Ingin Ditonton",
    "Ingin Dibaca",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 md:pt-20 lg:pt-24">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookmarkIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">My Bookmarks</h1>
            </div>
            <Badge variant="secondary" className="text-sm">
              {bookmarks.length} items
            </Badge>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-16">
              <BookmarkIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
              <p className="text-muted-foreground mb-6">
                Start bookmarking your favorite anime and comics to keep track of your progress.
              </p>
              <Link to="/">
                <Button>Browse Anime & Comics</Button>
              </Link>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-8 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="anime">Anime</TabsTrigger>
                <TabsTrigger value="komik">Comics</TabsTrigger>
                <TabsTrigger value="Sedang Dibaca">Reading</TabsTrigger>
                <TabsTrigger value="Sedang Ditonton">Watching</TabsTrigger>
                <TabsTrigger value="Favorit">Favorites</TabsTrigger>
                <TabsTrigger value="Selesai">Completed</TabsTrigger>
                <TabsTrigger value="Ingin Dibaca">Want to Read</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredBookmarks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No bookmarks found in this category.</p>
                  </div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    <AnimatePresence>
                      {filteredBookmarks.map((bookmark) => (
                        <motion.div
                          key={bookmark.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{
                            opacity: 0,
                            scale: 0.8,
                            transition: { duration: 0.2 }
                          }}
                          layout
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 24
                          }}
                        >
                          <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="flex">
                            <div className="w-20 h-28 flex-shrink-0 bg-muted">
                              {bookmark.imageUrl && (
                                <img
                                  src={bookmark.imageUrl}
                                  alt={bookmark.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-1">
                                  {bookmark.type === "anime" ? (
                                    <Tv className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Book className="h-4 w-4 text-primary" />
                                  )}
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs text-white ${getCategoryColor(bookmark.category)}`}
                                  >
                                    {bookmark.category}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      setEditingId(bookmark.id);
                                      setSelectedCategory(bookmark.category);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleRemoveBookmark(bookmark.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {editingId === bookmark.id ? (
                                <div className="mb-2">
                                  <Select
                                    value={selectedCategory}
                                    onValueChange={(value) =>
                                      handleUpdateCategory(bookmark.id, value as BookmarkType["category"])
                                    }
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                          {category}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              ) : (
                                <Link
                                  to={getBookmarkUrl(bookmark)}
                                  className="block mb-2 hover:text-primary transition-colors"
                                >
                                  <h3 className="font-medium text-sm line-clamp-2">{bookmark.title}</h3>
                                </Link>
                              )}

                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{getProgressText(bookmark)}</span>
                                <span>{formatDate(bookmark.updatedAt)}</span>
                              </div>

                              <Link to={getBookmarkUrl(bookmark)} className="mt-2">
                                <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                                  Continue
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                          </CardContent>
                        </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookmarks;