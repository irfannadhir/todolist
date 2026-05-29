import type { Metadata } from "next";

import { QueryProvider } from "@/features/components/query-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Todo Tracker",
  description: "Aplikasi todolist harian dengan CRUD, status workflow, dan visualisasi kalender.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
