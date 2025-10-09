"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  glow?: boolean;
  delay?: number;
}

export default function AnimatedButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  glow = false,
  delay = 0
}: AnimatedButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-white text-black hover:bg-black hover:text-white border border-white/10 hover:border-white/30 shadow-lg shadow-white/20";
      case "secondary":
        return "bg-white/10 text-white hover:bg-white/20 border border-white/20";
      case "outline":
        return "border border-white/20 text-white hover:bg-white/10 bg-transparent";
      case "ghost":
        return "text-white hover:bg-white/10 bg-transparent border-0";
      default:
        return "";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-9 px-4 text-sm";
      case "lg":
        return "h-12 px-6 text-base font-medium";
      default:
        return "h-10 px-5 text-sm";
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 0 24px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.35)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${glow ? "animate-pulse-glow" : ""}
        rounded-full font-medium transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-3
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
