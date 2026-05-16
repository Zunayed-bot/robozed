import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "RoboZed — Microchips · Robotics · Gadgets",
    template: "%s | RoboZed",
  },
  description:
    "Premium microchips, robotics components and smart gadgets for makers, engineers, and innovators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
