"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function uniqueImages(images: string[], fallback: string) {
  const list = [fallback, ...(images || [])]
    .map((s) => (s || "").trim())
    .filter(Boolean);
  return Array.from(new Set(list.length ? list : [fallback || "/images/certificates.jpg"]));
}

const slideVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 72 : -72,
    scale: 1.08,
    rotateY: dir > 0 ? -8 : 8,
    filter: "blur(8px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    rotateY: 0,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -56 : 56,
    scale: 1.04,
    rotateY: dir > 0 ? 6 : -6,
    filter: "blur(6px)",
  }),
};

export default function MediaSlider({
  images,
  fallback,
  alt,
  className = "",
  autoPlay = true,
  intervalMs = 3800,
  showThumbs = true,
  showControls = true,
  variant = "panel",
}: {
  images: string[];
  fallback: string;
  alt: string;
  className?: string;
  autoPlay?: boolean;
  intervalMs?: number;
  showThumbs?: boolean;
  showControls?: boolean;
  variant?: "card" | "panel";
}) {
  const slides = uniqueImages(images, fallback);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const current = slides[Math.min(index, count - 1)] || fallback;

  useEffect(() => {
    setIndex(0);
    setDir(0);
  }, [slides.join("|")]);

  useEffect(() => {
    if (!autoPlay || paused || count < 2) return;
    const id = window.setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [autoPlay, paused, count, intervalMs, index]);

  function go(next: number, direction: number) {
    setDir(direction);
    setIndex((next + count) % count);
  }

  return (
    <div
      className={`media-slider media-slider--${variant} ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="media-slider-stage">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={`${current}-${index}`}
            className="media-slider-frame"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src={current}
              alt={alt}
              className="media-slider-img"
              animate={{ scale: [1, 1.08, 1], x: [0, -8, 0], y: [0, 4, 0] }}
              transition={{ duration: intervalMs / 1000 + 0.8, ease: "easeInOut" }}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <div className="media-slider-vignette" aria-hidden />
        <div className="media-slider-shine" aria-hidden />
        <div className="media-slider-orbs" aria-hidden>
          <span />
          <span />
        </div>

        {count > 1 && showControls && (
          <>
            <button
              type="button"
              className="media-slider-nav media-slider-nav--prev"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                go(index - 1, -1);
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className="media-slider-nav media-slider-nav--next"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                go(index + 1, 1);
              }}
            >
              ›
            </button>
          </>
        )}

        {count > 1 && (
          <div className="media-slider-progress" aria-hidden>
            <motion.span
              key={`prog-${index}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: paused ? 0 : 1 }}
              transition={{ duration: intervalMs / 1000, ease: "linear" }}
            />
          </div>
        )}

        {count > 1 && variant === "panel" && (
          <div className="media-slider-dots">
            {slides.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                className={i === index ? "is-active" : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  go(i, i > index ? 1 : -1);
                }}
              />
            ))}
          </div>
        )}

        {variant === "panel" && (
          <span className="media-slider-count">
            {index + 1}/{count}
          </span>
        )}
      </div>

      {showThumbs && count > 1 && (
        <div className="media-slider-thumbs">
          {slides.map((src, i) => (
            <motion.button
              key={`thumb-${src}-${i}`}
              type="button"
              whileHover={{ y: -2, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={i === index ? "is-active" : undefined}
              onClick={(e) => {
                e.stopPropagation();
                go(i, i > index ? 1 : -1);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

export { uniqueImages };
