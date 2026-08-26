"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { SiteContent } from "@/lib/types";

function AnimatedStars({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const fraction = clamped - full;

  return (
    <div className="rank-stars" aria-label={`${clamped.toFixed(1)} out of 5 stars`}>
      <span className="rank-stars-glow" aria-hidden />
      {Array.from({ length: 5 }).map((_, i) => {
        const fill =
          i < full ? 1 : i === full ? fraction : 0;
        return (
          <motion.span
            key={i}
            className="rank-star"
            initial={{ opacity: 0, scale: 0.2, y: 12, rotate: -28 }}
            whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 16,
              delay: 0.15 + i * 0.12,
            }}
          >
            <motion.span
              className="rank-star-burst"
              aria-hidden
              animate={
                fill > 0.15
                  ? {
                      opacity: [0, 0.9, 0],
                      scale: [0.4, 1.6, 1.9],
                    }
                  : { opacity: 0 }
              }
              transition={{ delay: 0.35 + i * 0.12, duration: 0.7 }}
            />
            <svg viewBox="0 0 24 24" className="rank-star-svg" aria-hidden>
              <defs>
                <linearGradient id={`rank-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="45%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <clipPath id={`rank-clip-${i}`}>
                  <rect x="0" y="0" width={24 * fill} height="24" />
                </clipPath>
              </defs>
              <path
                className="rank-star-empty"
                d="M12 2.4l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.5 6.6 19.3l1-6.1L3.2 8.9l6.1-.9L12 2.4z"
              />
              <path
                className="rank-star-fill"
                clipPath={`url(#rank-clip-${i})`}
                fill={`url(#rank-grad-${i})`}
                d="M12 2.4l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.5 6.6 19.3l1-6.1L3.2 8.9l6.1-.9L12 2.4z"
              />
            </svg>
            <motion.span
              className="rank-star-shine"
              aria-hidden
              animate={{ x: ["-120%", "160%"] }}
              transition={{
                duration: 2.4,
                delay: 0.8 + i * 0.18,
                repeat: Infinity,
                repeatDelay: 2.2,
                ease: "easeInOut",
              }}
            />
          </motion.span>
        );
      })}
    </div>
  );
}

export default function VisitStats({
  content,
  rating = 5,
  reviewCount = 0,
}: {
  content: SiteContent;
  rating?: number;
  reviewCount?: number;
}) {
  const [visits, setVisits] = useState<number | null>(null);
  const [unique, setUnique] = useState<number | null>(null);

  const displayRating = useMemo(() => {
    const n = Number(rating);
    if (!Number.isFinite(n) || n <= 0) return 5;
    return Math.round(n * 10) / 10;
  }, [rating]);

  useEffect(() => {
    let alive = true;
    fetch("/api/stats?track=1")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setVisits(Number(data.visits) || 0);
        setUnique(Number(data.uniqueVisits) || 0);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="section section-even !py-10">
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="panel flex flex-col items-center gap-5 p-5 sm:flex-row sm:justify-between sm:p-6"
        >
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.about.image}
              alt={content.fullName}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-teal-300/40"
            />
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold">
                {content.fullName}
              </p>
              <p className="text-sm text-[var(--muted)]">{content.hero.role}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="rounded-2xl border border-teal-300/20 bg-teal-300/5 px-5 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-teal-300">Visits</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {visits === null ? "—" : visits.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-300/20 bg-sky-300/5 px-5 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Unique</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {unique === null ? "—" : unique.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--muted)]">Hire requests</p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: 12 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 20 }}
              className="rank-card"
            >
              <div className="rank-card-orbit" aria-hidden />
              <div className="rank-card-orbit rank-card-orbit--2" aria-hidden />
              <p className="text-xs uppercase tracking-[0.2em] text-amber-300/90">Ranking</p>
              <AnimatedStars rating={displayRating} />
              <p className="mt-1 text-sm font-semibold tabular-nums text-amber-50">
                {displayRating.toFixed(1)}
                <span className="text-[var(--muted)]"> / 5</span>
                {reviewCount > 0 && (
                  <span className="ml-1 text-xs font-normal text-[var(--muted)]">
                    · {reviewCount} review{reviewCount === 1 ? "" : "s"}
                  </span>
                )}
              </p>
            </motion.div>

            {content.sectionVisibility?.hire !== false && (
              <a href="#hire" className="btn-glow self-center !py-3">
                Hire {content.fullName.split(" ")[0]}
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
