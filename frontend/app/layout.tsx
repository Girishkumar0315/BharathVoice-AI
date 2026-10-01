import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import MasterpieceBackground from "@/components/MasterpieceBackground";

const display = Sora({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "BharathVoice AI — Voice-First Multilingual Platform",
  description:
    "A multilingual, voice-first AI assistant helping citizens access verified public-service schemes in Telugu, Hindi, Kannada, and English.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} font-body bg-void text-bone antialiased selection:bg-saffron/30 selection:text-white`}>
        <MasterpieceBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
