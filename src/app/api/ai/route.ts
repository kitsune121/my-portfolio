import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth";
import { getContent } from "@/lib/data";
import { getOpenAIKey, getSettings, maskKey, saveSettings } from "@/lib/settings";

export async function GET() {
  const session = await getSession();
  const settings = getSettings();
  const key = getOpenAIKey();
  return NextResponse.json({
    aiEnabled: settings.aiEnabled,
    aiModel: settings.aiModel,
    aiWelcome: settings.aiWelcome,
    hasKey: Boolean(key),
    maskedKey: session ? maskKey(key) : undefined,
    source: process.env.OPENAI_API_KEY?.trim()
      ? "env"
      : settings.openaiApiKey
        ? "admin"
        : "none",
  });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const current = getSettings();
  let openaiApiKey = current.openaiApiKey;

  if (typeof body.openaiApiKey === "string") {
    const incoming = body.openaiApiKey.trim();
    if (incoming.includes("••••")) {
      // keep existing
    } else if (incoming.length > 0) {
      openaiApiKey = incoming;
    } else {
      // explicit clear only when user sends empty and confirms via clearKey
      if (body.clearKey === true) openaiApiKey = "";
    }
  }

  const next = {
    openaiApiKey,
    aiEnabled: typeof body.aiEnabled === "boolean" ? body.aiEnabled : current.aiEnabled,
    aiModel: body.aiModel ? String(body.aiModel).trim() : current.aiModel,
    aiWelcome: typeof body.aiWelcome === "string" ? body.aiWelcome : current.aiWelcome,
  };

  saveSettings(next);

  const saved = getSettings();
  const key = getOpenAIKey();

  return NextResponse.json({
    ok: true,
    aiEnabled: saved.aiEnabled,
    aiModel: saved.aiModel,
    aiWelcome: saved.aiWelcome,
    hasKey: Boolean(key),
    maskedKey: maskKey(key),
    source: process.env.OPENAI_API_KEY?.trim()
      ? "env"
      : saved.openaiApiKey
        ? "admin"
        : "none",
  });
}

export async function POST(req: Request) {
  const settings = getSettings();
  if (!settings.aiEnabled) {
    return NextResponse.json({ error: "AI assistant is disabled" }, { status: 403 });
  }

  const key = getOpenAIKey();
  if (!key) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured. Add it in Admin → AI Assistant." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const message = String(body.message || "").trim();
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const content = getContent();
  const system = `You are ${content.fullName}'s AI portfolio assistant. Speak in first person as ${content.fullName} (friendly, professional, concise).
Role: ${content.hero.role}
Location: ${content.about.location}
Email for hiring: ${content.email}
Bio: ${content.about.bio}
Skills: ${content.skills.map((s) => s.name).join(", ")}
Experience: ${content.experience.map((e) => `${e.role} at ${e.company} (${e.dates})`).join("; ")}
Education: ${content.education.map((e) => `${e.degree} — ${e.school}`).join("; ")}
Projects: ${content.projects.map((p) => `${p.title}: ${p.description}`).join(" | ")}
Products: ${(content.products || []).map((p) => `${p.title} (${p.currency} ${p.price})`).join(" | ")}
Certificates: ${content.certificates.map((c) => c.title).join(", ")}

Help visitors learn about ${content.fullName}, skills, projects, products, and how to hire. If they want to hire, invite them to use the Hire section or email ${content.email}. Keep answers under 120 words unless asked for detail.`;

  try {
    const openai = new OpenAI({ apiKey: key });
    const completion = await openai.chat.completions.create({
      model: settings.aiModel || "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        ...history
          .filter((m: { role?: string; content?: string }) => m?.content && m?.role)
          .map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content).slice(0, 2000),
          })),
        { role: "user", content: message.slice(0, 2000) },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "Thanks for reaching out — feel free to ask about my work or how to hire me.";

    return NextResponse.json({
      ok: true,
      reply,
      name: content.fullName,
      avatar: content.about.image,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
