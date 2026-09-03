"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ClientReview, HireRequest, ProductOrder, SiteContent } from "@/lib/types";
import { resolveSkillIcon, skillIconFallbackLabel } from "@/lib/skill-icon";

type Section =
  | "basics"
  | "contact"
  | "hero"
  | "orbit"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "products"
  | "certificates"
  | "visibility"
  | "reviews"
  | "hires"
  | "orders"
  | "stats"
  | "ai"
  | "account";

const NAV_GROUPS: { title: string; items: { id: Section; label: string }[] }[] = [
  {
    title: "Resume",
    items: [
      { id: "basics", label: "Basics" },
      { id: "contact", label: "Contact" },
      { id: "hero", label: "Hero" },
      { id: "orbit", label: "Orbit" },
      { id: "skills", label: "Skills" },
      { id: "experience", label: "Experience" },
      { id: "education", label: "Education" },
      { id: "projects", label: "Projects" },
      { id: "products", label: "Products" },
      { id: "certificates", label: "Certificates" },
    ],
  },
  {
    title: "Inbox",
    items: [
      { id: "reviews", label: "Reviews" },
      { id: "hires", label: "Hire requests" },
      { id: "orders", label: "Product orders" },
    ],
  },
  {
    title: "System",
    items: [
      { id: "visibility", label: "Visibility" },
      { id: "stats", label: "Visit stats" },
      { id: "ai", label: "AI Assistant" },
      { id: "account", label: "Account" },
    ],
  },
];

const RESUME_SECTIONS: Section[] = [
  "basics",
  "contact",
  "hero",
  "orbit",
  "skills",
  "experience",
  "education",
  "projects",
  "products",
  "certificates",
  "visibility",
];

const SECTION_VISIBILITY_LABELS: {
  key: keyof NonNullable<SiteContent["sectionVisibility"]>;
  label: string;
}[] = [
  { key: "hero", label: "Hero" },
  { key: "stats", label: "Visit stats" },
  { key: "summary", label: "Professional summary" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "shop", label: "Shop / Products" },
  { key: "reviews", label: "Reviews" },
  { key: "hire", label: "Hire" },
  { key: "certificates", label: "Certificates" },
  { key: "footer", label: "Footer" },
  { key: "ai", label: "AI Assistant" },
];

