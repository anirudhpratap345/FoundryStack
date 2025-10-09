"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  const steps = [
    { title: "Retrieve", desc: "Qdrant finds relevant context for your idea." },
    { title: "Write", desc: "Gemini 2.5 Pro drafts a 10-section blueprint." },
    { title: "Review", desc: "Quality pass across Accuracy, Clarity, Completeness." },
    { title: "Export", desc: "JSON / Markdown / HTML outputs you can share." },
  ];

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[70] grid place-items-center" role="dialog" aria-modal="true"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
          className="relative z-10 w-[min(92vw,900px)] rounded-2xl glass-strong border border-white/10 p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl md:text-2xl font-semibold text-white">How it works</h3>
            <button onClick={onClose} aria-label="Close" className="text-white/70 hover:text-white">✕</button>
          </div>
          <ol className="grid md:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <motion.li key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                className="rounded-xl glass-subtle border border-white/10 p-4">
                <div className="text-white/80 text-sm mb-1">Step {i + 1}</div>
                <div className="text-white font-medium">{s.title}</div>
                <p className="text-gray-300 text-sm mt-2">{s.desc}</p>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


