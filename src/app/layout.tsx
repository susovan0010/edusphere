import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/layout/SessionProvider";

export const metadata: Metadata = {
  title: "EduSphere — College Management System",
  description: "Role-based college management system with attendance, marks, and assignments",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#C9A227",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-navy-900 text-ivory-100 min-h-screen antialiased selection:bg-gold-500/30 selection:text-gold-200">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
