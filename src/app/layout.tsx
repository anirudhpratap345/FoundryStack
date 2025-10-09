import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import SkipToContent from "@/components/SkipToContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoundryStack - Convert Ideas to Blueprints",
  description: "Transform startup ideas into end-to-end blueprints and 4-week implementation plans with AI-powered analysis and orchestration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollProgress />
        <SkipToContent />
        <Navbar />
        <ErrorBoundary>
          <main id="main">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
