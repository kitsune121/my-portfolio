import { randomUUID } from "crypto";
import { getDb, getKv, setKv } from "./db";
import type {
  ClientReview,
  HireRequest,
  ProductOrder,
  SectionVisibility,
  SiteContent,
  SiteStats,
} from "./types";

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  hero: true,
  stats: true,
  summary: true,
  experience: true,
  education: true,
  skills: true,
  projects: true,
  shop: true,
  reviews: true,
  hire: true,
  certificates: true,
  footer: true,
  ai: true,
};

function normalizeSectionVisibility(
  raw?: Partial<SectionVisibility> | null
): SectionVisibility {
  return {
    hero: raw?.hero !== false,
    stats: raw?.stats !== false,
    summary: raw?.summary !== false,
    experience: raw?.experience !== false,
    education: raw?.education !== false,
    skills: raw?.skills !== false,
    projects: raw?.projects !== false,
    shop: raw?.shop !== false,
    reviews: raw?.reviews !== false,
    hire: raw?.hire !== false,
    certificates: raw?.certificates !== false,
    footer: raw?.footer !== false,
    ai: raw?.ai !== false,
  };
}

function normalizeContent(raw: Partial<SiteContent>): SiteContent {
  const githubUrl =
    raw.about?.githubUrl || raw.socials?.github || "https://github.com";

  return {
    brand: raw.brand || "Yuki.",
    fullName: raw.fullName || "Yuki Nakamura",
    email: raw.email || "hello@yuki.dev",
    socials: {
      github: githubUrl,
      linkedin: raw.socials?.linkedin || "https://linkedin.com",
      twitter: raw.socials?.twitter || "https://twitter.com",
    },
    nav: Array.isArray(raw.nav)
      ? raw.nav.map((link) => ({
          label: link.label || "",
          href: link.href || "#",
          visible: link.visible !== false,
        }))
      : [],
    hero: {
      availableText: raw.hero?.availableText || "Open to opportunities",
      headline: raw.hero?.headline || raw.fullName || "Portfolio",
      role: raw.hero?.role || "Developer",
      description: raw.hero?.description || "",
      primaryCta: raw.hero?.primaryCta || "Contact",
      secondaryCta: raw.hero?.secondaryCta || "Download Resume",
    },
    about: {
      title: raw.about?.title || "Professional Summary",
      bio: raw.about?.bio || "",
      resumeUrl: raw.about?.resumeUrl || "#",
      githubUrl,
      image: raw.about?.image || "/images/profile.jpg",
      location: raw.about?.location || "",
      phone: raw.about?.phone || "",
      gmail: raw.about?.gmail || raw.email || "nyuki6589@gmail.com",
      whatsapp: raw.about?.whatsapp || "",
      telegram: raw.about?.telegram || "",
      discord: raw.about?.discord || "",
    },
    orbitImages: Array.isArray(raw.orbitImages) ? raw.orbitImages : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    certificates: Array.isArray(raw.certificates) ? raw.certificates : [],
    education: Array.isArray(raw.education)
      ? raw.education.map((edu) => ({
          ...edu,
          tags: Array.isArray(edu.tags) ? edu.tags : [],
          image: edu.image || "/images/education/university.svg",
        }))
      : [],
    experience: Array.isArray(raw.experience)
      ? raw.experience.map((exp) => ({
          ...exp,
          tags: Array.isArray(exp.tags) ? exp.tags : [],
          image: exp.image || "",
        }))
      : [],
    projects: Array.isArray(raw.projects)
      ? raw.projects.map((p) => {
          const image = p.image || "/images/certificates.jpg";
          const galleryRaw = Array.isArray(p.gallery) ? p.gallery.filter(Boolean) : [];
          const gallery = Array.from(new Set([image, ...galleryRaw]));
          return {
            ...p,
            subtitle: p.subtitle || "",
            longDescription: p.longDescription || p.description || "",
            image,
            gallery: gallery.length ? gallery : [image],
            tags: Array.isArray(p.tags) ? p.tags : [],
            role: p.role || "",
            year: p.year || "",
            previewUrl: p.previewUrl || "#",
            sourceUrl: p.sourceUrl || "#",
            highlights: Array.isArray(p.highlights) ? p.highlights : [],
          };
        })
      : [],
    products: Array.isArray(raw.products)
      ? raw.products.map((p) => {
          const image = p.image || "/images/certificates.jpg";
          const galleryRaw = Array.isArray(p.gallery) ? p.gallery.filter(Boolean) : [];
          const gallery = Array.from(new Set([image, ...galleryRaw]));
          return {
            id: p.id,
            title: p.title || "Product",
            subtitle: p.subtitle || "",
            description: p.description || "",
            longDescription: p.longDescription || p.description || "",
            image,
            gallery: gallery.length ? gallery : [image],
            tags: Array.isArray(p.tags) ? p.tags : [],
            price: Number(p.price) || 0,
            currency: p.currency || "USD",
            buyUrl: p.buyUrl || "#",
            features: Array.isArray(p.features) ? p.features : [],
            stock: p.stock || "In stock",
            featured: Boolean(p.featured),
          };
        })
      : [],
    sectionVisibility: normalizeSectionVisibility(
      raw.sectionVisibility || DEFAULT_SECTION_VISIBILITY
    ),
  };
}

