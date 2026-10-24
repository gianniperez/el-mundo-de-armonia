import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Dancing_Script } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "El Mundo de Armonía — Novela Visual",
  description: "Novela visual interactiva ilustrada. Toma decisiones y acompaña a Daniel Torres en su aventura hacia el reino de Armonía.",
};

export default function GameLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${dancingScript.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-black text-white selection:bg-amber-400 selection:text-black overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
