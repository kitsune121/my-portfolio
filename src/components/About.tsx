"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import ResumeDownloadLink from "./ResumeDownloadLink";
import type { SiteContent } from "@/lib/types";

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 7.5c.85 0 1.7.12 2.5.34 1.9-1.32 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.59.69.48A10.33 10.33 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12m0 0l4-4m-4 4l-4-4M5 19h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M1.5 6.75V18a1.5 1.5 0 0 0 1.5 1.5h2.25V10.2L12 15.3l6.75-5.1V19.5H21a1.5 1.5 0 0 0 1.5-1.5V6.75L12 14.1 1.5 6.75z" />
      <path fill="#EA4335" d="M22.5 6.75V5.4c0-1.24-1.34-1.97-2.4-1.31L12 9.15 3.9 4.09C2.84 3.43 1.5 4.16 1.5 5.4v1.35L12 14.1l10.5-7.35z" />
      <path fill="#34A853" d="M1.5 6.75v11.25A1.5 1.5 0 0 0 3 19.5h2.25V10.2L1.5 6.75z" />
      <path fill="#FBBC05" d="M22.5 6.75l-3.75 3.45V19.5H21a1.5 1.5 0 0 0 1.5-1.5V6.75z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#2AABEE" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z"
        stroke="#5eead4"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="#5eead4" strokeWidth="1.7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 3.5h3l1.2 4.2-2 1.2a12.5 12.5 0 0 0 5.4 5.4l1.2-2 4.2 1.2v3c0 .9-.7 1.7-1.6 1.8-1.8.2-5.7.1-9.5-3.7S3.5 8.7 3.7 6.9c.1-.9.9-1.6 1.8-1.6z"
        stroke="#38bdf8"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function whatsappHref(value: string) {
  const digits = value.replace(/[^\d+]/g, "");
  const phone = digits.replace(/^\+/, "");
  if (!phone) return "";
  return `https://wa.me/${phone}`;
}

function telegramHref(value: string) {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http")) return v;
  return `https://t.me/${v.replace(/^@/, "")}`;
}

function discordHref(value: string) {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http")) return v;
  return "";
}

function githubHref(value: string) {
  const v = value.trim();
  if (!v) return "https://github.com";
  if (v.startsWith("http")) return v;
  return `https://github.com/${v.replace(/^@/, "")}`;
}

type ContactItem = {
  label: string;
  value: string;
  href: string;
  external?: boolean;
  icon: ReactNode;
  tone: string;
  always?: boolean;
};

export default function About({ content }: { content: SiteContent }) {
  const { about } = content;
  const first = content.fullName.split(" ")[0] || content.fullName;
  const gmail = about.gmail || content.email;
  const github = about.githubUrl || content.socials.github || "https://github.com";
  const githubLink = githubHref(github);

  const contacts: ContactItem[] = [
    {
      label: "Gmail",
      value: gmail,
      href: gmail ? `mailto:${gmail}` : "",
      icon: <GmailIcon />,
      tone: "contact-icon--gmail",
    },
    {
      label: "WhatsApp",
      value: about.whatsapp,
      href: whatsappHref(about.whatsapp || ""),
      external: true,
      icon: <WhatsAppIcon />,
      tone: "contact-icon--whatsapp",
    },
    {
      label: "Telegram",
      value: about.telegram,
      href: telegramHref(about.telegram || ""),
      external: true,
      icon: <TelegramIcon />,
      tone: "contact-icon--telegram",
    },
    {
      label: "Discord",
      value: about.discord,
      href: discordHref(about.discord || ""),
      external: true,
      icon: <DiscordIcon />,
      tone: "contact-icon--discord",
    },
    {
      label: "GitHub",
      value: github,
      href: githubLink,
      external: true,
      icon: <GithubIcon />,
      tone: "contact-icon--github",
      always: true,
    },
    {
      label: "Location",
      value: about.location,
      href: "",
      icon: <LocationIcon />,
      tone: "contact-icon--location",
    },
    {
      label: "Phone",
      value: about.phone,
      href: about.phone ? `tel:${about.phone.replace(/\s+/g, "")}` : "",
      icon: <PhoneIcon />,
      tone: "contact-icon--phone",
    },
  ].filter((c) => c.always || Boolean(c.value?.trim()));

  return (
    <section id="summary" className="section section-odd">
      <div className="shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 xl:gap-20">
        <AnimatedSection>
          <p className="section-label">Resume</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            <span className="aurora-text">{about.title}</span>
          </h2>
          <div className="mt-8 space-y-3 text-sm">
            {contacts.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="contact-row panel"
                data-cursor="hover"
              >
                <span className={`contact-icon ${item.tone}`}>{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-300/80">{item.label}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-1 block break-all text-[var(--text)] hover:text-teal-200"
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noreferrer" : undefined}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 break-all text-[var(--text)]">{item.value}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="summary-pro">
            <div className="summary-pro-rail" aria-hidden />
            <div className="summary-pro-body">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="summary-pro-kicker">About {first}</span>
                <span className="summary-pro-status">
                  <span className="summary-pro-status-dot" />
                  {content.hero.availableText || "Open to opportunities"}
                </span>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="summary-pro-copy"
              >
                {about.bio}
              </motion.p>

              <div className="summary-pro-divider" aria-hidden />

              <div className="flex flex-wrap items-center gap-3">
                <ResumeDownloadLink content={content} className="summary-pro-cta summary-pro-cta--primary">
                  <DownloadIcon />
                  Download Resume
                </ResumeDownloadLink>
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="summary-pro-cta summary-pro-cta--ghost"
                  data-cursor="hover"
                >
                  <GithubIcon />
                  View GitHub
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
