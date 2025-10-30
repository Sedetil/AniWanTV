import { Bookmark } from "@/types/bookmark";

const BOOKMARK_STORAGE_KEY = "aniwantv_bookmarks";

// Helper function to get appropriate default category based on type
const getDefaultCategory = (type: "anime" | "komik"): Bookmark["category"] => {
  return type === "anime" ? "Sedang Ditonton" : "Sedang Dibaca";
};

// Get all bookmarks from localStorage
export const getBookmarks = (): Bookmark[] => {
  try {
    const bookmarksJson = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    if (!bookmarksJson) return [];
    
    const bookmarks = JSON.parse(bookmarksJson) as Bookmark[];
    // Sort by updatedAt in descending order (most recent first)
    return bookmarks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error("Error getting bookmarks:", error);
    return [];
  }
};

// Add a new bookmark
export const addBookmark = (bookmark: Omit<Bookmark, "updatedAt">): Bookmark[] => {
  try {
    // Validate bookmark data
    if (!bookmark.id || !bookmark.title || !bookmark.type) {
      console.error("Invalid bookmark data:", bookmark);
      return getBookmarks();
    }
    
    // Normalize the ID to ensure consistency
    const normalizedId = bookmark.id.trim().toLowerCase();
    
    const bookmarks = getBookmarks();
    
    // Check if bookmark already exists with normalized ID
    const existingIndex = bookmarks.findIndex(b => b.id.trim().toLowerCase() === normalizedId);
    
    if (existingIndex >= 0) {
      // Update existing bookmark with new data, but preserve existing complete data
      const existingBookmark = bookmarks[existingIndex];
      const updatedBookmark: Bookmark = {
        ...existingBookmark, // Keep all existing data
        ...bookmark, // Override with new data
        id: normalizedId, // Ensure normalized ID
        updatedAt: new Date().toISOString(),
        // Preserve imageUrl if existing one is more complete
        imageUrl: bookmark.imageUrl || existingBookmark.imageUrl,
        // Preserve title if existing one is more complete
        title: bookmark.title !== "Unknown Anime" ? bookmark.title : existingBookmark.title,
      };
      
      bookmarks[existingIndex] = updatedBookmark;
      console.log("Updated existing bookmark:", updatedBookmark);
    } else {
      // Add new bookmark
      const newBookmark: Bookmark = {
        ...bookmark,
        id: normalizedId, // Use normalized ID
        updatedAt: new Date().toISOString(),
      };
      bookmarks.push(newBookmark);
      console.log("Added new bookmark:", newBookmark);
    }
    
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
    return getBookmarks(); // Return sorted bookmarks
  } catch (error) {
    console.error("Error adding bookmark:", error);
    return getBookmarks();
  }
};

// Remove a bookmark by ID
export const removeBookmark = (id: string): Bookmark[] => {
  try {
    // Normalize the ID for consistency
    const normalizedId = id.trim().toLowerCase();
    const bookmarks = getBookmarks();
    const filteredBookmarks = bookmarks.filter(b => b.id.trim().toLowerCase() !== normalizedId);
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(filteredBookmarks));
    return filteredBookmarks;
  } catch (error) {
    console.error("Error removing bookmark:", error);
    return getBookmarks();
  }
};

// Update progress for a bookmark
export const updateProgress = (id: string, progress: number): Bookmark[] => {
  try {
    if (!id) {
      console.error("No ID provided for progress update");
      return getBookmarks();
    }
    
    // Normalize the ID for consistency
    const normalizedId = id.trim().toLowerCase();
    const bookmarks = getBookmarks();
    const bookmarkIndex = bookmarks.findIndex(b => b.id.trim().toLowerCase() === normalizedId);
    
    if (bookmarkIndex >= 0) {
      const oldProgress = bookmarks[bookmarkIndex].lastProgress;
      bookmarks[bookmarkIndex].lastProgress = progress;
      bookmarks[bookmarkIndex].updatedAt = new Date().toISOString();
      
      // Auto-update category based on progress
      if (progress >= 100) {
        bookmarks[bookmarkIndex].category = "Selesai";
      } else if (bookmarks[bookmarkIndex].category === "Ingin Ditonton") {
        // Use appropriate category based on type
        bookmarks[bookmarkIndex].category = getDefaultCategory(bookmarks[bookmarkIndex].type);
      }
      
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
      console.log(`Updated progress for ${normalizedId}: ${oldProgress} -> ${progress}`);
    } else {
      console.warn(`Bookmark with ID ${normalizedId} not found for progress update`);
    }
    
    return getBookmarks();
  } catch (error) {
    console.error("Error updating progress:", error);
    return getBookmarks();
  }
};

