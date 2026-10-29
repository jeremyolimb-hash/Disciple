import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-serif-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Disciple — Turn one sermon series into a month of ministry resources",
  description:
    "Disciple turns your sermon series plan into small group guides, devotionals, kids lessons, social posts, and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-stone-200 bg-parchment/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
              Disciple
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <Link href="/#how-it-works" className="btn-ghost hidden sm:inline-flex">
                How it works
              </Link>
              <Link href="/#pricing" className="btn-ghost hidden sm:inline-flex">
                Pricing
              </Link>
              <Link href="/dashboard" className="btn-ghost">
                My series
              </Link>
              <Link href="/series/new" className="btn-primary ml-2">
                New series
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 py-8 text-center text-xs text-stone-500">
          © Disciple · Built for pastors and church staff
        </footer>
      </body>
    </html>
  );
}
