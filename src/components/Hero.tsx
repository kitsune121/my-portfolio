"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ResumeDownloadLink from "./ResumeDownloadLink";
import type { OrbitImage, SiteContent } from "@/lib/types";

function SplitName({ text }: { text: string }) {
  return (
    <span className="inline-flex flex-wrap">
      {text.split("").map((ch, i) => (
        <motion.span
          key={`ch-${i}`}
          initial={{ opacity: 0, y: 40, rotateX: 40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.25 + i * 0.035, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
          style={{ whiteSpace: ch === " " ? "pre" : undefined }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

function OrbitRing({
  images,
  radius,
  size,
  duration,
  reverse = false,
}: {
  images: OrbitImage[];
  radius: number;
  size: number;
  duration: number;
  reverse?: boolean;
}) {
  if (!images.length) return null;

  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 z-20"
      style={{ width: 0, height: 0 }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {images.map((item, i) => {
        const angle = (i / images.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <motion.div
            key={item.id}
            className="absolute"
            style={{
              width: size,
              height: size,
              left: x - size / 2,
              top: y - size / 2,
            }}
            animate={{ rotate: reverse ? 360 : -360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            <div
              className="h-full w-full overflow-hidden rounded-full border border-teal-200/40 bg-[#0b1a24]/90 shadow-[0_0_20px_rgba(94,234,212,0.35)] ring-2 ring-sky-400/20"
              title={item.label}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.label} className="h-full w-full object-cover" />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function Hero({ content }: { content: SiteContent }) {
  const { hero, about } = content;
  const orbit = content.orbitImages || [];
  const outer = orbit.slice(0, Math.ceil(orbit.length / 2));
  const inner = orbit.slice(Math.ceil(orbit.length / 2));
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setScale(0.62);
      else if (w < 768) setScale(0.75);
      else if (w < 1024) setScale(0.88);
      else setScale(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden pt-24 md:pt-28">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="shell grid min-h-[calc(100svh-6rem)] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1.5 text-sm text-teal-200"
          >
            <motion.span
              className="h-2 w-2 rounded-full bg-teal-300"
              animate={{ scale: [1, 1.35, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            {hero.availableText}
          </motion.p>

          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            <span className="aurora-text">
              <SplitName text={hero.headline} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-4 text-lg text-sky-200/90 md:text-xl"
          >
            {hero.role}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-5 max-w-lg leading-relaxed text-[var(--muted)]"
          >
            {hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a href={`mailto:${content.about.gmail || content.email}`} className="btn-glow">
              {hero.primaryCta}
            </a>
            <ResumeDownloadLink content={content} className="btn-ghost">
              {hero.secondaryCta}
            </ResumeDownloadLink>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto flex w-full max-w-[520px] items-center justify-center overflow-visible py-20 lg:py-24"
        >
          <div className="relative aspect-[4/5] w-[70%] max-w-[320px]">
            <div className="orbit slow opacity-40" style={{ inset: "-28%" }} />
            <div className="orbit opacity-50" style={{ inset: "-14%" }} />

            <OrbitRing
              images={outer}
              radius={200 * scale}
              size={Math.round(52 * scale)}
              duration={28}
            />
            <OrbitRing
              images={inner}
              radius={148 * scale}
              size={Math.round(44 * scale)}
              duration={20}
              reverse
            />

            <div className="float-y relative z-10 h-full">
              <motion.div
                className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-teal-300/40 via-sky-400/20 to-violet-400/40 blur-xl"
                animate={{ opacity: [0.45, 0.8, 0.45] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="photo-frame relative h-full shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={about.image}
                  alt={content.fullName}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
