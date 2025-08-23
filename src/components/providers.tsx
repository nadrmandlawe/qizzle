'use client';
import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

const Providers = ({ children }: ThemeProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        {children}
        <Toaster />
      </SessionProvider>
    </NextThemesProvider>
  </QueryClientProvider>
  );
};

export default Providers;