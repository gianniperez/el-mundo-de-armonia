import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4, Dawning_of_a_New_Day } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dawningScript = Dawning_of_a_New_Day({
  variable: "--font-dawning",
  subsets: ["latin"],
  weight: ["400"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} ${dawningScript.variable} h-full antialiased dark`}
    >
      <head>
        {/* Adobe Fonts (Typekit) para Adobe Handwriting (Ernie / Tiffany) */}
        <link rel="stylesheet" href="https://use.typekit.net/dqh7tzt.css" />
      </head>
      <body className="min-h-full bg-black text-white selection:bg-amber-400 selection:text-black overflow-hidden m-0 p-0">
        {children}
      </body>
    </html>
  );
}
