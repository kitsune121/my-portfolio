"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Trail = { key: string; x: number; y: number };
type Spark = { key: string; x: number; y: number; dx: number; dy: number };

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [enabled, setEnabled] = useState(false);
  const seq = useRef(0);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const enable = window.setTimeout(() => {
      setEnabled(true);
      document.body.classList.add("has-custom-cursor");
    }, 0);

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      seq.current += 1;
      const key = `t-${seq.current}`;
      setTrails((prev) => [...prev.slice(-14), { key, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setTrails((prev) => prev.filter((t) => t.key !== key));
      }, 380);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        "a, button, input, textarea, select, label, [data-cursor='hover']"
      );
      ringRef.current?.classList.toggle("is-hover", Boolean(interactive));
    };

    const onClick = (e: MouseEvent) => {
      seq.current += 1;
      const base = seq.current;
      const burst: Spark[] = Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return {
          key: `s-${base}-${i}`,
          x: e.clientX,
          y: e.clientY,
          dx: Math.cos(angle) * (18 + Math.random() * 16),
          dy: Math.sin(angle) * (18 + Math.random() * 16),
        };
      });
      setSparks((prev) => [...prev, ...burst]);
      window.setTimeout(() => {
        const keys = new Set(burst.map((b) => b.key));
        setSparks((prev) => prev.filter((s) => !keys.has(s.key)));
      }, 480);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onClick);

    let raf = 0;
    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.18;
      ring.current.y += (pos.current.y - ring.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.clearTimeout(enable);
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onClick);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      {trails.map((t, i) => (
        <span
          key={t.key}
          className="cursor-trail"
          style={{
            left: t.x,
            top: t.y,
            marginLeft: -3.5,
            marginTop: -3.5,
            opacity: (i + 1) / Math.max(trails.length, 1),
            transform: `scale(${0.3 + (i / Math.max(trails.length, 1))})`,
          }}
        />
      ))}
      {sparks.map((s) => (
        <span
          key={s.key}
          className="cursor-spark"
          style={
            {
              left: s.x,
              top: s.y,
              "--dx": `${s.dx}px`,
              "--dy": `${s.dy}px`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}