export function getContent(): SiteContent {
  return normalizeContent(getKv<Partial<SiteContent>>("portfolio", {}));
}

export function saveContent(content: SiteContent) {
  setKv("portfolio", normalizeContent(content));
}

export function getStats(): SiteStats {
  const row = getDb()
    .prepare("SELECT visits, unique_visits FROM stats WHERE id = 1")
    .get() as { visits: number; unique_visits: number } | undefined;
  const hireRow = getDb().prepare("SELECT COUNT(*) AS c FROM hires").get() as
    | { c: number }
    | undefined;
  return {
    visits: row?.visits || 0,
    // Unique = hire requests received
    uniqueVisits: Number(hireRow?.c) || 0,
  };
}

export function recordVisit(visitorKey: string): SiteStats {
  const db = getDb();
  const exists = db
    .prepare("SELECT 1 AS ok FROM visitors WHERE visitor_key = ?")
    .get(visitorKey) as { ok: number } | undefined;

  db.prepare("UPDATE stats SET visits = visits + 1 WHERE id = 1").run();

  if (!exists) {
    db.prepare(
      "INSERT INTO visitors (visitor_key, created_at) VALUES (?, datetime('now'))"
    ).run(visitorKey);
  }

  return getStats();
}

export function incrementUniqueOnHire(): SiteStats {
  getDb()
    .prepare("UPDATE stats SET unique_visits = unique_visits + 1 WHERE id = 1")
    .run();
  return getStats();
}

export function getReviews(): ClientReview[] {
  const rows = getDb()
    .prepare(
      `SELECT id, name, role, company, rating, comment, avatar, approved, created_at
       FROM reviews ORDER BY datetime(created_at) DESC`
    )
    .all() as Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    rating: number;
    comment: string;
    avatar: string;
    approved: number;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    company: r.company,
    rating: r.rating,
    comment: r.comment,
    avatar: r.avatar,
    approved: r.approved === 1,
    createdAt: r.created_at,
  }));
}

export function getApprovedReviews(): ClientReview[] {
  return getReviews().filter((r) => r.approved);
}

