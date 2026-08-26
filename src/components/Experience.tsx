"use client";

import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import type { SiteContent } from "@/lib/types";

export default function Experience({ content }: { content: SiteContent }) {
  return (
    <section id="experience" className="section section-even">
      <div className="shell">
        <AnimatedSection className="mb-12">
          <p className="section-label">Career</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            Experience
          </h2>
        </AnimatedSection>

        <div className="space-y-6">
          {[...content.experience].reverse().map((exp, i) => (
            <motion.article
              key={exp.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              whileHover={{ x: 4 }}
              className="panel overflow-hidden p-0 md:grid md:grid-cols-[240px_1fr]"
              data-cursor="hover"
            >
              <div className="relative border-b border-[var(--line)] p-5 md:border-b-0 md:border-r">
                <p className="text-sm font-medium text-teal-300">{exp.dates}</p>
                {exp.image && (
                  <motion.div
                    className="relative mt-4 aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-teal-300/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={exp.image}
                      alt={`${exp.role} — ${exp.dates}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a1220]/50 to-transparent" />
                  </motion.div>
                )}
              </div>

              <div className="p-6 md:p-8">
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
                  {exp.role}
                </h3>
                <p className="mt-1 text-[var(--muted)]">{exp.company}</p>
                <p className="mt-4 leading-relaxed text-[var(--muted)]">{exp.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-teal-300/20 bg-teal-300/5 px-3 py-1 text-xs text-teal-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
