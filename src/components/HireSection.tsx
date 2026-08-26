"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import { toast } from "./StatusToast";
import type { SiteContent } from "@/lib/types";

export default function HireSection({ content }: { content: SiteContent }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    budget: "",
    message: "",
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = data.error || "Failed to send";
        setStatus(err);
        toast(err, "error");
      } else {
        const msg = data.message || "Sent!";
        setStatus(msg);
        toast(msg, "success");
        setForm({ name: "", email: "", company: "", budget: "", message: "" });
      }
    } catch {
      setStatus("Network error");
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="hire" className="section section-odd">
      <div className="shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <AnimatedSection>
          <p className="section-label">Hire</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            <span className="aurora-text">Work with {content.fullName}</span>
          </h2>
          <p className="mt-4 text-[var(--muted)]">
            Tell {content.fullName.split(" ")[0]} about your project. He typically replies within
            24–48 hours.
          </p>

          <div className="mt-8 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.about.image}
              alt={content.fullName}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-teal-300/40"
            />
            <div>
              <p className="text-lg font-semibold">{content.fullName}</p>
              <p className="text-sm text-teal-200">{content.hero.role}</p>
              <a
                href={`mailto:${content.about.gmail || content.email}`}
                className="text-sm text-[var(--muted)] hover:text-teal-200"
              >
                {content.about.gmail || content.email}
              </a>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <form onSubmit={submit} className="panel grid gap-3 p-6 md:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="admin-input"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="admin-input"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="admin-input"
                placeholder="Company (optional)"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
              <input
                className="admin-input"
                placeholder="Budget range (optional)"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </div>
            <textarea
              className="admin-input min-h-32"
              placeholder={`Hi ${content.fullName.split(" ")[0]}, I'd like to hire you for...`}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <motion.button
              type="submit"
              className="btn-glow"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Sending..." : `Hire ${content.fullName.split(" ")[0]}`}
            </motion.button>
            {status && <p className="text-sm text-teal-200">{status}</p>}
          </form>
        </AnimatedSection>
      </div>
    </section>
  );
}
