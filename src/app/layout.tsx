import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qizzle",
  description: "Quiz yourself on anything!"
};

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