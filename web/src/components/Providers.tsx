"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark">
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
