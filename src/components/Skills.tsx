"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import AnimatedSection from "./AnimatedSection";
import type { SiteContent } from "@/lib/types";

function SkillRow({ name, level, index }: { name: string; level: number; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.04 }}
      className="group"
      data-cursor="hover"
    >
      <div className="mb-2 flex items-end justify-between">
        <h3 className="font-medium">{name}</h3>
        <span className="text-sm text-teal-300">{level}%</span>
      </div>
      <div className="h-[3px] overflow-hidden rounded-full bg-white/10">
        <motion.span
          className="block h-full origin-left rounded-full bg-gradient-to-r from-teal-300 via-sky-400 to-violet-400 shadow-[0_0_12px_rgba(94,234,212,0.5)]"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: level / 100 } : {}}
          transition={{ duration: 0.9, delay: 0.1 + index * 0.03, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export default function Skills({ content }: { content: SiteContent }) {
  return (
    <section id="skills" className="section section-even">
      <div className="shell">
        <AnimatedSection className="mb-12">
          <p className="section-label">Capabilities</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            Skills
          </h2>
        </AnimatedSection>
        <div className="grid gap-8 sm:grid-cols-2">
          {content.skills.map((skill, i) => (
            <SkillRow key={skill.id} name={skill.name} level={skill.level} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