// Update category for a bookmark
export const updateCategory = (id: string, category: Bookmark["category"]): Bookmark[] => {
  try {
    // Normalize the ID for consistency
    const normalizedId = id.trim().toLowerCase();
    const bookmarks = getBookmarks();
    const bookmarkIndex = bookmarks.findIndex(b => b.id.trim().toLowerCase() === normalizedId);
    
    if (bookmarkIndex >= 0) {
      bookmarks[bookmarkIndex].category = category;
      bookmarks[bookmarkIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
    }
    
    return getBookmarks();
  } catch (error) {
    console.error("Error updating category:", error);
    return getBookmarks();
  }
};

// Check if an item is bookmarked
export const isBookmarked = (id: string): boolean => {
  if (!id) {
    console.error("No ID provided for bookmark check");
    return false;
  }
  
  try {
    // Normalize the ID for consistency
    const normalizedId = id.trim().toLowerCase();
    const bookmarks = getBookmarks();
    const isBookmarked = bookmarks.some(b => b.id.trim().toLowerCase() === normalizedId);
    console.log(`Checking if ${normalizedId} is bookmarked: ${isBookmarked}`);
    return isBookmarked;
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
};

// Get a specific bookmark by ID
export const getBookmark = (id: string): Bookmark | null => {
  // Normalize the ID for consistency
  const normalizedId = id.trim().toLowerCase();
  const bookmarks = getBookmarks();
  return bookmarks.find(b => b.id.trim().toLowerCase() === normalizedId) || null;
};

// Get bookmarks by type (anime or komik)
export const getBookmarksByType = (type: "anime" | "komik"): Bookmark[] => {
  const bookmarks = getBookmarks();
  return bookmarks.filter(b => b.type === type);
};

// Get bookmarks by category
export const getBookmarksByCategory = (category: Bookmark["category"]): Bookmark[] => {
  const bookmarks = getBookmarks();
  return bookmarks.filter(b => b.category === category);
};

// Extract episode number from episode title
export const extractEpisodeNumber = (title: string): number => {
  // Handle various formats: "Episode 1", "Eps 1", "Ep 1", "1", etc.
  const patterns = [
    /episode\s*(\d+)/i,
    /eps?\.?\s*(\d+)/i,
    /(\d+)(?:\s*|$)/,
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return 0;
};

// Clean up duplicate bookmarks (same anime with different IDs)
export const cleanupDuplicateBookmarks = (): Bookmark[] => {
  try {
    const bookmarks = getBookmarks();
    const uniqueBookmarks: Bookmark[] = [];
    const seenIds = new Set<string>();
    
    // Group bookmarks by normalized title to find potential duplicates
    const titleGroups: Record<string, Bookmark[]> = {};
    
    bookmarks.forEach(bookmark => {
      const normalizedTitle = bookmark.title.toLowerCase().trim();
      if (!titleGroups[normalizedTitle]) {
        titleGroups[normalizedTitle] = [];
      }
      titleGroups[normalizedTitle].push(bookmark);
    });
    
    // Process each group to find the best bookmark
    Object.values(titleGroups).forEach(group => {
      if (group.length === 1) {
        // Only one bookmark with this title, keep it
        const bookmark = group[0];
        const normalizedId = bookmark.id.trim().toLowerCase();
        if (!seenIds.has(normalizedId)) {
          uniqueBookmarks.push(bookmark);
          seenIds.add(normalizedId);
        }
      } else {
        // Multiple bookmarks with similar titles, find the most complete one
        let bestBookmark = group[0];
        let bestScore = 0;
        
        group.forEach(bookmark => {
          let score = 0;
          // Prefer bookmarks with complete data
          if (bookmark.title && bookmark.title !== "Unknown Anime") score += 3;
          if (bookmark.imageUrl) score += 2;
          if (bookmark.lastProgress > 0) score += 1;
          if (bookmark.category && bookmark.category !== "Sedang Ditonton") score += 1;
          
          if (score > bestScore) {
            bestScore = score;
            bestBookmark = bookmark;
          }
        });
        
        const normalizedId = bestBookmark.id.trim().toLowerCase();
        if (!seenIds.has(normalizedId)) {
          uniqueBookmarks.push(bestBookmark);
          seenIds.add(normalizedId);
        }
      }
    });
    
    // Save the cleaned up bookmarks
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(uniqueBookmarks));
    console.log(`Cleaned up ${bookmarks.length - uniqueBookmarks.length} duplicate bookmarks`);
    
    return uniqueBookmarks;
  } catch (error) {
    console.error("Error cleaning up duplicate bookmarks:", error);
    return getBookmarks();
  }
};

// Extract chapter number from chapter title
export const extractChapterNumber = (title: string): number => {
  // Handle various formats: "Chapter 1", "Ch 1", "Chapter 1: Title", etc.
  const patterns = [
    /chapter\s*(\d+)/i,
    /ch\.?\s*(\d+)/i,
    /(\d+)(?:\s*|$)/,
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return 0;
};