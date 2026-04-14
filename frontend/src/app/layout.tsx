import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import AppProviders from "@/components/providers/AppProviders";

import "./globals.css";

export const metadata: Metadata = {
  title: "EduAtlas",
  description: "Multimedia educational content platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[radial-gradient(circle_at_top,#e8f3ff_0%,#f8fbff_32%,#f1f5f9_100%)] text-slate-900">
        <AppProviders>
          <Navbar />
          <div className="min-h-[calc(100vh-73px)]">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
