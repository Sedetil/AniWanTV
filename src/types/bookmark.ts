export interface Bookmark {
  id: string;
  title: string;
  type: "anime" | "komik";
  lastProgress: number; // nomor chapter atau episode terakhir
  category: "Sedang Dibaca" | "Sedang Ditonton" | "Favorit" | "Selesai" | "Ingin Ditonton" | "Ingin Dibaca";
  updatedAt: string;
  imageUrl?: string;
}