import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  type?: "typing" | "fade" | "slide" | "bounce";
  delay?: number;
  duration?: number;
}

const AnimatedText = ({ 
  text, 
  className, 
  type = "fade", 
  delay = 0, 
  duration = 0.5 
}: AnimatedTextProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration,
        ease: "easeOut",
      },
    },
  };

  const typingVariants = {
    hidden: { width: 0 },
    visible: {
      width: "auto",
      transition: {
        duration: duration,
        ease: "easeOut",
      },
    },
  };

  const slideVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: duration,
        ease: "easeOut",
      },
    },
  };

  const bounceVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: duration,
      },
    },
  };

  const getVariants = () => {
    switch (type) {
      case "typing":
        return {
          container: typingVariants,
          child: {},
        };
      case "slide":
        return {
          container: slideVariants,
          child: {},
        };
      case "bounce":
        return {
          container: bounceVariants,
          child: {},
        };
      default:
        return {
          container: containerVariants,
          child: childVariants,
        };
    }
  };

  const variants = getVariants();

  if (type === "typing") {
    return (
      <div className={cn("overflow-hidden", className)}>
        <motion.div
          className="whitespace-nowrap"
          variants={variants.container}
          initial="hidden"
          animate="visible"
          transition={{
            delay,
            duration: duration * 1.5,
            ease: "easeInOut"
          }}
        >
          {text}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn("", className)}
      variants={variants.container}
      initial="hidden"
      animate="visible"
      transition={{
        staggerChildren: 0.03,
        delayChildren: delay,
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={variants.child}
          style={{ display: "inline-block" }}
          transition={{
            duration: duration,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default AnimatedText;