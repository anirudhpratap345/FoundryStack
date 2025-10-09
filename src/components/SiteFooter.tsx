"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 glass-subtle py-14">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="text-white font-bold text-lg mb-2">FoundryStack</div>
            <div className="text-gray-400 text-sm">© {new Date().getFullYear()} FoundryStack. All rights reserved.</div>
          </div>
          <nav className="flex items-center gap-6 text-gray-300">
            <Link href="/blueprints" className="hover:text-white">Blueprints</Link>
            <Link href="/docs" className="hover:text-white">Docs</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </nav>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="text-white/80 hover:text-white">
              <Github className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="text-white/80 hover:text-white">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-white/80 hover:text-white">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
