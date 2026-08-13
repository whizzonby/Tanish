import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Taniesha Linton Flemmings | Clean Spaces. Clear Mind. Successful Life.",
    template: "%s | Taniesha Linton Flemmings",
  },
  description:
    "Life coach, author, and founder of Caring Touch Reno Construction Ltd. Coaching, cleaning, construction & renovation, interior decor, and the book Declutter: Your Way to Success.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 text-navy-950 font-sans">
        {children}
      </body>
    </html>
  );
}
