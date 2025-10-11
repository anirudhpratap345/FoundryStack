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
  title: "Finance Copilot - AI Finance Strategy for Founders",
  description: "Get personalized funding strategies for your startup with AI. Discover your ideal funding stage, raise amount, investor types, runway guidance, and budget allocation.",
  openGraph: {
    title: "Finance Copilot - AI Finance Strategy for Founders",
    description: "AI-powered financial strategy recommendations for startup founders. Get funding stage analysis, raise calculations, and investor matching.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance Copilot - AI Finance Strategy for Founders",
    description: "Get personalized funding strategies for your startup with AI.",
  },
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
