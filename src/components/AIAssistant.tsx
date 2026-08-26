"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SiteContent } from "@/lib/types";

type Msg = { role: "user" | "assistant"; content: string; id: string };

function msgId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ThinkingBubble({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 28, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, scale: 0.95 }}
      className="ai-msg-row ai-msg-row--assistant"
    >
      <div className="ai-bubble ai-bubble--thinking">
        <span className="ai-think-orbit" aria-hidden />
        <span className="ai-think-orbit ai-think-orbit--2" aria-hidden />
        <div className="relative z-[1] flex items-center gap-2.5">
          <span className="ai-think-pulse" />
          <span className="font-medium tracking-wide text-sky-100/95">
            {name} is thinking
          </span>
          <span className="ai-think-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="ai-bubble-shine" aria-hidden />
      </div>
    </motion.div>
  );
}

function ChatBubble({
  msg,
  avatar,
  index,
}: {
  msg: Msg;
  avatar: string;
  index: number;
}) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, x: isUser ? -24 : 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 28,
        delay: Math.min(index * 0.03, 0.2),
      }}
      className={`ai-msg-row ${isUser ? "ai-msg-row--user" : "ai-msg-row--assistant"}`}
    >
      {!isUser && (
        // eslint-disable-next-line @next/next/no-img-element
        <motion.img
          src={avatar}
          alt=""
          className="ai-avatar"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
        />
      )}

      <div className={`ai-bubble ${isUser ? "ai-bubble--user" : "ai-bubble--assistant"}`}>
        <span className="ai-bubble-glow" aria-hidden />
        <span className="ai-bubble-particles" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </span>
        <p className="relative z-[1] whitespace-pre-wrap">{msg.content}</p>
        <div className="ai-bubble-shine" aria-hidden />
      </div>

      {isUser && (
        <motion.div
          className="ai-user-mark"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.05 }}
          aria-hidden
        >
          You
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AIAssistant({ content }: { content: SiteContent }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const first = content.fullName.split(" ")[0] || content.fullName;

  useEffect(() => {
    fetch("/api/ai")
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.aiEnabled !== false);
        setReady(Boolean(data.hasKey));
        const welcome =
          data.aiWelcome ||
          `Hi — I'm ${content.fullName}'s AI assistant. Ask about projects, skills, or how to hire ${first}.`;
        setMessages([{ id: msgId(), role: "assistant", content: welcome }]);
      })
      .catch(() => {
        setMessages([
          {
            id: msgId(),
            role: "assistant",
            content: `Hi — I'm ${content.fullName}'s AI assistant.`,
          },
        ]);
      });
  }, [content.fullName, first]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Msg = { id: msgId(), role: "user", content: text };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextHistory.slice(0, -1).map(({ role, content: c }) => ({
            role,
            content: c,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: msgId(),
            role: "assistant",
            content: data.error || "Sorry — I couldn't reply right now.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: msgId(), role: "assistant", content: data.reply },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: msgId(),
          role: "assistant",
          content: "Network error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) return null;

  return (
    <>
      <motion.button
        type="button"
        className="ai-fab"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        data-cursor="hover"
        aria-label="Open AI assistant"
      >
        <span className="ai-fab-ring" aria-hidden />
        <span className="ai-fab-ring ai-fab-ring--2" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.about.image}
          alt={content.fullName}
          className="h-11 w-11 rounded-full object-cover ring-2 ring-teal-300/60"
        />
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-[0.18em] text-teal-300/90">
            AI Assistant
          </p>
          <p className="text-sm font-semibold">{first}</p>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 18, scale: 0.97, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="ai-panel"
          >
            <div className="ai-panel-bg" aria-hidden>
              <span className="ai-panel-orb ai-panel-orb--a" />
              <span className="ai-panel-orb ai-panel-orb--b" />
              <span className="ai-panel-grid" />
            </div>

            <div className="relative z-[1] flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={content.about.image}
                  alt={content.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#070b12] ${
                    ready ? "bg-teal-400 shadow-[0_0_10px_#2dd4bf]" : "bg-amber-400"
                  }`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{content.fullName}</p>
                <p className="text-xs text-teal-300/90">
                  {loading
                    ? "Thinking…"
                    : ready
                      ? "Online · ready to chat"
                      : "Needs API key in Admin"}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="relative z-[1] flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-4">
              <AnimatePresence mode="popLayout">
                {messages.map((m, i) => (
                  <ChatBubble
                    key={m.id}
                    msg={m}
                    avatar={content.about.image}
                    index={i}
                  />
                ))}
              </AnimatePresence>

              <AnimatePresence>{loading && <ThinkingBubble name={first} />}</AnimatePresence>
              <div ref={endRef} />
            </div>

            <form
              onSubmit={send}
              className="relative z-[1] border-t border-white/10 bg-black/20 p-3 backdrop-blur-md"
            >
              <div className="ai-composer">
                <input
                  className="ai-composer-input"
                  placeholder={`Message ${first}…`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <motion.button
                  type="submit"
                  className="ai-composer-send"
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Send
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
