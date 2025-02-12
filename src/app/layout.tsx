import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quizmify",
  description: "Quiz yourself on anything!"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "antialiased h-screen w-screen")}>
        <Providers>
          <Navbar />
          <main className="flex-grow overflow-auto">
            <Suspense>{children}</Suspense>
          </main>
          <Toaster/>
        </Providers>
      </body>
    </html>
  );
}