import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import SkipToContent from "@/components/SkipToContent";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
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
        className={`${inter.variable} ${geistMono.variable} antialiased`}
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
