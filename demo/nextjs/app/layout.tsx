import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@intermezzo-chess/chessground-react/style.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "@intermezzo-chess/chessground-react — Next.js tree-shaking check",
  description:
    "A real Next.js consumer of @intermezzo-chess/chessground-react, installed via dist/ (not aliased source), used to verify the library's CSS survives production bundling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
