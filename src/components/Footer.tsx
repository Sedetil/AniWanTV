import { Link } from "react-router-dom";
import { Github, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gradient">AniWanTV</h3>
            <p className="text-sm text-muted-foreground">
              Nikmati dunia anime terbaik dengan tampilan modern, cepat, dan nyaman.
              Temukan serial favoritmu dan jelajahi beragam judul seru hanya di AniWanTV.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Jelajahi</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/latest" className="text-muted-foreground hover:text-primary transition-colors">
                  Anime Terbaru
                </Link>
              </li>
              <li>
                <Link to="/top" className="text-muted-foreground hover:text-primary transition-colors">
                  Anime Terpopuler
                </Link>
              </li>
              <li>
                <Link to="/comics" className="text-muted-foreground hover:text-primary transition-colors">
                  Komik Terbaru
                </Link>
              </li>
              <li>
                <Link to="/comics/popular" className="text-muted-foreground hover:text-primary transition-colors">
                  Komik Terpopuler
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-muted-foreground hover:text-primary transition-colors">
                  Schedule
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Tentang Kami</h3>
            <p className="text-sm text-muted-foreground">
              AniWanTV hadir untuk memberikan pengalaman terbaik bagi para pecinta anime.
              Dibangun dengan dedikasi dan cinta terhadap budaya anime.
            </p>
          </div>

        </div>

        <div className="mt-8 pt-4 border-t border-border/50 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} AniWanTV. Semua hak dilindungi.
          </p>
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/Sedetil" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <span className="text-sm text-muted-foreground flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> by wanzzbot
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
