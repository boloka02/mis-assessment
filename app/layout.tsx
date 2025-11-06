// app/layout.tsx
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adon Assessment",
  description: "Enter your examination ID",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 dark:bg-black text-black dark:text-white">
        <Navbar />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}