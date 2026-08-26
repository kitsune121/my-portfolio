export interface NavLink {
  label: string;
  href: string;
  visible?: boolean;
}

export interface HeroContent {
  availableText: string;
  headline: string;
  role: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface AboutContent {
  title: string;
  bio: string;
  resumeUrl: string;
  githubUrl: string;
  image: string;
  location: string;
  phone: string;
  gmail: string;
  whatsapp: string;
  telegram: string;
  discord: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  level: number;
}

export interface Certificate {
  id: string;
  platform: string;
  title: string;
  description: string;
  skills: string[];
  date: string;
  verificationId: string;
  theme: "aws" | "gcp" | "ai";
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  dates: string;
  description: string;
  tags: string[];
  image: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  dates: string;
  description: string;
  tags: string[];
  image: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  tags: string[];
  role: string;
  year: string;
  previewUrl: string;
  sourceUrl: string;
  highlights: string[];
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  tags: string[];
  price: number;
  currency: string;
  buyUrl: string;
  features: string[];
  stock: string;
  featured: boolean;
}

export interface ProductOrder {
  id: string;
  productId: string;
  productTitle: string;
  price: number;
  currency: string;
  name: string;
  email: string;
  note: string;
  status: "new" | "paid" | "fulfilled" | "cancelled";
  createdAt: string;
}

export interface OrbitImage {
  id: string;
  label: string;
  image: string;
}

export interface ClientReview {
  id: string;
  name: string;
  role: string;
  company: string;
  rating: number;
  comment: string;
  avatar: string;
  approved: boolean;
  createdAt: string;
}

export interface HireRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
  createdAt: string;
  status: "new" | "read" | "archived";
}

export interface SiteStats {
  visits: number;
  uniqueVisits: number;
}

export interface SectionVisibility {
  hero: boolean;
  stats: boolean;
  summary: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  projects: boolean;
  shop: boolean;
  reviews: boolean;
  hire: boolean;
  certificates: boolean;
  footer: boolean;
  ai: boolean;
}

export interface SiteContent {
  brand: string;
  fullName: string;
  email: string;
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
  };
  nav: NavLink[];
  hero: HeroContent;
  about: AboutContent;
  orbitImages: OrbitImage[];
  skills: Skill[];
  certificates: Certificate[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  products: Product[];
  sectionVisibility: SectionVisibility;
}

export interface AuthData {
  email: string;
  passwordHash: string;
  salt: string;
}
