"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import MediaSlider from "./MediaSlider";
import type { Project, SiteContent } from "@/lib/types";

export default function Projects({ content }: { content: SiteContent }) {
  const projects = content.projects || [];
  const [active, setActive] = useState<Project | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <section id="projects" className="section section-odd">
      <div className="shell">
        <AnimatedSection className="mb-12">
          <p className="section-label">Selected work</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            <span className="aurora-text">Projects</span>
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--muted)]">
            Click any project to open a full brief — image slides, role, stack, and highlights.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, i) => (
            <motion.button
              key={project.id}
              type="button"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              whileHover={{ y: -8, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setActive(project)}
              className="panel group relative overflow-hidden p-0 text-left"
              data-cursor="hover"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <MediaSlider
                  images={project.gallery}
                  fallback={project.image}
                  alt={project.title}
                  variant="card"
                  showThumbs={false}
                  showControls={false}
                  intervalMs={3400 + (i % 3) * 400}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/20 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-teal-200 backdrop-blur">
                  {project.year}
                </span>
                {(project.gallery?.length || 0) > 1 && (
                  <span className="absolute right-4 top-4 rounded-full border border-teal-300/30 bg-teal-300/10 px-2.5 py-1 text-[11px] text-teal-100 backdrop-blur">
                    {project.gallery.length} photos
                  </span>
                )}
                <span className="absolute bottom-4 right-4 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs text-teal-100 opacity-0 transition group-hover:opacity-100">
                  View details →
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                  {project.title}
                </h3>
                <p className="mt-1 text-sm text-sky-200/80">{project.subtitle}</p>
                <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-teal-300/20 bg-teal-300/5 px-2.5 py-1 text-[11px] text-teal-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-[#02060c]/75 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative z-10 grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-teal-300/20 bg-[#0a1220] shadow-[0_40px_120px_rgba(0,0,0,0.55)] md:grid-cols-[1.1fr_0.9fr]"
            >
              <div className="relative min-h-[280px] w-full overflow-hidden bg-black/40 md:min-h-full">
                <MediaSlider
                  images={active.gallery}
                  fallback={active.image}
                  alt={active.title}
                  variant="panel"
                  showThumbs
                  showControls
                  intervalMs={4000}
                  className="h-full min-h-[280px] w-full md:absolute md:inset-0"
                />
              </div>

              <div className="relative max-h-[90vh] overflow-y-auto p-6 md:p-8">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/5 p-2 text-[var(--muted)] transition hover:text-white"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <p className="text-xs uppercase tracking-[0.25em] text-teal-300">
                  {active.year} · {active.role}
                </p>
                <h3
                  id="project-modal-title"
                  className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold"
                >
                  {active.title}
                </h3>
                <p className="mt-2 text-sky-200/90">{active.subtitle}</p>
                <p className="mt-5 leading-relaxed text-[var(--muted)]">
                  {active.longDescription || active.description}
                </p>

                {active.highlights?.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-teal-200">Highlights</p>
                    <ul className="mt-3 space-y-2">
                      {active.highlights.map((h) => (
                        <li key={h} className="flex gap-2 text-sm text-[var(--muted)]">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-sky-300/20 bg-sky-300/5 px-3 py-1 text-xs text-sky-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {active.previewUrl && active.previewUrl !== "#" && (
                    <a
                      href={active.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-glow !py-2.5 !px-5 text-sm"
                    >
                      Live preview
                    </a>
                  )}
                  {active.sourceUrl && active.sourceUrl !== "#" && (
                    <a
                      href={active.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost !py-2.5 !px-5 text-sm"
                    >
                      Source
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    className="btn-ghost !py-2.5 !px-5 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
