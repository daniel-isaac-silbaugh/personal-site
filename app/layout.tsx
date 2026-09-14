import type { Metadata } from "next";
import { Source_Serif_4, Jost, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

// Annotation face: dimensions, callouts, the title block. Mono is what
// technical lettering reads as.
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-site",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Jost, letterspaced and set in caps, stands in for drafting lettering.
const jost = Jost({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Daniel Isaac Silbaugh",
  description:
    "Projects, essays, fiction, and a working diary by Daniel Isaac Silbaugh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${jost.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
            } catch(e) {}
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
