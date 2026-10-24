import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HIRA Bakery — Modern Virtual Baking Kitchen",
  description: "A modern, photorealistic virtual baking kitchen that teaches kids real cooking science. Learn step-by-step with Chef Bear, earn badges, and bake amazing treats!",
  keywords: ["HIRA Bakery", "baking", "kitchen", "kids learning", "cooking school", "simulation", "virtual bakery", "recipe", "chemistry", "Next.js"],
  authors: [{ name: "HIRA Bakery" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
    shortcut: "/logo.svg",
  },
  appleWebApp: {
    capable: true,
    title: "HIRA Bakery",
    statusBarStyle: "default",
  },
};

// iOS / iPad viewport: safe-area aware, allows user scaling for accessibility,
// prevents the bounce scroll on the canvas interactions
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#b8602b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
