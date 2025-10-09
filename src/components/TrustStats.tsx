"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Founders Served", value: "5k+" },
  { label: "Avg. Time Saved", value: "72%" },
  { label: "Blueprints Generated", value: "18k" },
  { label: "NPS", value: "68" },
];

export default function TrustStats() {
  return (
    <section className="relative z-10 container mx-auto px-6 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="text-center"
          >
            <div className="neon-ring w-28 h-28 mx-auto grid place-items-center mb-4">
              <div className="text-2xl font-extrabold text-white">{s.value}</div>
            </div>
            <div className="text-sm text-gray-300">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
