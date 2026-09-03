const DEFAULT_ORBIT: Record<string, string> = {
  react: "/images/orbit/react.svg",
  nextjs: "/images/orbit/js.svg",
  typescript: "/images/orbit/ts.svg",
  ts: "/images/orbit/ts.svg",
  javascript: "/images/orbit/js.svg",
  js: "/images/orbit/js.svg",
  nodejs: "/images/orbit/node.svg",
  node: "/images/orbit/node.svg",
  aws: "/images/orbit/aws.svg",
  gcp: "/images/orbit/gcp.svg",
  ai: "/images/orbit/ai.svg",
  figma: "/images/orbit/figma.svg",
  python: "/images/orbit/js.svg",
  mongodb: "/images/orbit/node.svg",
  tailwind: "/images/orbit/js.svg",
  code: "/images/orbit/ts.svg",
};

function skillInitials(name: string) {
  const parts = name
    .replace(/[/&]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Resolve skill icon: uploaded path/URL wins; otherwise known defaults; else null (use initials). */
export function resolveSkillIcon(icon: string | undefined, name = ""): string | null {
  const raw = (icon || "").trim();
  if (!raw || raw === "code") {
    // try name-based default before giving up
    const fromName = name.toLowerCase();
    if (fromName.includes("react")) return DEFAULT_ORBIT.react;
    if (fromName.includes("typescript") || fromName.includes("javascript")) return DEFAULT_ORBIT.ts;
    if (fromName.includes("node")) return DEFAULT_ORBIT.node;
    if (fromName.includes("aws")) return DEFAULT_ORBIT.aws;
    if (fromName.includes("gcp") || fromName.includes("google")) return DEFAULT_ORBIT.gcp;
    if (fromName.includes("ai") || fromName.includes("llm")) return DEFAULT_ORBIT.ai;
    if (fromName.includes("figma") || fromName.includes("ui")) return DEFAULT_ORBIT.figma;
    if (raw === "code") return DEFAULT_ORBIT.code;
    return null;
  }
  if (raw.startsWith("/") || raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  const key = raw.toLowerCase().replace(/\s+/g, "");
  return DEFAULT_ORBIT[key] || null;
}

export function skillIconFallbackLabel(name: string) {
  return skillInitials(name);
}
