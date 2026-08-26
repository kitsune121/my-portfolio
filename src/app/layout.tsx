import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import CustomCursor from "@/components/CustomCursor";
import ParticleField from "@/components/ParticleField";
import ScrollProgress from "@/components/ScrollProgress";
import { StatusToastHost } from "@/components/StatusToast";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Yuki Nakamura — Resume",
  description:
    "Professional resume of Yuki Nakamura — Frontend Developer specializing in React, cloud, and AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="ambient" />
        <div className="film-grain" />
        <ParticleField />
        <ScrollProgress />
        <CustomCursor />
        <StatusToastHost />
        {children}
      </body>
    </html>
  );
}
