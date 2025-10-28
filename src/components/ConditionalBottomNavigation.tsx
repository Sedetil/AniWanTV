import { useLocation } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

const ConditionalBottomNavigation = () => {
  const location = useLocation();
  
  // Halaman di mana bottom navigation akan ditampilkan
  const showBottomNavigationPages = [
    '/',
    '/latest-anime',
    '/latest-comics',
    '/bookmarks',
    '/search'
  ];
  
  // Halaman di mana bottom navigation TIDAK akan ditampilkan
  const hideBottomNavigationPages = [
    '/read/',
    '/anime/',
    '/donghua/',
    '/donghua-episode/',
    '/series/',
    '/film/',
    '/episode/',
    '/comics/',
    '/comic/',
    '/latest',
    '/top',
    '/schedule',
    '/popular-comics'
  ];
  
  // Periksa apakah halaman saat ini adalah halaman yang diizinkan
  const shouldShowBottomNav = showBottomNavigationPages.some(page =>
    location.pathname === page || location.pathname.startsWith(page)
  ) && !hideBottomNavigationPages.some(page =>
    location.pathname === page || location.pathname.startsWith(page)
  );
  
  // Debug: Log current path and bottom navigation status
  console.log('Current path:', location.pathname);
  console.log('Should show bottom nav:', shouldShowBottomNav);
  
  return shouldShowBottomNav ? <BottomNavigation /> : null;
};

export default ConditionalBottomNavigation;