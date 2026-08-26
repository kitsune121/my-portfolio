"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { SiteContent } from "@/lib/types";

export default function Navbar({ content }: { content: SiteContent }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "border-b border-white/5 bg-[#070b12]/90 backdrop-blur-xl" : ""
      }`}
    >
      <div className="shell flex items-center justify-between gap-3 py-4">
        <a
          href="#home"
          className="shrink-0 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight aurora-text"
        >
          {content.brand}
        </a>

        <nav className="flex min-w-0 flex-1 items-center justify-end gap-3 overflow-x-auto whitespace-nowrap text-sm md:gap-7">
          {content.nav
            .filter((link) => link.visible !== false)
            .map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="shrink-0 text-[var(--muted)] transition hover:text-teal-200"
              >
                {link.label}
              </a>
            ))}
        </nav>
      </div>
    </motion.header>
  );
}
