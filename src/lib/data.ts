import { randomUUID } from "crypto";
import {
  getKv,
  setKv,
  getStatsRow,
  recordVisitRow,
  incrementUniqueVisitsRow,
  getReviewRows,
  saveReviewRows,
  insertReviewRow,
  getHireRows,
  saveHireRows,
  insertHireRow,
  getOrderRows,
  saveOrderRows,
  insertOrderRow,
} from "./storage";
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
    brand: raw.brand || "Koichi.",
    fullName: raw.fullName || "Koichi Sato",
    email: raw.email || "koichisato049@gmail.com",
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
      gmail: raw.about?.gmail || raw.email || "koichisato049@gmail.com",
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
  const row = getStatsRow();
  return {
    visits: row.visits,
    uniqueVisits: row.hireCount,
  };
}

export function recordVisit(visitorKey: string): SiteStats {
  recordVisitRow(visitorKey);
  return getStats();
}

export function incrementUniqueOnHire(): SiteStats {
  incrementUniqueVisitsRow();
  return getStats();
}

export function getReviews(): ClientReview[] {
  const rows = getReviewRows();

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
  saveReviewRows(
    reviews.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role || "",
      company: r.company || "",
      rating: r.rating || 5,
      comment: r.comment,
      avatar: r.avatar || "",
      approved: r.approved ? 1 : 0,
      created_at: r.createdAt,
    }))
  );
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
  insertReviewRow({
    id: review.id,
    name: review.name,
    role: review.role,
    company: review.company,
    rating: review.rating,
    comment: review.comment,
    avatar: review.avatar,
    approved: review.approved ? 1 : 0,
    created_at: review.createdAt,
  });
  return review;
}

export function getHireRequests(): HireRequest[] {
  const rows = getHireRows();

  return rows.map((h) => ({
    id: h.id,
    name: h.name,
    email: h.email,
    company: h.company,
    budget: h.budget,
    message: h.message,
    status: h.status as HireRequest["status"],
    createdAt: h.created_at,
  }));
}

export function saveHireRequests(items: HireRequest[]) {
  saveHireRows(
    items.map((h) => ({
      id: h.id,
      name: h.name,
      email: h.email,
      company: h.company || "",
      budget: h.budget || "",
      message: h.message,
      status: h.status || "new",
      created_at: h.createdAt,
    }))
  );
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
  insertHireRow({
    id: item.id,
    name: item.name,
    email: item.email,
    company: item.company,
    budget: item.budget,
    message: item.message,
    status: item.status,
    created_at: item.createdAt,
  });
  incrementUniqueOnHire();
  return item;
}

export function getProductOrders(): ProductOrder[] {
  const rows = getOrderRows();

  return rows.map((o) => ({
    id: o.id,
    productId: o.product_id,
    productTitle: o.product_title,
    price: o.price,
    currency: o.currency,
    name: o.name,
    email: o.email,
    note: o.note,
    status: o.status as ProductOrder["status"],
    createdAt: o.created_at,
  }));
}

export function saveProductOrders(items: ProductOrder[]) {
  saveOrderRows(
    items.map((o) => ({
      id: o.id,
      product_id: o.productId,
      product_title: o.productTitle,
      price: o.price,
      currency: o.currency,
      name: o.name,
      email: o.email,
      note: o.note || "",
      status: o.status || "new",
      created_at: o.createdAt,
    }))
  );
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
  insertOrderRow({
    id: item.id,
    product_id: item.productId,
    product_title: item.productTitle,
    price: item.price,
    currency: item.currency,
    name: item.name,
    email: item.email,
    note: item.note,
    status: item.status,
    created_at: item.createdAt,
  });
  return item;
}
