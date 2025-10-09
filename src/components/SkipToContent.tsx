"use client";

export default function SkipToContent() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] bg-black text-white px-4 py-2 rounded"
    >
      Skip to content
    </a>
  );
}