export function saveReviews(reviews: ClientReview[]) {
  const db = getDb();
  const tx = db.transaction((items: ClientReview[]) => {
    db.prepare("DELETE FROM reviews").run();
    const insert = db.prepare(
      `INSERT INTO reviews
       (id, name, role, company, rating, comment, avatar, approved, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const r of items) {
      insert.run(
        r.id,
        r.name,
        r.role || "",
        r.company || "",
        r.rating || 5,
        r.comment,
        r.avatar || "",
        r.approved ? 1 : 0,
        r.createdAt
      );
    }
  });
  tx(reviews);
}

export function addReview(
  input: Omit<ClientReview, "id" | "createdAt" | "approved"> & {
    approved?: boolean;
  }
): ClientReview {
  const review: ClientReview = {
    id: randomUUID(),
    name: input.name,
    role: input.role,
    company: input.company,
    rating: input.rating,
    comment: input.comment,
    avatar: input.avatar || "",
    approved: Boolean(input.approved),
    createdAt: new Date().toISOString(),
  };
  getDb()
    .prepare(
      `INSERT INTO reviews
       (id, name, role, company, rating, comment, avatar, approved, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      review.id,
      review.name,
      review.role,
      review.company,
      review.rating,
      review.comment,
      review.avatar,
      review.approved ? 1 : 0,
      review.createdAt
    );
  return review;
}

export function getHireRequests(): HireRequest[] {
  const rows = getDb()
    .prepare(
      `SELECT id, name, email, company, budget, message, status, created_at
       FROM hires ORDER BY datetime(created_at) DESC`
    )
    .all() as Array<{
    id: string;
    name: string;
    email: string;
    company: string;
    budget: string;
    message: string;
    status: HireRequest["status"];
    created_at: string;
  }>;

  return rows.map((h) => ({
    id: h.id,
    name: h.name,
    email: h.email,
    company: h.company,
    budget: h.budget,
    message: h.message,
    status: h.status,
    createdAt: h.created_at,
  }));
}

export function saveHireRequests(items: HireRequest[]) {
  const db = getDb();
  const tx = db.transaction((list: HireRequest[]) => {
    db.prepare("DELETE FROM hires").run();
    const insert = db.prepare(
      `INSERT INTO hires
       (id, name, email, company, budget, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const h of list) {
      insert.run(
        h.id,
        h.name,
        h.email,
        h.company || "",
        h.budget || "",
        h.message,
        h.status || "new",
        h.createdAt
      );
    }
  });
  tx(items);
}

export function addHireRequest(
  input: Omit<HireRequest, "id" | "createdAt" | "status">
): HireRequest {
  const item: HireRequest = {
    id: randomUUID(),
    ...input,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  getDb()
    .prepare(
      `INSERT INTO hires
       (id, name, email, company, budget, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      item.id,
      item.name,
      item.email,
      item.company,
      item.budget,
      item.message,
      item.status,
      item.createdAt
    );
  incrementUniqueOnHire();
  return item;
}

export function getProductOrders(): ProductOrder[] {
  const rows = getDb()
    .prepare(
      `SELECT id, product_id, product_title, price, currency, name, email, note, status, created_at
       FROM orders ORDER BY datetime(created_at) DESC`
    )
    .all() as Array<{
    id: string;
    product_id: string;
    product_title: string;
    price: number;
    currency: string;
    name: string;
    email: string;
    note: string;
    status: ProductOrder["status"];
    created_at: string;
  }>;

  return rows.map((o) => ({
    id: o.id,
    productId: o.product_id,
    productTitle: o.product_title,
    price: o.price,
    currency: o.currency,
    name: o.name,
    email: o.email,
    note: o.note,
    status: o.status,
    createdAt: o.created_at,
  }));
}

export function saveProductOrders(items: ProductOrder[]) {
  const db = getDb();
  const tx = db.transaction((list: ProductOrder[]) => {
    db.prepare("DELETE FROM orders").run();
    const insert = db.prepare(
      `INSERT INTO orders
       (id, product_id, product_title, price, currency, name, email, note, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const o of list) {
      insert.run(
        o.id,
        o.productId,
        o.productTitle,
        o.price,
        o.currency,
        o.name,
        o.email,
        o.note || "",
        o.status || "new",
        o.createdAt
      );
    }
  });
  tx(items);
}

export function addProductOrder(
  input: Omit<ProductOrder, "id" | "createdAt" | "status">
): ProductOrder {
  const item: ProductOrder = {
    id: randomUUID(),
    ...input,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  getDb()
    .prepare(
      `INSERT INTO orders
       (id, product_id, product_title, price, currency, name, email, note, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      item.id,
      item.productId,
      item.productTitle,
      item.price,
      item.currency,
      item.name,
      item.email,
      item.note,
      item.status,
      item.createdAt
    );
  return item;
}
