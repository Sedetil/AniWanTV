import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "gradient" | "particles" | "waves" | "floating";
}

const AnimatedBackground = ({ 
  children, 
  className, 
  variant = "gradient" 
}: AnimatedBackgroundProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const throttledHandleMouseMove = throttle(handleMouseMove, 16); // Throttle to ~60fps
    window.addEventListener("mousemove", throttledHandleMouseMove);
    return () => window.removeEventListener("mousemove", throttledHandleMouseMove);
  }, []);

  // Throttle function to limit how often the mouse position is updated
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  if (variant === "gradient") {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 50%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  if (variant === "particles") {
    // Generate particles once and reuse them
    const particles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 5 + Math.random() * 10,
      delay: Math.random() * 5,
    }));

    return (
      <div className={cn("relative overflow-hidden", className)}>
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  if (variant === "waves") {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
              <motion.path
                d="M0 10 Q 25 0 50 10 T 100 10"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
                animate={{
                  d: [
                    "M0 10 Q 25 0 50 10 T 100 10",
                    "M0 10 Q 25 20 50 10 T 100 10",
                    "M0 10 Q 25 0 50 10 T 100 10",
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waves)" className="text-primary/5" />
        </svg>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  if (variant === "floating") {
    // Generate floating elements once and reuse them
    const floatingElements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: 10 + (i % 3) * 30,
      top: 10 + Math.floor(i / 3) * 30,
      duration: 6 + i * 2,
    }));

    return (
      <div className={cn("relative overflow-hidden", className)}>
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 119, 198, 0.1), transparent 40%)`,
          }}
          transition={{ type: "tween", ease: "out", duration: 0.3 }}
        />
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute w-32 h-32 rounded-full bg-primary/10 blur-xl"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return <div className={cn("", className)}>{children}</div>;
};

export default AnimatedBackground;