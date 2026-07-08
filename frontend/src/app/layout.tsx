import type { Metadata } from "next";
import { Inter, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" });

export const metadata: Metadata = {
  title: "MediCare Plus | Doctor Appointment System",
  description: "Production-ready healthcare scheduling and doctor appointment system built with Next.js 15, FastAPI, and PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${hanken.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <div className="flex-1 flex flex-col">{children}</div>
              <Toaster position="top-right" richColors closeButton />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
