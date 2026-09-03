"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import AnimatedSection from "./AnimatedSection";
import { resolveSkillIcon, skillIconFallbackLabel } from "@/lib/skill-icon";
import type { SiteContent } from "@/lib/types";

function masteryLabel(level: number) {
  if (level >= 90) return "Expert";
  if (level >= 80) return "Advanced";
  if (level >= 70) return "Proficient";
  if (level >= 55) return "Working";
  return "Learning";
}

function SkillOrb({
  name,
  level,
  icon,
  index,
}: {
  name: string;
  level: number;
  icon: string;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [imgFailed, setImgFailed] = useState(false);
  const size = 112;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, level)) / 100;
  const hueShift = (index * 37) % 120;
  const iconSrc = resolveSkillIcon(icon, name);
  const showImage = Boolean(iconSrc) && !imgFailed;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.92 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 22,
        delay: (index % 8) * 0.05,
      }}
      whileHover={{ y: -8, scale: 1.03 }}
      className="skill-orb"
      data-cursor="hover"
      style={{ ["--skill-hue" as string]: `${hueShift}deg` }}
    >
      <div className="skill-orb-ring-wrap">
        <svg
          className="skill-orb-svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            className="skill-orb-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            className="skill-orb-progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={
              inView
                ? { strokeDashoffset: circumference * (1 - progress) }
                : { strokeDashoffset: circumference }
            }
            transition={{
              duration: 1.15,
              delay: 0.12 + (index % 8) * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="skill-orb-core">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconSrc!}
              alt=""
              className="skill-orb-icon"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="skill-orb-initials">{skillIconFallbackLabel(name)}</span>
          )}
        </div>
        <span className="skill-orb-glow" aria-hidden />
      </div>

      <div className="skill-orb-meta">
        <h3 className="skill-orb-name">{name}</h3>
        <p className="skill-orb-level">
          {masteryLabel(level)} · {level}%
        </p>
      </div>
    </motion.article>
  );
}

export default function Skills({ content }: { content: SiteContent }) {
  const skills = content.skills || [];

  return (
    <section id="skills" className="section section-even">
      <div className="shell">
        <AnimatedSection className="mb-12">
          <p className="section-label">Capabilities</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            <span className="aurora-text">Skills</span>
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--muted)]">
            A living toolkit — craft, stack, and depth across product engineering.
          </p>
        </AnimatedSection>

        <div className="skills-constellation">
          {skills.map((skill, i) => (
            <SkillOrb
              key={skill.id}
              name={skill.name}
              level={skill.level}
              icon={skill.icon}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
