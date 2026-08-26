"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import MediaSlider from "./MediaSlider";
import { toast } from "./StatusToast";
import type { Product, SiteContent } from "@/lib/types";

function money(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

export default function Products({ content }: { content: SiteContent }) {
  const products = content.products || [];
  const [active, setActive] = useState<Product | null>(null);
  const [buying, setBuying] = useState(false);
  const [status, setStatus] = useState("");
  const [order, setOrder] = useState({ name: "", email: "", note: "" });

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

  function openProduct(product: Product) {
    setStatus("");
    setBuying(false);
    setOrder({ name: "", email: "", note: "" });
    setActive(product);
  }

  async function submitOrder(e: FormEvent) {
    e.preventDefault();
    if (!active) return;
    setStatus("Sending...");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: active.id,
        ...order,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = data.error || "Order failed";
      setStatus(err);
      toast(err, "error");
      return;
    }
    const msg = data.message || "Order sent!";
    setStatus(msg);
    toast(msg, "success");
    if (data.buyUrl && data.buyUrl !== "#") {
      window.open(data.buyUrl, "_blank", "noopener,noreferrer");
    }
    setBuying(false);
    setOrder({ name: "", email: "", note: "" });
  }

  if (!products.length) return null;

  return (
    <section id="shop" className="section section-even">
      <div className="shell">
        <AnimatedSection className="mb-12">
          <p className="section-label">Shop</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            <span className="aurora-text">Products for sale</span>
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--muted)]">
            Digital kits and services from {content.fullName}. Click a product for slides, details,
            and buy.
          </p>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product, i) => (
            <motion.button
              key={product.id}
              type="button"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => openProduct(product)}
              className="panel group relative overflow-hidden p-0 text-left"
              data-cursor="hover"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <MediaSlider
                  images={product.gallery}
                  fallback={product.image}
                  alt={product.title}
                  variant="card"
                  showThumbs={false}
                  showControls={false}
                  intervalMs={3200 + (i % 4) * 350}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/25 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur">
                  {money(product.price, product.currency)}
                </span>
                {product.featured && (
                  <span className="absolute right-4 top-4 rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-xs text-amber-100">
                    Featured
                  </span>
                )}
                {(product.gallery?.length || 0) > 1 && (
                  <span className="absolute bottom-4 left-4 rounded-full border border-teal-300/30 bg-black/45 px-2.5 py-1 text-[11px] text-teal-100 backdrop-blur">
                    {product.gallery.length} photos
                  </span>
                )}
                <span className="absolute bottom-4 right-4 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs text-teal-100 opacity-0 transition group-hover:opacity-100">
                  View & buy →
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                  {product.title}
                </h3>
                <p className="mt-1 text-sm text-sky-200/80">{product.subtitle}</p>
                <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
                  {product.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-teal-300/20 bg-teal-300/5 px-2.5 py-1 text-[11px] text-teal-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-[var(--muted)]">{product.stock}</span>
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
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-[#02060c]/75 backdrop-blur-md"
              onClick={() => setActive(null)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
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
                  className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/5 p-2 text-[var(--muted)]"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>

                <p className="text-xs uppercase tracking-[0.25em] text-teal-300">{active.stock}</p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold">
                  {active.title}
                </h3>
                <p className="mt-2 text-sky-200/90">{active.subtitle}</p>
                <p className="mt-3 text-2xl font-semibold text-emerald-300">
                  {money(active.price, active.currency)}
                </p>
                <p className="mt-5 leading-relaxed text-[var(--muted)]">
                  {active.longDescription || active.description}
                </p>

                {active.features?.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {active.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-[var(--muted)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-sky-300/20 bg-sky-300/5 px-3 py-1 text-xs text-sky-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {!buying ? (
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button type="button" className="btn-glow" onClick={() => setBuying(true)}>
                      Buy now
                    </button>
                    {active.buyUrl && active.buyUrl !== "#" && (
                      <a
                        href={active.buyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost"
                      >
                        External checkout
                      </a>
                    )}
                    <button type="button" className="btn-ghost" onClick={() => setActive(null)}>
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submitOrder} className="mt-8 grid gap-3">
                    <p className="text-sm text-teal-200">
                      Order {active.title} — {money(active.price, active.currency)}
                    </p>
                    <input
                      className="admin-input"
                      placeholder="Your name"
                      value={order.name}
                      onChange={(e) => setOrder({ ...order, name: e.target.value })}
                      required
                    />
                    <input
                      className="admin-input"
                      type="email"
                      placeholder="Email"
                      value={order.email}
                      onChange={(e) => setOrder({ ...order, email: e.target.value })}
                      required
                    />
                    <textarea
                      className="admin-input min-h-24"
                      placeholder="Note (optional)"
                      value={order.note}
                      onChange={(e) => setOrder({ ...order, note: e.target.value })}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button type="submit" className="btn-glow">
                        Place order
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => setBuying(false)}>
                        Back
                      </button>
                    </div>
                  </form>
                )}
                {status && <p className="mt-3 text-sm text-teal-200">{status}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
