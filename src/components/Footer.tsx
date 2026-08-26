"use client";

import type { SiteContent } from "@/lib/types";

export default function Footer({ content }: { content: SiteContent }) {
  return (
    <footer className="section-odd border-t border-[var(--line)] py-14">
      <div className="shell flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold aurora-text">
            {content.fullName}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">{content.hero.role}</p>
          <a
            href={`mailto:${content.about.gmail || content.email}`}
            className="mt-4 inline-block text-teal-200 hover:underline"
          >
            {content.about.gmail || content.email}
          </a>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-[var(--muted)]">
          <a href={content.about.githubUrl} target="_blank" rel="noreferrer" className="hover:text-teal-200">
            GitHub
          </a>
          <a href={content.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-teal-200">
            LinkedIn
          </a>
          <a href="/admin" className="hover:text-teal-200">
            Admin
          </a>
        </div>
      </div>
      <p className="shell mt-10 text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} {content.fullName}. Resume portfolio.
      </p>
    </footer>
  );
}
