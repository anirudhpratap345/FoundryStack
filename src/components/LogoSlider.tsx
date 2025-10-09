"use client";

import { motion } from "framer-motion";

const logos = [
  { name: "Vertex", svg: () => (<svg width="80" height="20" viewBox="0 0 80 20" className="text-white/80"><rect width="80" height="2" fill="currentColor"/></svg>) },
  { name: "Quantica", svg: () => (<svg width="80" height="20" viewBox="0 0 80 20" className="text-white/80"><circle cx="10" cy="10" r="4" fill="currentColor"/></svg>) },
  { name: "Aurora", svg: () => (<svg width="80" height="20" viewBox="0 0 80 20" className="text-white/80"><path d="M0 10 L20 2 L40 10 L60 2 L80 10" stroke="currentColor" strokeWidth="2" fill="none"/></svg>) },
  { name: "Nimbus", svg: () => (<svg width="80" height="20" viewBox="0 0 80 20" className="text-white/80"><rect x="0" y="8" width="80" height="4" fill="currentColor"/></svg>) },
  { name: "Solace", svg: () => (<svg width="80" height="20" viewBox="0 0 80 20" className="text-white/80"><circle cx="40" cy="10" r="6" stroke="currentColor" strokeWidth="2" fill="none"/></svg>) },
];

export default function LogoSlider() {
  const track = [...logos, ...logos, ...logos];
  return (
    <section className="relative z-10 container mx-auto px-6 py-12">
      <div className="glass-subtle rounded-full border border-white/10 p-3 overflow-hidden logo-track">
        <motion.div
          className="flex items-center gap-10 whitespace-nowrap"
          animate={{ x: [0, -600] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          {track.map((l, i) => (
            <div key={`${l.name}-${i}`} className="opacity-80 hover:opacity-100 transition-opacity">
              <l.svg />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
