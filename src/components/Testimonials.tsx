"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "./GlassCard";

const testimonials = [
  {
    quote: "FoundryStack helped us go from idea to execution plan in a weekend.",
    author: "Ava Thompson",
    role: "Founder, FinWise AI",
  },
  {
    quote: "The AI-generated technical blueprint was better than our agency’s.",
    author: "Liam Patel",
    role: "CTO, RapidCart",
  },
  {
    quote: "We raised seed funding using the exported materials. Incredible.",
    author: "Sophia Kim",
    role: "CEO, HealthFlow",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative z-10 container mx-auto px-6 py-20" id="testimonials">
      <div className="text-center mb-12">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-white tracking-tight"
        >
          What founders say
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-300 mt-3"
        >
          Real outcomes from teams using FoundryStack
        </motion.p>
      </div>

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard variant="strong" glow="purple" className="text-center p-10 glow-border">
              <p className="text-xl md:text-2xl text-white/95 leading-relaxed tracking-tight mb-6">
                “{testimonials[index].quote}”
              </p>
              <div className="text-gray-300">
                <span className="font-semibold text-white">{testimonials[index].author}</span> · {testimonials[index].role}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-all ${i === index ? "bg-white w-6" : "bg-white/30"}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


