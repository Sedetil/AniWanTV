import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1b] text-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-extrabold mb-4 text-purple-500 animate-bounce">
          404
        </h1>
        <p className="text-2xl font-semibold mb-2">Halaman tidak ditemukan 😥</p>
        <p className="text-md text-gray-400 mb-6">
          Sepertinya halaman yang kamu cari tidak tersedia di dunia anime ini.
        </p>
        <a
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 transition-colors duration-300 text-white font-semibold py-2 px-6 rounded-full shadow-lg"
        >
          🔙 Kembali ke Beranda
        </a>
        <div className="mt-6 text-sm text-gray-500">
          Kamu mencoba membuka: <span className="italic">{location.pathname}</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
