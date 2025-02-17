import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qizzle",
  description: "Quiz yourself on anything!",
  icons: {
    icon: [
      {
        url: '/favicon_io/favicon-32x32.png',
        sizes: '32x32',
      },
      {
        url: '/favicon_io/android-chrome-192x192.png',
        sizes: '192x192',
      },
      {
        url: '/favicon_io/android-chrome-512x512.png',
        sizes: '512x512',
      },
    ],
    apple: [
      {
        url: '/favicon_io/apple-icon.png',
        sizes: '180x180',
      },
    ],
  },
  manifest: '/favicon_io/site.webmanifest',
  // appleWebApp: {
  //   capable: true,
  //   title: 'Qizzle',
  //   statusBarStyle: 'black-translucent',
    

  // },
};

export const viewport: Viewport = {
  themeColor: [
    { 
      media: '(prefers-color-scheme: light)', 
      color: 'hsl(var(--background))' 
    },
    { 
      media: '(prefers-color-scheme: dark)', 
      color: 'hsl(var(--background))' 
    },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased min-h-screen ")}>
        <Providers>
          <Navbar />
          <main className="flex-grow overflow-auto">
            <Suspense>{children}</Suspense>
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}