function sectionLabel(section: Section): string {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.id === section);
    if (item) return item.label;
  }
  return section;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [section, setSection] = useState<Section>("basics");
  const [menuOpen, setMenuOpen] = useState(false);
  const [login, setLogin] = useState({
    email: "koichisato049@gmail.com",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [message, setMessage] = useState("");
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [hires, setHires] = useState<HireRequest[]>([]);
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [statsForm, setStatsForm] = useState({ visits: "0", uniqueVisits: "0" });
  const [aiForm, setAiForm] = useState({
    openaiApiKey: "",
    aiEnabled: true,
    aiModel: "gpt-4o-mini",
    aiWelcome: "",
    maskedKey: "",
    hasKey: false,
  });
  const [account, setAccount] = useState({
    currentPassword: "",
    newPassword: "",
    newEmail: "",
  });

  async function loadExtras() {
    const [r, h, o, a, s] = await Promise.all([
      fetch("/api/reviews?all=1").then((x) => x.json()),
      fetch("/api/hire").then((x) => x.json()),
      fetch("/api/orders").then((x) => x.json()),
      fetch("/api/ai").then((x) => x.json()),
      fetch("/api/stats").then((x) => x.json()),
    ]);
    if (Array.isArray(r)) setReviews(r);
    if (Array.isArray(h)) setHires(h);
    if (Array.isArray(o)) setOrders(o);
    setStatsForm({
      visits: String(Number(s.visits) || 0),
      uniqueVisits: String(Number(s.uniqueVisits) || 0),
    });
    setAiForm((prev) => ({
      ...prev,
      aiEnabled: a.aiEnabled !== false,
      aiModel: a.aiModel || "gpt-4o-mini",
      aiWelcome: a.aiWelcome || "",
      maskedKey: a.maskedKey || "",
      hasKey: Boolean(a.hasKey),
      openaiApiKey: "",
    }));
  }
  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await fetch("/api/auth/me");
      if (!alive) return;
      if (!me.ok) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      const meData = await me.json();
      if (!alive) return;
      setEmail(meData.email);
      setAuthed(true);
      const c = await fetch("/api/content").then((x) => x.json());
      if (!alive) return;
      setContent(c);
      setAccount((a) => ({ ...a, newEmail: meData.email }));
      await loadExtras();
      if (!alive) return;
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const me = await fetch("/api/auth/me");
    if (!me.ok) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    const meData = await me.json();
    setEmail(meData.email);
    setAuthed(true);
    const c = await fetch("/api/content").then((x) => x.json());
    setContent(c);
    setAccount((a) => ({ ...a, newEmail: meData.email }));
    await loadExtras();
    setLoading(false);
  }, []);

  async function saveAi(e: FormEvent) {
    e.preventDefault();
    setMessage("Saving AI settings...");
    const res = await fetch("/api/ai", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        openaiApiKey: aiForm.openaiApiKey,
        aiEnabled: aiForm.aiEnabled,
        aiModel: aiForm.aiModel,
        aiWelcome: aiForm.aiWelcome,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to save AI settings (are you logged in?)");
      return;
    }
    setAiForm((prev) => ({
      ...prev,
      openaiApiKey: "",
      hasKey: Boolean(data.hasKey),
      maskedKey: data.maskedKey || "",
    }));
    setMessage(
      data.hasKey
        ? `AI settings saved. Key: ${data.maskedKey} (${data.source})`
        : "AI settings saved, but no API key is stored yet. Paste a key and save again."
    );
  }

  async function clearAiKey() {
    setMessage("Clearing API key...");
    const res = await fetch("/api/ai", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        openaiApiKey: "",
        clearKey: true,
        aiEnabled: aiForm.aiEnabled,
        aiModel: aiForm.aiModel,
        aiWelcome: aiForm.aiWelcome,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed");
      return;
    }
    setAiForm((prev) => ({
      ...prev,
      openaiApiKey: "",
      hasKey: Boolean(data.hasKey),
      maskedKey: data.maskedKey || "",
    }));
    setMessage("API key cleared from database.");
  }

  async function doLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.error || "Login failed");
      return;
    }
    setLoading(true);
    await refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
  }

  async function persistContent(payload: SiteContent) {
    setMessage("Saving...");
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setMessage("Save failed.");
      return false;
    }
    setMessage("Saved to local database.");
    return true;
  }

  async function saveContent(nextContent?: SiteContent) {
    const payload = nextContent ?? content;
    if (!payload) return false;
    return persistContent(payload);
  }

  async function saveStats(e: FormEvent) {
    e.preventDefault();
    setMessage("Saving visit stats...");
    const res = await fetch("/api/stats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visits: Number(statsForm.visits) || 0,
        uniqueVisits: Number(statsForm.uniqueVisits) || 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to save stats");
      return;
    }
    setStatsForm({
      visits: String(data.visits || 0),
      uniqueVisits: String(data.uniqueVisits || 0),
    });
    setMessage("Visit stats saved to local database.");
  }

  function patchContent(updater: (prev: SiteContent) => SiteContent, autoSave = false) {
    setContent((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      if (autoSave) {
        queueMicrotask(() => {
          void (async () => {
            const ok = await persistContent(next);
            setMessage(
              ok
                ? "Uploaded and saved to local database."
                : "Uploaded, but save failed — click Save."
            );
          })();
        });
      }
      return next;
    });
  }

  async function uploadImage(file: File, apply: (url: string) => void) {
    setMessage("Uploading...");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      apply(data.url as string);
    } else setMessage(data.error || "Upload failed");
  }

  async function uploadAndSaveResume(file: File) {
    setMessage("Uploading resume...");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Upload failed");
      return;
    }
    patchContent(
      (prev) => ({
        ...prev,
        about: { ...prev.about, resumeUrl: data.url as string },
      }),
      true
    );
  }

  async function uploadManyImages(files: FileList | File[], apply: (urls: string[]) => void) {
    const list = Array.from(files);
    if (!list.length) return;
    setMessage(`Uploading ${list.length} image${list.length > 1 ? "s" : ""}...`);
    const urls: string[] = [];
    for (const file of list) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Upload failed");
        return;
      }
      urls.push(data.url as string);
    }
    apply(urls);
  }

  function updateProject(
    idx: number,
    patch: Partial<SiteContent["projects"][number]> | ((p: SiteContent["projects"][number]) => SiteContent["projects"][number])
  ) {
    setContent((prev) => {
      if (!prev) return prev;
      const projects = [...(prev.projects || [])];
      const current = projects[idx];
      if (!current) return prev;
      projects[idx] = typeof patch === "function" ? patch(current) : { ...current, ...patch };
      return { ...prev, projects };
    });
  }

  async function updateAccount(e: FormEvent) {
    e.preventDefault();
    setMessage("Updating account...");
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Update failed");
      return;
    }
    setEmail(data.email);
    setMessage("Account updated.");
    setAccount((a) => ({ ...a, currentPassword: "", newPassword: "" }));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--muted)]">Loading...</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <form onSubmit={doLogin} className="panel w-full max-w-md p-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Resume Admin
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            koichisato049@gmail.com
          </p>
          <div className="mt-6 grid gap-3">
            <div>
              <label className="admin-label">Email</label>
              <input
                className="admin-input"
                type="email"
                value={login.email}
                onChange={(e) => setLogin({ ...login, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="admin-label">Password</label>
              <input
                className="admin-input"
                type="password"
                value={login.password}
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
                required
              />
            </div>
            {loginError && <p className="text-sm text-red-300">{loginError}</p>}
            <button className="btn-glow" type="submit">
              Sign in
            </button>
            <Link href="/" className="text-center text-sm text-teal-300">
              ← Resume
            </Link>
          </div>
        </form>
      </main>
    );
  }

  if (!content) return null;

  const isResumeSection = RESUME_SECTIONS.includes(section);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="shell">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="admin-burger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={menuOpen ? "open" : undefined} />
              <span className={menuOpen ? "open" : undefined} />
              <span className={menuOpen ? "open" : undefined} />
            </button>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
                Edit Resume
              </h1>
              <p className="text-sm text-[var(--muted)]">{email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isResumeSection && (
              <button
                type="button"
                onClick={() => void saveContent()}
                className="btn-glow !py-2 !px-4 text-sm"
              >
                Save
              </button>
            )}
            <Link href="/" className="btn-ghost !py-2 !px-4 text-sm">
              View
            </Link>
            <button type="button" onClick={logout} className="btn-ghost !py-2 !px-4 text-sm">
              Logout
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="admin-nav-panel mb-6 grid gap-4 rounded-2xl border border-white/10 bg-black/40 p-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-teal-300/80">
                  {group.title}
                </p>
                <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSection(id);
                        setMenuOpen(false);
                      }}
                      className={`rounded-xl px-4 py-3 text-left text-sm ${
                        section === id
                          ? "bg-teal-400 text-[#041018]"
                          : "text-[var(--muted)] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        )}

        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-teal-100">
          {sectionLabel(section)}
        </h2>

        {message && (
          <p className="mb-4 border border-[var(--line)] bg-black/30 px-4 py-3 text-sm">{message}</p>
        )}

        {section === "basics" && (
          <section className="panel grid gap-3 p-6 md:grid-cols-2">
            <Field label="Brand" value={content.brand} onChange={(v) => setContent({ ...content, brand: v })} />
            <Field label="Full name" value={content.fullName} onChange={(v) => setContent({ ...content, fullName: v })} />
            <Field label="Public email" value={content.email} onChange={(v) => setContent({ ...content, email: v })} />
            <Field label="Location" value={content.about.location} onChange={(v) => setContent({ ...content, about: { ...content.about, location: v } })} />
            <Field label="Phone" value={content.about.phone} onChange={(v) => setContent({ ...content, about: { ...content.about, phone: v } })} />
            <Field label="Role" value={content.hero.role} onChange={(v) => setContent({ ...content, hero: { ...content.hero, role: v } })} />
          </section>
        )}

        {section === "contact" && (
          <section className="panel grid gap-3 p-6 md:grid-cols-2">
            <h2 className="text-lg font-semibold md:col-span-2">Contact addresses</h2>
            <Field
              label="Gmail"
              value={content.about.gmail || ""}
              onChange={(v) =>
                setContent({ ...content, about: { ...content.about, gmail: v } })
              }
            />
            <Field
              label="WhatsApp (number or +code…)"
              value={content.about.whatsapp || ""}
              onChange={(v) =>
                setContent({ ...content, about: { ...content.about, whatsapp: v } })
              }
            />
            <Field
              label="Telegram (@username or link)"
              value={content.about.telegram || ""}
              onChange={(v) =>
                setContent({ ...content, about: { ...content.about, telegram: v } })
              }
            />
            <Field
              label="Discord (username or invite URL)"
              value={content.about.discord || ""}
              onChange={(v) =>
                setContent({ ...content, about: { ...content.about, discord: v } })
              }
            />
            <Field
              label="GitHub URL"
              value={content.about.githubUrl || ""}
              onChange={(v) =>
                setContent({
                  ...content,
                  about: { ...content.about, githubUrl: v },
                  socials: { ...content.socials, github: v },
                })
              }
            />
            <p className="text-xs text-[var(--muted)] md:col-span-2">
              These show in the Professional Summary contact list. Empty fields are hidden
              (except GitHub — used site-wide). Save resume after editing.
            </p>
          </section>
        )}

        {section === "hero" && (
          <section className="panel grid gap-3 p-6">
            <Field label="Headline / Name on hero" value={content.hero.headline} onChange={(v) => setContent({ ...content, hero: { ...content.hero, headline: v } })} />
            <TextArea label="Hero short line" value={content.hero.description} onChange={(v) => setContent({ ...content, hero: { ...content.hero, description: v } })} />
            <TextArea label="Professional summary" value={content.about.bio} onChange={(v) => setContent({ ...content, about: { ...content.about, bio: v } })} />
            <div>
              <label className="admin-label">Resume file</label>
              <input
                className="admin-input mb-3"
                value={content.about.resumeUrl}
                onChange={(e) =>
                  setContent({
                    ...content,
                    about: { ...content.about, resumeUrl: e.target.value },
                  })
                }
                placeholder="/uploads/resume.pdf or https://..."
              />
              <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      void uploadAndSaveResume(file);
                      e.target.value = "";
                    }}
                  />
                  {content.about.resumeUrl && content.about.resumeUrl !== "#" && (
                    <a
                      href="/api/resume"
                      className="text-sm text-teal-300 underline"
                    >
                      Test download
                    </a>
                  )}
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Upload a PDF/DOC — site Download Resume buttons use this file. Upload saves
                  automatically to <code>public/uploads</code> and the local database.
                </p>
            </div>
            <div>
              <label className="admin-label">Profile photo path / URL</label>
              <input
                className="admin-input mb-3"
                value={content.about.image}
                onChange={(e) =>
                  setContent({
                    ...content,
                    about: { ...content.about, image: e.target.value },
                  })
                }
                placeholder="/images/profile.jpg or https://..."
              />
              <div className="flex flex-wrap items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={content.about.image}
                  alt=""
                  className="h-24 w-24 rounded-full object-cover ring-2 ring-teal-300/30"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      void uploadImage(file, (url) =>
                        patchContent(
                          (prev) => ({
                            ...prev,
                            about: { ...prev.about, image: url },
                          }),
                          true
                        )
                      );
                    e.target.value = "";
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Upload saves automatically to the project and live site.
              </p>
            </div>
          </section>
        )}

        {section === "orbit" && (
          <section className="panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Orbit circle images</h2>
              <button
                className="btn-ghost !py-1.5 !px-3 text-sm"
                type="button"
                  onClick={() =>
                  setContent({
                    ...content,
                    orbitImages: [
                      ...(content.orbitImages || []),
                      {
                        id: crypto.randomUUID(),
                        label: "New",
                        image: "/images/orbit/react.svg",
                      },
                    ],
                  })
                }
              >
                Add orbit image
              </button>
            </div>
            <div className="grid gap-4">
              {(content.orbitImages || []).map((orb, idx) => (
                <div
                  key={orb.id}
                  className="grid gap-2 rounded-xl border border-white/10 p-4 md:grid-cols-[72px_1fr_auto]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={orb.image}
                    alt={orb.label}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-teal-300/25"
                  />
                  <div className="grid gap-2">
                    <Field
                      label="Label"
                      value={orb.label}
                      onChange={(v) => {
                        const orbitImages = [...(content.orbitImages || [])];
                        orbitImages[idx] = { ...orb, label: v };
                        setContent({ ...content, orbitImages });
                      }}
                    />
                    <Field
                      label="Image path / URL"
                      value={orb.image}
                      onChange={(v) => {
                        const orbitImages = [...(content.orbitImages || [])];
                        orbitImages[idx] = { ...orb, image: v };
                        setContent({ ...content, orbitImages });
                      }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          void uploadImage(file, (url) =>
                            patchContent((prev) => {
                              const orbitImages = [...(prev.orbitImages || [])];
                              if (!orbitImages[idx]) return prev;
                              orbitImages[idx] = { ...orbitImages[idx], image: url };
                              return { ...prev, orbitImages };
                            }, true)
                          );
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <button
                    className="text-sm text-red-300"
                    type="button"
                      onClick={() =>
                      setContent({
                        ...content,
                        orbitImages: (content.orbitImages || []).filter(
                          (o) => o.id !== orb.id
                        ),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {section === "skills" && (
          <section className="panel p-6">
            <h2 className="mb-2 text-lg font-semibold">Skills</h2>
            <p className="mb-5 text-sm text-[var(--muted)]">
              Grid of skill cards — arc progress, center PNG icon, level 0–100. Add sits at the end.
            </p>
            <div className="admin-skills-grid">
              {content.skills.map((skill, idx) => {
                const level = Math.max(0, Math.min(100, Number(skill.level) || 0));
                const size = 120;
                const stroke = 8;
                const radius = (size - stroke) / 2;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference * (1 - level / 100);
                const iconSrc = resolveSkillIcon(skill.icon, skill.name);
                const hasUpload =
                  Boolean(skill.icon) &&
                  (skill.icon.startsWith("/") || skill.icon.startsWith("http"));

                return (
                  <div key={skill.id} className="admin-skill-card">
                    <input
                      className="admin-input admin-skill-name"
                      value={skill.name}
                      placeholder="Skill name"
                      onChange={(e) => {
                        const skills = [...content.skills];
                        skills[idx] = { ...skill, name: e.target.value };
                        setContent({ ...content, skills });
                      }}
                    />

                    <div className="admin-skill-ring">
                      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
                        <circle
                          cx={size / 2}
                          cy={size / 2}
                          r={radius}
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth={stroke}
                        />
                        <circle
                          cx={size / 2}
                          cy={size / 2}
                          r={radius}
                          fill="none"
                          stroke={`url(#adminSkillGrad-${skill.id})`}
                          strokeWidth={stroke}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        />
                        <defs>
                          <linearGradient
                            id={`adminSkillGrad-${skill.id}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#5eead4" />
                            <stop offset="100%" stopColor="#38bdf8" />
                          </linearGradient>
                        </defs>
                      </svg>

                      <label className="admin-skill-icon-hit" title="Upload PNG icon">
                        {iconSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={iconSrc} alt="" className="admin-skill-icon-img" />
                        ) : (
                          <span className="admin-skill-icon-empty">
                            {skillIconFallbackLabel(skill.name)}
                          </span>
                        )}
                        <input
                          type="file"
                          accept=".png,image/png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            void uploadImage(file, (url) =>
                              patchContent((prev) => {
                                const skills = [...prev.skills];
                                if (!skills[idx]) return prev;
                                skills[idx] = { ...skills[idx], icon: url };
                                return { ...prev, skills };
                              }, true)
                            );
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>

                    <p className="text-[10px] text-[var(--muted)]">
                      {hasUpload ? "Custom PNG" : "Default icon · click to upload PNG"}
                    </p>

                    <div className="admin-skill-level-row">
                      <input
                        className="admin-input admin-skill-level"
                        type="number"
                        min={0}
                        max={100}
                        value={level}
                        onChange={(e) => {
                          const n = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                          const skills = [...content.skills];
                          skills[idx] = { ...skill, level: n };
                          setContent({ ...content, skills });
                        }}
                      />
                      <span className="text-xs text-[var(--muted)]">/ 100</span>
                    </div>

                    <button
                      className="admin-skill-remove"
                      type="button"
                      onClick={() =>
                        setContent({
                          ...content,
                          skills: content.skills.filter((s) => s.id !== skill.id),
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                className="admin-skill-add"
                onClick={() =>
                  setContent({
                    ...content,
                    skills: [
                      ...content.skills,
                      {
                        id: crypto.randomUUID(),
                        name: "New Skill",
                        icon: "",
                        level: 80,
                      },
                    ],
                  })
                }
              >
                <span className="admin-skill-add-plus">+</span>
                <span>Add skill</span>
              </button>
            </div>
          </section>
        )}

        {section === "experience" && (
          <section className="panel p-6">
            <h2 className="mb-4 text-lg font-semibold">Experience</h2>
            <div className="grid gap-4">
              {content.experience.map((exp, idx) => (
                <div key={exp.id} className="grid gap-2 border border-[var(--line)] p-4">
                  <Field label="Role" value={exp.role} onChange={(v) => {
                    const experience = [...content.experience];
                    experience[idx] = { ...exp, role: v };
                    setContent({ ...content, experience });
                  }} />
                  <Field label="Company" value={exp.company} onChange={(v) => {
                    const experience = [...content.experience];
                    experience[idx] = { ...exp, company: v };
                    setContent({ ...content, experience });
                  }} />
                  <Field label="Dates" value={exp.dates} onChange={(v) => {
                    const experience = [...content.experience];
                    experience[idx] = { ...exp, dates: v };
                    setContent({ ...content, experience });
                  }} />
                  <Field
                    label="Work image path / URL"
                    value={exp.image || ""}
                    onChange={(v) => {
                      const experience = [...content.experience];
                      experience[idx] = { ...exp, image: v };
                      setContent({ ...content, experience });
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    {exp.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={exp.image}
                        alt=""
                        className="h-16 w-28 rounded-lg object-cover"
                      />
                    ) : null}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          void uploadImage(file, (url) =>
                            patchContent((prev) => {
                              const experience = [...prev.experience];
                              if (!experience[idx]) return prev;
                              experience[idx] = { ...experience[idx], image: url };
                              return { ...prev, experience };
                            }, true)
                          );
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <TextArea label="Description" value={exp.description} onChange={(v) => {
                    const experience = [...content.experience];
                    experience[idx] = { ...exp, description: v };
                    setContent({ ...content, experience });
                  }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {section === "education" && (
          <section className="panel p-6">
            <h2 className="mb-4 text-lg font-semibold">Education</h2>
            {content.education.map((edu, idx) => (
              <div key={edu.id} className="mb-4 grid gap-2 border border-[var(--line)] p-4">
                <Field label="School" value={edu.school} onChange={(v) => {
                  const education = [...content.education];
                  education[idx] = { ...edu, school: v };
                  setContent({ ...content, education });
                }} />
                <Field label="Degree" value={edu.degree} onChange={(v) => {
                  const education = [...content.education];
                  education[idx] = { ...edu, degree: v };
                  setContent({ ...content, education });
                }} />
                <Field label="Dates" value={edu.dates} onChange={(v) => {
                  const education = [...content.education];
                  education[idx] = { ...edu, dates: v };
                  setContent({ ...content, education });
                }} />
                <TextArea label="Description" value={edu.description} onChange={(v) => {
                  const education = [...content.education];
                  education[idx] = { ...edu, description: v };
                  setContent({ ...content, education });
                }} />
                <Field
                  label="University avatar / logo path"
                  value={edu.image || ""}
                  onChange={(v) => {
                    const education = [...content.education];
                    education[idx] = { ...edu, image: v };
                    setContent({ ...content, education });
                  }}
                />
                <div className="flex flex-wrap items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={edu.image || "/images/education/university.svg"}
                    alt=""
                    className="h-16 w-16 rounded-2xl object-cover ring-1 ring-teal-300/30"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        void uploadImage(file, (url) =>
                          patchContent((prev) => {
                            const education = [...prev.education];
                            if (!education[idx]) return prev;
                            education[idx] = { ...education[idx], image: url };
                            return { ...prev, education };
                          }, true)
                        );
                      e.target.value = "";
                    }}
                  />
                </div>
                <Field
                  label="Tags (comma separated)"
                  value={(edu.tags || []).join(", ")}
                  onChange={(v) => {
                    const education = [...content.education];
                    education[idx] = {
                      ...edu,
                      tags: v.split(",").map((s) => s.trim()).filter(Boolean),
                    };
                    setContent({ ...content, education });
                  }}
                />
              </div>
            ))}
          </section>
        )}

        {section === "projects" && (
          <section className="panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Projects</h2>
              <button
                className="btn-ghost !py-1.5 !px-3 text-sm"
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    projects: [
                      ...(content.projects || []),
                      {
                        id: crypto.randomUUID(),
                        title: "New Project",
                        subtitle: "Short subtitle",
                        description: "Short description",
                        longDescription: "Full project story...",
                        image: "/images/certificates.jpg",
                        gallery: ["/images/certificates.jpg"],
                        tags: ["Next.js"],
                        role: "Developer",
                        year: "2026",
                        previewUrl: "#",
                        sourceUrl: "#",
                        highlights: ["Highlight one"],
                      },
                    ],
                  })
                }
              >
                Add project
              </button>
            </div>
            <div className="grid gap-4">
              {(content.projects || []).map((project, idx) => (
                <div key={project.id} className="grid gap-2 border border-[var(--line)] p-4">
                  <Field
                    label="Title"
                    value={project.title}
                    onChange={(v) => {
                      const projects = [...content.projects];
                      projects[idx] = { ...project, title: v };
                      setContent({ ...content, projects });
                    }}
                  />
                  <Field
                    label="Subtitle"
                    value={project.subtitle}
                    onChange={(v) => {
                      const projects = [...content.projects];
                      projects[idx] = { ...project, subtitle: v };
                      setContent({ ...content, projects });
                    }}
                  />
                  <TextArea
                    label="Short description"
                    value={project.description}
                    onChange={(v) => {
                      const projects = [...content.projects];
                      projects[idx] = { ...project, description: v };
                      setContent({ ...content, projects });
                    }}
                  />
                  <TextArea
                    label="Full / modal description"
                    value={project.longDescription}
                    onChange={(v) => {
                      const projects = [...content.projects];
                      projects[idx] = { ...project, longDescription: v };
                      setContent({ ...content, projects });
                    }}
                  />
                  <Field
                    label="Cover image path / URL"
                    value={project.image}
                    onChange={(v) => {
                      const projects = [...content.projects];
                      projects[idx] = { ...project, image: v };
                      setContent({ ...content, projects });
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={project.image} alt="" className="h-16 w-28 rounded-lg object-cover" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          void uploadImage(file, (url) =>
                            patchContent((prev) => {
                              const projects = [...(prev.projects || [])];
                              const project = projects[idx];
                              if (!project) return prev;
                              projects[idx] = {
                                ...project,
                                image: url,
                                gallery: [
                                  url,
                                  ...(project.gallery || []).filter((g) => g !== project.image),
                                ],
                              };
                              return { ...prev, projects };
                            }, true)
                          );
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Gallery images (1+ slides)</label>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {(project.gallery?.length ? project.gallery : [project.image]).map((src, gIdx) => (
                        <div key={`${src}-${gIdx}`} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-16 w-20 rounded-lg object-cover ring-1 ring-white/15" />
                          <button
                            type="button"
                            className="absolute -right-1 -top-1 rounded-full bg-red-500/90 px-1.5 text-[10px] text-white"
                            onClick={() => {
                              const projects = [...content.projects];
                              const nextGallery = (project.gallery || []).filter((_, i) => i !== gIdx);
                              const safe = nextGallery.length ? nextGallery : [project.image];
                              projects[idx] = {
                                ...project,
                                gallery: safe,
                                image: gIdx === 0 ? safe[0] : project.image,
                              };
                              setContent({ ...content, projects });
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files?.length) return;
                        void uploadManyImages(files, (urls) =>
                          patchContent((prev) => {
                            const projects = [...(prev.projects || [])];
                            const project = projects[idx];
                            if (!project) return prev;
                            const merged = Array.from(
                              new Set(
                                [...(project.gallery || [project.image]), ...urls].filter(Boolean)
                              )
                            );
                            projects[idx] = {
                              ...project,
                              gallery: merged,
                              image: project.image || merged[0],
                            };
                            return { ...prev, projects };
                          }, true)
                        );
                        e.target.value = "";
                      }}
                    />
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Upload multiple images — saves automatically.
                    </p>
                  </div>
                  <Field
                    label="Tags (comma separated)"
                    value={(project.tags || []).join(", ")}
                    onChange={(v) => {
                      const projects = [...content.projects];
                      projects[idx] = {
                        ...project,
                        tags: v.split(",").map((s) => s.trim()).filter(Boolean),
                      };
                      setContent({ ...content, projects });
                    }}
                  />
                  <div className="grid gap-2 md:grid-cols-2">
                    <Field
                      label="Role"
                      value={project.role}
                      onChange={(v) => {
                        const projects = [...content.projects];
                        projects[idx] = { ...project, role: v };
                        setContent({ ...content, projects });
                      }}
                    />
                    <Field
                      label="Year"
                      value={project.year}
                      onChange={(v) => {
                        const projects = [...content.projects];
                        projects[idx] = { ...project, year: v };
                        setContent({ ...content, projects });
                      }}
                    />
                    <Field
                      label="Preview URL"
                      value={project.previewUrl}
                      onChange={(v) => {
                        const projects = [...content.projects];
                        projects[idx] = { ...project, previewUrl: v };
                        setContent({ ...content, projects });
                      }}
                    />
                    <Field
                      label="Source URL"
                      value={project.sourceUrl}
                      onChange={(v) => {
                        const projects = [...content.projects];
                        projects[idx] = { ...project, sourceUrl: v };
                        setContent({ ...content, projects });
                      }}
                    />
                  </div>
                  <TextArea
                    label="Highlights (one per line)"
                    value={(project.highlights || []).join("\n")}
                    onChange={(v) => {
                      const projects = [...content.projects];
                      projects[idx] = {
                        ...project,
                        highlights: v.split("\n").map((s) => s.trim()).filter(Boolean),
                      };
                      setContent({ ...content, projects });
                    }}
                  />
                  <button
                    type="button"
                    className="justify-self-start text-sm text-red-300"
                    onClick={() =>
                      setContent({
                        ...content,
                        projects: content.projects.filter((p) => p.id !== project.id),
                      })
                    }
                  >
                    Remove project
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {section === "products" && (
          <section className="panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Products (Shop)</h2>
              <button
                className="btn-ghost !py-1.5 !px-3 text-sm"
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    products: [
                      ...(content.products || []),
                      {
                        id: crypto.randomUUID(),
                        title: "New Product",
                        subtitle: "Short subtitle",
                        description: "Short description",
                        longDescription: "Full product details...",
                        image: "/images/certificates.jpg",
                        gallery: ["/images/certificates.jpg"],
                        tags: ["Digital"],
                        price: 49,
                        currency: "USD",
                        buyUrl: "#",
                        downloadUrl: "",
                        features: ["Feature one"],
                        stock: "In stock",
                        featured: false,
                      },
                    ],
                  })
                }
              >
                Add product
              </button>
            </div>
            <div className="grid gap-4">
              {(content.products || []).map((product, idx) => (
                <div key={product.id} className="grid gap-2 border border-[var(--line)] p-4">
                  <Field
                    label="Title"
                    value={product.title}
                    onChange={(v) => {
                      const products = [...content.products];
                      products[idx] = { ...product, title: v };
                      setContent({ ...content, products });
                    }}
                  />
                  <Field
                    label="Subtitle"
                    value={product.subtitle}
                    onChange={(v) => {
                      const products = [...content.products];
                      products[idx] = { ...product, subtitle: v };
                      setContent({ ...content, products });
                    }}
                  />
                  <TextArea
                    label="Short description"
                    value={product.description}
                    onChange={(v) => {
                      const products = [...content.products];
                      products[idx] = { ...product, description: v };
                      setContent({ ...content, products });
                    }}
                  />
                  <TextArea
                    label="Full / modal description"
                    value={product.longDescription}
                    onChange={(v) => {
                      const products = [...content.products];
                      products[idx] = { ...product, longDescription: v };
                      setContent({ ...content, products });
                    }}
                  />
                  <Field
                    label="Image path / URL"
                    value={product.image}
                    onChange={(v) => {
                      const products = [...content.products];
                      products[idx] = { ...product, image: v };
                      setContent({ ...content, products });
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt="" className="h-16 w-28 rounded-lg object-cover" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          void uploadImage(file, (url) =>
                            patchContent((prev) => {
                              const products = [...(prev.products || [])];
                              const product = products[idx];
                              if (!product) return prev;
                              products[idx] = {
                                ...product,
                                image: url,
                                gallery: [
                                  url,
                                  ...(product.gallery || []).filter((g) => g !== product.image),
                                ],
                              };
                              return { ...prev, products };
                            }, true)
                          );
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Gallery images (1+ slides)</label>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {(product.gallery?.length ? product.gallery : [product.image]).map((src, gIdx) => (
                        <div key={`${src}-${gIdx}`} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-16 w-20 rounded-lg object-cover ring-1 ring-white/15" />
                          <button
                            type="button"
                            className="absolute -right-1 -top-1 rounded-full bg-red-500/90 px-1.5 text-[10px] text-white"
                            onClick={() => {
                              const products = [...content.products];
                              const nextGallery = (product.gallery || []).filter((_, i) => i !== gIdx);
                              const safe = nextGallery.length ? nextGallery : [product.image];
                              products[idx] = {
                                ...product,
                                gallery: safe,
                                image: gIdx === 0 ? safe[0] : product.image,
                              };
                              setContent({ ...content, products });
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files?.length) return;
                        void uploadManyImages(files, (urls) =>
                          patchContent((prev) => {
                            const products = [...(prev.products || [])];
                            const product = products[idx];
                            if (!product) return prev;
                            const merged = Array.from(
                              new Set(
                                [...(product.gallery || [product.image]), ...urls].filter(Boolean)
                              )
                            );
                            products[idx] = {
                              ...product,
                              gallery: merged,
                              image: product.image || merged[0],
                            };
                            return { ...prev, products };
                          }, true)
                        );
                        e.target.value = "";
                      }}
                    />
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Upload multiple images — saves automatically.
                    </p>
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <Field
                      label="Price"
                      value={String(product.price)}
                      onChange={(v) => {
                        const products = [...content.products];
                        products[idx] = { ...product, price: Number(v) || 0 };
                        setContent({ ...content, products });
                      }}
                    />
                    <Field
                      label="Currency"
                      value={product.currency}
                      onChange={(v) => {
                        const products = [...content.products];
                        products[idx] = { ...product, currency: v };
                        setContent({ ...content, products });
                      }}
                    />
                    <Field
                      label="Stock label"
                      value={product.stock}
                      onChange={(v) => {
                        const products = [...content.products];
                        products[idx] = { ...product, stock: v };
                        setContent({ ...content, products });
                      }}
                    />
                  </div>
                  <Field
                    label="External buy URL (Stripe/Gumroad optional)"
                    value={product.buyUrl}
                    onChange={(v) => {
                      const products = [...content.products];
                      products[idx] = { ...product, buyUrl: v };
                      setContent({ ...content, products });
                    }}
                  />
                  <Field
                    label="Download URL / path (shown on sell page)"
                    value={product.downloadUrl || ""}
                    onChange={(v) => {
                      const products = [...content.products];
                      products[idx] = { ...product, downloadUrl: v };
                      setContent({ ...content, products });
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          void uploadImage(file, (url) =>
                            patchContent((prev) => {
                              const products = [...(prev.products || [])];
                              const current = products[idx];
                              if (!current) return prev;
                              products[idx] = { ...current, downloadUrl: url };
                              return { ...prev, products };
                            }, true)
                          );
                        e.target.value = "";
                      }}
                    />
                    <p className="text-xs text-[var(--muted)]">
                      Upload a file for download, or paste a path like <code>/uploads/kit.zip</code>
                    </p>
                  </div>
                  <Field
                    label="Tags (comma separated)"
                    value={(product.tags || []).join(", ")}
                    onChange={(v) => {
                      const products = [...content.products];
                      products[idx] = {
                        ...product,
                        tags: v.split(",").map((s) => s.trim()).filter(Boolean),
                      };
                      setContent({ ...content, products });
                    }}
                  />
                  <TextArea
                    label="Features (one per line)"
                    value={(product.features || []).join("\n")}
                    onChange={(v) => {
                      const products = [...content.products];
                      products[idx] = {
                        ...product,
                        features: v.split("\n").map((s) => s.trim()).filter(Boolean),
                      };
                      setContent({ ...content, products });
                    }}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={product.featured}
                      onChange={(e) => {
                        const products = [...content.products];
                        products[idx] = { ...product, featured: e.target.checked };
                        setContent({ ...content, products });
                      }}
                    />
                    Featured
                  </label>
                  <button
                    type="button"
                    className="justify-self-start text-sm text-red-300"
                    onClick={() =>
                      setContent({
                        ...content,
                        products: content.products.filter((p) => p.id !== product.id),
                      })
                    }
                  >
                    Remove product
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {section === "certificates" && (
          <section className="panel p-6">
            <h2 className="mb-4 text-lg font-semibold">Certificates</h2>
            <div className="grid gap-4">
              {content.certificates.map((cert, idx) => (
                <div key={cert.id} className="grid gap-2 border border-[var(--line)] p-4">
                  <Field label="Platform" value={cert.platform} onChange={(v) => {
                    const certificates = [...content.certificates];
                    certificates[idx] = { ...cert, platform: v };
                    setContent({ ...content, certificates });
                  }} />
                  <Field label="Title" value={cert.title} onChange={(v) => {
                    const certificates = [...content.certificates];
                    certificates[idx] = { ...cert, title: v };
                    setContent({ ...content, certificates });
                  }} />
                  <TextArea label="Description" value={cert.description} onChange={(v) => {
                    const certificates = [...content.certificates];
                    certificates[idx] = { ...cert, description: v };
                    setContent({ ...content, certificates });
                  }} />
                  <Field label="Date" value={cert.date} onChange={(v) => {
                    const certificates = [...content.certificates];
                    certificates[idx] = { ...cert, date: v };
                    setContent({ ...content, certificates });
                  }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {section === "visibility" && (
          <section className="panel grid gap-8 p-6">
            <div>
              <h2 className="mb-2 text-lg font-semibold">Navbar links</h2>
              <p className="mb-4 text-sm text-[var(--muted)]">
                Toggle which links appear in the public navbar. Label and href can be edited.
              </p>
              <div className="grid gap-3">
                {(content.nav || []).map((link, idx) => (
                  <div
                    key={`${link.href}-${idx}`}
                    className="grid gap-2 border border-[var(--line)] p-4 sm:grid-cols-[auto_1fr_1fr]"
                  >
                    <label className="flex items-center gap-2 text-sm sm:row-span-2 sm:self-center">
                      <input
                        type="checkbox"
                        checked={link.visible !== false}
                        onChange={(e) => {
                          const nav = [...content.nav];
                          nav[idx] = { ...link, visible: e.target.checked };
                          setContent({ ...content, nav });
                        }}
                      />
                      Visible
                    </label>
                    <Field
                      label="Label"
                      value={link.label}
                      onChange={(v) => {
                        const nav = [...content.nav];
                        nav[idx] = { ...link, label: v };
                        setContent({ ...content, nav });
                      }}
                    />
                    <Field
                      label="Href"
                      value={link.href}
                      onChange={(v) => {
                        const nav = [...content.nav];
                        nav[idx] = { ...link, href: v };
                        setContent({ ...content, nav });
                      }}
                    />
                  </div>
                ))}
                {(!content.nav || content.nav.length === 0) && (
                  <p className="text-sm text-[var(--muted)]">No nav links in content yet.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-lg font-semibold">Page sections</h2>
              <p className="mb-4 text-sm text-[var(--muted)]">
                Hide or show entire sections on the public portfolio. Use Save resume to persist.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {SECTION_VISIBILITY_LABELS.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 rounded-xl border border-[var(--line)] px-4 py-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={content.sectionVisibility?.[key] !== false}
                      onChange={(e) => {
                        setContent({
                          ...content,
                          sectionVisibility: {
                            ...content.sectionVisibility,
                            [key]: e.target.checked,
                          },
                        });
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </section>
        )}

        {section === "stats" && (
          <section className="panel p-6">
            <h2 className="mb-2 text-lg font-semibold">Visit stats</h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Set baseline Visits and Unique counts. Values are stored in the local database and
              keep growing as people visit the site.
            </p>
            <form onSubmit={saveStats} className="grid max-w-md gap-3">
              <Field
                label="Visits"
                value={statsForm.visits}
                onChange={(v) => setStatsForm((s) => ({ ...s, visits: v }))}
              />
              <Field
                label="Unique"
                value={statsForm.uniqueVisits}
                onChange={(v) => setStatsForm((s) => ({ ...s, uniqueVisits: v }))}
              />
              <button type="submit" className="btn-glow justify-self-start">
                Save stats
              </button>
            </form>
          </section>
        )}

        {section === "reviews" && (
          <div className="grid gap-3">
            {reviews.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No reviews yet.</p>
            )}
            {reviews.map((review) => (
              <div
                key={review.id}
                className="panel flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {review.name}{" "}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        review.approved
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-200"
                      }`}
                    >
                      {review.approved ? "Approved" : "Pending"}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {review.role}
                    {review.company ? ` · ${review.company}` : ""} · {review.rating}/5
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{review.comment}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-ghost !py-1.5 !px-3 text-sm"
                    onClick={async () => {
                      await fetch("/api/reviews", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: review.id,
                          approved: !review.approved,
                        }),
                      });
                      setReviews((prev) =>
                        prev.map((r) =>
                          r.id === review.id ? { ...r, approved: !r.approved } : r
                        )
                      );
                    }}
                  >
                    {review.approved ? "Unpublish" : "Approve"}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-300"
                    onClick={async () => {
                      await fetch(`/api/reviews?id=${review.id}`, { method: "DELETE" });
                      setReviews((prev) => prev.filter((r) => r.id !== review.id));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === "hires" && (
          <div className="grid gap-3">
            {hires.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No hire requests yet.</p>
            )}
            {hires.map((hire) => (
              <div key={hire.id} className="panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {hire.name}{" "}
                    <span className="text-sm font-normal text-[var(--muted)]">
                      ({hire.email})
                    </span>
                  </p>
                  <span className="text-xs uppercase tracking-wider text-teal-300">
                    {hire.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {hire.company || "No company"} · {hire.budget || "No budget"} ·{" "}
                  {new Date(hire.createdAt).toLocaleString()}
                </p>
                <p className="mt-3 text-sm text-[var(--muted)]">{hire.message}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="btn-ghost !py-1.5 !px-3 text-sm"
                    onClick={async () => {
                      await fetch("/api/hire", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: hire.id, status: "read" }),
                      });
                      setHires((prev) =>
                        prev.map((h) => (h.id === hire.id ? { ...h, status: "read" } : h))
                      );
                    }}
                  >
                    Mark read
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-300"
                    onClick={async () => {
                      await fetch(`/api/hire?id=${hire.id}`, { method: "DELETE" });
                      setHires((prev) => prev.filter((h) => h.id !== hire.id));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === "orders" && (
          <div className="grid gap-3">
            {orders.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No product orders yet.</p>
            )}
            {orders.map((ord) => (
              <div key={ord.id} className="panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {ord.productTitle}{" "}
                    <span className="text-sm font-normal text-emerald-300">
                      {ord.currency} {ord.price}
                    </span>
                  </p>
                  <span className="text-xs uppercase tracking-wider text-teal-300">
                    {ord.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {ord.name} · {ord.email} · {new Date(ord.createdAt).toLocaleString()}
                </p>
                {ord.note && <p className="mt-2 text-sm text-[var(--muted)]">{ord.note}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["new", "paid", "fulfilled", "cancelled"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      className="btn-ghost !py-1 !px-2 text-xs"
                      onClick={async () => {
                        await fetch("/api/orders", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: ord.id, status: st }),
                        });
                        setOrders((prev) =>
                          prev.map((o) => (o.id === ord.id ? { ...o, status: st } : o))
                        );
                      }}
                    >
                      {st}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="text-sm text-red-300"
                    onClick={async () => {
                      await fetch(`/api/orders?id=${ord.id}`, { method: "DELETE" });
                      setOrders((prev) => prev.filter((o) => o.id !== ord.id));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === "ai" && (
          <form onSubmit={saveAi} className="panel mx-auto grid max-w-xl gap-3 p-6">
            <h2 className="text-xl font-semibold">AI Assistant (OpenAI)</h2>
            <p className="text-sm text-[var(--muted)]">
              Speaks as {content.fullName} using the profile avatar and resume data. Paste your
              OpenAI key here or set <code>OPENAI_API_KEY</code> in <code>.env.local</code>.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={aiForm.aiEnabled}
                onChange={(e) => setAiForm({ ...aiForm, aiEnabled: e.target.checked })}
              />
              Enable AI chat widget
            </label>
            <Field
              label="Model"
              value={aiForm.aiModel}
              onChange={(v) => setAiForm({ ...aiForm, aiModel: v })}
            />
            <div>
              <label className="admin-label">
                OpenAI API key {aiForm.hasKey ? `(saved: ${aiForm.maskedKey})` : "(not set)"}
              </label>
              <input
                className="admin-input"
                type="password"
                placeholder="sk-... paste full key then Save"
                value={aiForm.openaiApiKey}
                onChange={(e) => setAiForm({ ...aiForm, openaiApiKey: e.target.value })}
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                Stored in SQLite (<code>data/portfolio.db</code>). Leave blank when saving other
                AI options to keep the existing key.
              </p>
            </div>
            <TextArea
              label="Welcome message (optional)"
              value={aiForm.aiWelcome}
              onChange={(v) => setAiForm({ ...aiForm, aiWelcome: v })}
            />
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn-glow">
                Save AI settings
              </button>
              {aiForm.hasKey && (
                <button type="button" className="btn-ghost" onClick={clearAiKey}>
                  Clear API key
                </button>
              )}
            </div>
          </form>
        )}

        {section === "account" && (
          <form onSubmit={updateAccount} className="panel mx-auto grid max-w-lg gap-3 p-6">
            <Field label="Admin email" value={account.newEmail} onChange={(v) => setAccount({ ...account, newEmail: v })} />
            <div>
              <label className="admin-label">Current password</label>
              <input
                className="admin-input"
                type="password"
                value={account.currentPassword}
                onChange={(e) => setAccount({ ...account, currentPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="admin-label">New password (optional)</label>
              <input
                className="admin-input"
                type="password"
                value={account.newPassword}
                onChange={(e) => setAccount({ ...account, newPassword: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-glow">
              Update account
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <input className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <textarea className="admin-input min-h-24" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
