// @ts-nocheck
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Infocreon Internship - Venture Funding Heatmap",
  description: "Capital Formation Intelligence | Batch 2 Interns",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#07080E]">
      <body className={inter.className}>{children}</body>
    </html>
  );
}