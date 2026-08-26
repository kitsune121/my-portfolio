"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
};

type Listener = (items: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
let idCounter = 0;

function emit() {
  const snapshot = [...toasts];
  listeners.forEach((fn) => fn(snapshot));
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(message: string, type: ToastType = "info") {
  const id = `toast-${++idCounter}-${Date.now()}`;
  toasts = [...toasts, { id, message, type }];
  emit();
  window.setTimeout(() => dismiss(id), 4000);
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

const ACCENT = {
  success: "border-teal-300/35 text-teal-100",
  error: "border-rose-400/40 text-rose-100",
  info: "border-sky-300/35 text-sky-100",
} as const;

const ICON_COLOR = {
  success: "text-teal-300",
  error: "text-rose-300",
  info: "text-sky-300",
} as const;

export function StatusToastHost() {
  const [items, setItems] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    listeners.add(setItems);
    setItems([...toasts]);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-4 top-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const Icon = ICONS[item.type];
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -24, y: -6 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -16, y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-[#0a1220]/95 px-3.5 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.45),0_0_24px_rgba(56,189,248,0.06)] backdrop-blur-md ${ACCENT[item.type]}`}
              role="status"
            >
              <Icon
                size={18}
                className={`mt-0.5 shrink-0 ${ICON_COLOR[item.type]}`}
                aria-hidden
              />
              <p className="text-sm leading-snug text-[var(--fg,#e8eef7)]">{item.message}</p>
              <button
                type="button"
                aria-label="Dismiss"
                className="ml-auto shrink-0 text-[var(--muted)] transition hover:text-white"
                onClick={() => dismiss(item.id)}
              >
                ×
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
