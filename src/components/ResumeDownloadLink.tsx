"use client";

import { type MouseEvent, type ReactNode, useEffect, useState } from "react";
import type { SiteContent } from "@/lib/types";

export function getResumeHref(resumeUrl: string | undefined) {
  const url = (resumeUrl || "").trim();
  if (!url || url === "#") return null;
  return url;
}

export function getResumeDownloadName(fullName: string, resumeUrl: string) {
  const clean = fullName.trim().replace(/\s+/g, "-") || "Resume";
  const pathOnly = resumeUrl.split("?")[0];
  const ext = pathOnly.includes(".") ? pathOnly.split(".").pop()?.toLowerCase() : "pdf";
  const safeExt = ext && /^[a-z0-9]{2,5}$/.test(ext) ? ext : "pdf";
  return `${clean}-Resume.${safeExt}`;
}

export function ResumeDownloadLink({
  content,
  className,
  children,
}: {
  content: SiteContent;
  className?: string;
  children: ReactNode;
}) {
  const configured = Boolean(getResumeHref(content.about.resumeUrl));
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState(configured);

  useEffect(() => {
    let alive = true;
    fetch("/api/resume?meta=1")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setAvailable(Boolean(data.hasResume));
      })
      .catch(() => {
        if (!alive) return;
        setAvailable(configured);
      });
    return () => {
      alive = false;
    };
  }, [configured, content.about.resumeUrl]);

  async function onDownload(e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/resume");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Resume is not available yet. Upload it in Admin.");
        setAvailable(false);
        return;
      }

      const blob = await res.blob();
      const header = res.headers.get("Content-Disposition") || "";
      const match = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(header);
      const rawName = match?.[1] ? decodeURIComponent(match[1].replace(/"/g, "")) : "";
      const filename =
        rawName ||
        getResumeDownloadName(content.fullName, content.about.resumeUrl || "resume.pdf");

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      setAvailable(true);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!available) {
    return (
      <button
        type="button"
        className={`${className || ""} opacity-60`}
        title="Upload a resume in Admin → Hero"
        onClick={() =>
          alert("No resume uploaded yet. Go to Admin → Hero → Resume file, upload, then Save resume.")
        }
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href="/api/resume"
      className={className}
      onClick={onDownload}
      aria-busy={busy}
      data-cursor="hover"
    >
      {busy ? "Downloading…" : children}
    </a>
  );
}

export default ResumeDownloadLink;
