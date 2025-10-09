"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "strong" | "subtle";
  hover?: boolean;
  glow?: "purple" | "pink" | "blue" | "none";
  delay?: number;
  elevatedOnHover?: boolean;
}

export default function GlassCard({ 
  children, 
  className = "", 
  variant = "default",
  hover = true,
  glow = "none",
  delay = 0,
  elevatedOnHover = true
}: GlassCardProps) {
  const getVariantClass = () => {
    switch (variant) {
      case "strong":
        return "glass-strong";
      case "subtle":
        return "glass-subtle";
      default:
        return "glass";
    }
  };

  const getGlowClass = () => {
    switch (glow) {
      case "purple":
        return "glow-purple";
      case "pink":
        return "glow-pink";
      case "blue":
        return "glow-blue";
      default:
        return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: "easeOut"
      }}
      whileHover={hover ? { 
        y: -8,
        boxShadow: elevatedOnHover ? "0 24px 60px rgba(0,0,0,0.35)" : undefined,
        transition: { duration: 0.3 }
      } : {}}
      className={`
        ${getVariantClass()} 
        ${getGlowClass()}
        ${hover ? "hover-lift" : ""}
        rounded-2xl p-6 border border-white/10 shape-shift
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
