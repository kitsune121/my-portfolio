"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, X } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { toast } from "./StatusToast";
import type { ClientReview, SiteContent } from "@/lib/types";

const PAGE_SIZE = 6;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ClientReviews({
  content,
  reviews: initial,
}: {
  content: SiteContent;
  reviews: ClientReview[];
}) {
  const [reviews, setReviews] = useState(initial);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    rating: 5,
    comment: "",
  });

  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function closeModal() {
    setOpen(false);
    setStatus("");
  }

  const pageReviews = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return reviews.slice(start, start + PAGE_SIZE);
  }, [reviews, page]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("Sending...");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = data.error || "Failed to submit review";
      setStatus(err);
      toast(err, "error");
      return;
    }
    const msg = data.message || "Review submitted";
    setStatus(msg);
    toast(msg, "success");
    setForm({ name: "", role: "", company: "", rating: 5, comment: "" });
    if (data.review?.approved) {
      setReviews((prev) => [data.review, ...prev]);
      setPage(1);
    }
    window.setTimeout(closeModal, 1400);
  }

  return (
    <section id="reviews" className="section section-even">
      <div className="shell">
        <AnimatedSection className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.about.image}
              alt={content.fullName}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-teal-300/35"
            />
            <div>
              <p className="section-label">Clients</p>
              <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
                <span className="aurora-text">Reviews for {content.fullName}</span>
              </h2>
              <p className="mt-3 max-w-xl text-[var(--muted)]">
                What clients say after working with {content.fullName.split(" ")[0]}.
              </p>
            </div>
          </div>
          <button type="button" className="btn-ghost" onClick={() => setOpen(true)}>
            Leave a review
          </button>
        </AnimatedSection>

        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-[#02060c]/75 backdrop-blur-md"
                onClick={closeModal}
              />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="review-modal-title"
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-teal-300/20 bg-[#0a1220] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.55)] md:p-8"
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/5 p-2 text-[var(--muted)] transition hover:text-white"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <p className="text-xs uppercase tracking-[0.25em] text-teal-300">Client review</p>
                <h3
                  id="review-modal-title"
                  className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold"
                >
                  Share your experience
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Tell others about working with {content.fullName.split(" ")[0]}. Reviews are
                  moderated before they appear.
                </p>

                <form onSubmit={submit} className="mt-6 grid gap-3">
                  <input
                    className="admin-input"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="admin-input"
                      placeholder="Role"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                    <input
                      className="admin-input"
                      placeholder="Company"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                    />
                  </div>
                  <label className="admin-label">Rating: {form.rating}/5</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  />
                  <textarea
                    className="admin-input min-h-28"
                    placeholder={`Your experience working with ${content.fullName}...`}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    required
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button type="submit" className="btn-glow">
                      Submit review
                    </button>
                    <button type="button" className="btn-ghost" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                  {status && <p className="text-sm text-teal-200">{status}</p>}
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {pageReviews.map((review, i) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="panel p-6"
                data-cursor="hover"
              >
                <div className="mb-3 flex gap-1 text-amber-300">
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <Star key={idx} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
                  {review.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400/30 to-sky-400/30 text-xs font-semibold">
                      {initials(review.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {review.role}
                      {review.company ? ` · ${review.company}` : ""}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>

        {reviews.length === 0 && (
          <p className="mt-6 text-sm text-[var(--muted)]">No reviews yet. Be the first.</p>
        )}

        {reviews.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted)]">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, reviews.length)} of {reviews.length}
              <span className="ml-2 text-teal-300/80">· {PAGE_SIZE} per page</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-ghost !py-2 !px-4 text-sm disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`min-w-10 rounded-full px-3 py-2 text-sm transition ${
                      n === page
                        ? "bg-teal-400 text-[#041018]"
                        : "border border-white/10 text-[var(--muted)] hover:border-teal-300/40 hover:text-teal-100"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                type="button"
                className="btn-ghost !py-2 !px-4 text-sm disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
