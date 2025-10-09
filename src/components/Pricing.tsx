"use client";

import GlassCard from "./GlassCard";
import AnimatedButton from "./AnimatedButton";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    features: [
      "3 blueprints / month",
      "JSON export",
      "Basic templates",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    features: [
      "Unlimited blueprints",
      "JSON/Markdown/HTML exports",
      "Priority generation",
      "Advanced templates",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "/mo",
    features: [
      "Up to 5 collaborators",
      "Shared libraries",
      "Team exports",
    ],
    cta: "Start Team Plan",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative z-10 container mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Simple, transparent pricing</h3>
        <p className="text-gray-300 mt-3">Start free. Upgrade when you’re ready.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier, idx) => (
          <GlassCard
            key={tier.name}
            variant={tier.highlighted ? "strong" : "default"}
            glow={tier.highlighted ? "purple" : "none"}
            delay={0.1 * idx}
            className={`${tier.highlighted ? "border-white/20 glow-border" : ""}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-white">{tier.name}</h4>
              {tier.highlighted && (
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80">Popular</span>
              )}
            </div>
            <div className="text-white mb-6">
              <span className="text-4xl font-bold">{tier.price}</span>
              <span className="text-white/60 ml-1">{tier.period}</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-2 mb-6">
              {tier.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                  {f}
                </li>
              ))}
            </ul>
            <AnimatedButton
              variant={tier.highlighted ? "primary" : "outline"}
              size="lg"
              className="w-full"
            >
              {tier.cta}
            </AnimatedButton>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}


