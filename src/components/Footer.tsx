
import { Link } from "react-router-dom";
import { Github, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gradient">WinbuAnime</h3>
            <p className="text-sm text-muted-foreground">
              A modern anime streaming platform built with React, NextJS, and TailwindCSS.
              This project is for educational purposes only.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/latest" className="text-muted-foreground hover:text-primary transition-colors">
                  Latest Anime
                </Link>
              </li>
              <li>
                <Link to="/top" className="text-muted-foreground hover:text-primary transition-colors">
                  Top Anime
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              This website is intended solely for educational purposes. The content provided
              is not hosted by us, and we are not affiliated with any third-party content providers.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border/50 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} WinbuAnime. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <span className="text-sm text-muted-foreground flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for anime fans
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
