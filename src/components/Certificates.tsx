"use client";

import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import type { SiteContent } from "@/lib/types";

export default function Certificates({ content }: { content: SiteContent }) {
  return (
    <section id="certificates" className="section section-even">
      <div className="shell">
        <AnimatedSection className="mb-12">
          <p className="section-label">Credentials</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            Certificates
          </h2>
        </AnimatedSection>

        <div className="grid gap-5 lg:grid-cols-3">
          {content.certificates.map((cert, i) => (
            <motion.article
              key={cert.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="panel flex flex-col p-6"
              data-cursor="hover"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-teal-300">
                {cert.platform}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold">
                {cert.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                {cert.description}
              </p>
              <ul className="mt-4 space-y-1.5">
                {cert.skills.map((s) => (
                  <li key={s} className="text-xs text-sky-200/90">
                    — {s}
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
                <p>{cert.date}</p>
                <p className="mt-1 font-mono text-[10px] opacity-80">{cert.verificationId}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
