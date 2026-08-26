"use client";

import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import type { SiteContent } from "@/lib/types";

export default function Education({ content }: { content: SiteContent }) {
  return (
    <section id="education" className="section section-odd">
      <div className="shell">
        <AnimatedSection className="mb-12">
          <p className="section-label">Academic</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            Education
          </h2>
        </AnimatedSection>

        <div className="space-y-6">
          {content.education.map((edu, i) => (
            <AnimatedSection key={edu.id} delay={i * 0.08}>
              <article className="panel overflow-hidden p-6 md:p-8" data-cursor="hover">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                    className="edu-avatar shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={edu.image || "/images/education/university.svg"}
                      alt={`${edu.school} emblem`}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
                        {edu.school}
                      </h3>
                      <p className="text-sm text-teal-300">{edu.dates}</p>
                    </div>
                    <p className="mt-2 text-[var(--muted)]">{edu.degree}</p>
                    <p className="mt-4 max-w-3xl leading-relaxed text-[var(--muted)]">
                      {edu.description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {edu.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-sky-300/20 bg-sky-300/5 px-3 py-1 text-xs text-sky-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
