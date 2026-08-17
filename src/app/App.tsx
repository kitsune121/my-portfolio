import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Github, Linkedin, Twitter, Youtube, Mail, MessageCircle, Send, Hash, Gamepad2, ArrowRight, Download,
  ExternalLink, Brain, Layers, Smartphone, Wrench, GraduationCap, Search, X, ChevronLeft, ChevronRight as ChevronRightIcon,
  Briefcase, Globe2, MessageSquare, Zap, Code2, ChevronRight,
} from "lucide-react";

function CountUp({ value }: { value: string }) {
    const [display, setDisplay] = useState(0);
    const target = parseInt(value.replace(/\\D/g, ""), 10);
    useEffect(() => {
      let current = 0;
      const timer = setInterval(() => {
        current += Math.max(1, Math.ceil(target / 40));
        if (current >= target) { current = target; clearInterval(timer); }
      setDisplay(current);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <>{display}{value.includes("%") ? "%" : "+"}</>;
}


/* ─── Global styles & keyframes ─────────────────────────────── */
function GlobalStyles() {
  return (
    <style>{`
      *, *::before, *::after { cursor: none !important; }
      html { scroll-behavior: smooth; }

      @keyframes float-particle {
        0%,100% { transform: translateY(0) translateX(0); opacity: 0.3; }
        33%      { transform: translateY(-35px) translateX(12px); opacity: 0.9; }
        66%      { transform: translateY(-18px) translateX(-10px); opacity: 0.5; }
      }
      @keyframes pulse-glow {
        0%,100% { opacity: 0.55; transform: scale(1); }
        50%      { opacity: 1;    transform: scale(1.06); }
      }
      @keyframes shimmer {
        0%   { background-position: -300% center; }
        100% { background-position: 300% center; }
      }
      @keyframes spin-dot {
        from { transform: rotate(0deg) translateX(182px) rotate(0deg); }
        to   { transform: rotate(360deg) translateX(182px) rotate(-360deg); }
      }
      @keyframes spin-dot2 {
        from { transform: rotate(180deg) translateX(208px) rotate(-180deg); }
        to   { transform: rotate(-180deg) translateX(208px) rotate(180deg); }
      }
      @keyframes orbit-ring {
        from { transform: rotateX(74deg) rotateZ(0deg); }
        to   { transform: rotateX(74deg) rotateZ(360deg); }
      }
      @keyframes orbit-ring2 {
        from { transform: rotateX(80deg) rotateZ(40deg); }
        to   { transform: rotateX(80deg) rotateZ(400deg); }
      }
      @keyframes orbit-ring3 {
        from { transform: rotateX(86deg) rotateZ(-15deg); }
        to   { transform: rotateX(86deg) rotateZ(345deg); }
      }

      .shimmer-text {
        background: linear-gradient(90deg, #a855f7, #818cf8, #06b6d4, #818cf8, #a855f7);
        background-size: 300% 100%;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shimmer 4s linear infinite;
      }
      .card-lift {
        transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
      }
      .card-lift:hover {
        transform: translateY(-5px);
        border-color: rgba(139,92,246,0.45) !important;
        box-shadow: 0 20px 60px rgba(139,92,246,0.18), 0 0 0 1px rgba(139,92,246,0.1) !important;
      }
      .btn-glow { transition: box-shadow 0.25s ease, transform 0.2s ease; }
      .btn-glow:hover {
        box-shadow: 0 0 35px rgba(168,85,247,0.65), 0 0 70px rgba(168,85,247,0.3) !important;
        transform: translateY(-1px);
      }
      .nav-link { transition: color 0.2s ease; }
      .nav-link:hover { color: #a855f7; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.45); border-radius: 2px; }
    `}</style>
  );
}

/* ─── Custom cursor ──────────────────────────────────────────── */
function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos   = useRef({ x: -200, y: -200 });
  const ring  = useRef({ x: -200, y: -200 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    let raf: number;
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const el = e.target as HTMLElement;
      setHover(!!el.closest("a,button,[data-hover]"));
    };
    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (dotRef.current)
        dotRef.current.style.transform =
          `translate(${pos.current.x}px,${pos.current.y}px) translate(-50%,-50%)`;
      if (ringRef.current)
        ringRef.current.style.transform =
          `translate(${ring.current.x}px,${ring.current.y}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          width:  hover ? 13 : 9,
          height: hover ? 13 : 9,
          background: "#a855f7",
          boxShadow: hover
            ? "0 0 18px rgba(168,85,247,1), 0 0 36px rgba(168,85,247,0.6)"
            : "0 0 10px rgba(168,85,247,0.8)",
          transition: "width .2s, height .2s, box-shadow .2s",
        }} />
      <div ref={ringRef} className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
        style={{
          width:  hover ? 54 : 40,
          height: hover ? 54 : 40,
          border: `1.5px solid rgba(168,85,247,${hover ? 0.8 : 0.5})`,
          boxShadow: hover
            ? "0 0 28px rgba(168,85,247,0.35), inset 0 0 14px rgba(168,85,247,0.1)"
            : "0 0 12px rgba(168,85,247,0.2)",
          background: hover ? "rgba(168,85,247,0.04)" : "transparent",
          transition: "width .3s, height .3s, border-color .3s, box-shadow .3s, background .3s",
        }} />
    </>
  );
}

/* ─── Particle field ─────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 75 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.6,
  dur: Math.random() * 22 + 14,
  delay: -(Math.random() * 22),
  rgb: i % 4 === 0 ? "168,85,247" : i % 4 === 1 ? "99,102,241" : i % 4 === 2 ? "6,182,212" : "255,255,255",
  op: Math.random() * 0.45 + 0.1,
}));

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <div key={p.id} className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: `rgba(${p.rgb},${p.op})`,
            boxShadow: p.size > 1.6 ? `0 0 ${p.size * 4}px rgba(${p.rgb},0.6)` : "none",
            animation: `float-particle ${p.dur}s ${p.delay}s ease-in-out infinite`,
          }} />
      ))}
    </div>
  );
}

/* ─── Logo icon ──────────────────────────────────────────────── */
function LogoIcon() {
  return (
    <svg width="32" height="26" viewBox="0 0 32 26" fill="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <path d="M16 13 C12 8 6 3 2 5 C-1 7 1 15 6 17 C10 18 14 15 16 13Z" fill="url(#lg)" />
      <path d="M16 13 C20 8 26 3 30 5 C33 7 31 15 26 17 C22 18 18 15 16 13Z" fill="url(#lg)" />
      <path d="M16 9 L13 26 M16 9 L19 26" stroke="url(#lg)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="6" r="3" fill="url(#lg)" />
    </svg>
  );
}

/* ─── Animated globe ─────────────────────────────────────────── */
function AnimatedGlobe() {
  return (
    <div style={{ position: "relative", width: 400, height: 400 }}>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: "-35%",
        background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)",
        filter: "blur(35px)",
        animation: "pulse-glow 4s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "10%", right: "5%", width: "50%", height: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
        filter: "blur(25px)",
        animation: "pulse-glow 6s 1s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      {/* 3D orbit ring container */}
      <div style={{ position: "absolute", inset: 0, perspective: "650px", perspectiveOrigin: "50% 50%" }}>

        {/* Ring 1 */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 364, height: 364,
          marginTop: -182, marginLeft: -182,
          borderRadius: "50%",
          border: "1.5px solid rgba(139,92,246,0.55)",
          boxShadow: "0 0 22px rgba(139,92,246,0.3), inset 0 0 18px rgba(139,92,246,0.08)",
          animation: "orbit-ring 9s linear infinite",
        }}>
          {/* Traveling dot */}
          <div style={{
            position: "absolute", top: "50%", right: -6,
            width: 12, height: 12, marginTop: -6,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #f0e6ff, #a855f7)",
            boxShadow: "0 0 14px #a855f7, 0 0 28px #7c3aed, 0 0 50px rgba(168,85,247,0.4)",
          }} />
        </div>

        {/* Ring 2 */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 416, height: 416,
          marginTop: -208, marginLeft: -208,
          borderRadius: "50%",
          border: "1px solid rgba(99,102,241,0.32)",
          boxShadow: "0 0 14px rgba(99,102,241,0.18)",
          animation: "orbit-ring2 15s linear infinite reverse",
        }}>
          <div style={{
            position: "absolute", top: -5, left: "28%",
            width: 8, height: 8,
            borderRadius: "50%",
            background: "#6366f1",
            boxShadow: "0 0 12px #6366f1, 0 0 24px rgba(99,102,241,0.5)",
          }} />
        </div>

        {/* Ring 3 – faint outer */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 454, height: 454,
          marginTop: -227, marginLeft: -227,
          borderRadius: "50%",
          border: "0.5px solid rgba(6,182,212,0.18)",
          animation: "orbit-ring3 23s linear infinite",
        }} />
      </div>

      {/* Sphere */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 272, height: 272,
        marginTop: -136, marginLeft: -136,
        borderRadius: "50%",
        background: `radial-gradient(circle at 37% 30%,
          rgba(220,190,255,0.95) 0%,
          rgba(139,92,246,0.88) 18%,
          rgba(99,102,241,0.76) 38%,
          rgba(59,130,246,0.52) 62%,
          rgba(8,4,35,0.98) 100%)`,
        boxShadow: `
          0 0 70px rgba(139,92,246,0.65),
          0 0 140px rgba(99,102,241,0.32),
          0 0 220px rgba(59,130,246,0.16),
          inset 0 0 90px rgba(0,0,40,0.72)`,
        overflow: "hidden",
        zIndex: 5,
      }}>
        {/* Grid lines */}
        <svg viewBox="0 0 272 272" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <defs><clipPath id="sclip"><circle cx="136" cy="136" r="136" /></clipPath></defs>
          <g clipPath="url(#sclip)" opacity="0.27">
            {/* Latitude ellipses */}
            {([
              [136, 255, 68, 17],
              [136, 204, 118, 30],
              [136, 136, 136, 34],
              [136, 68,  118, 30],
              [136, 17,  68, 17],
            ] as number[][]).map(([cx, cy, rx, ry], i) => (
              <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
                fill="none" stroke="rgba(225,210,255,0.9)" strokeWidth="0.8" />
            ))}
            {/* Longitude ellipses */}
            {[68, 118].map((rx, i) => (
              <ellipse key={i} cx="136" cy="136" rx={rx} ry="136"
                fill="none" stroke="rgba(225,210,255,0.9)" strokeWidth="0.8" />
            ))}
            <line x1="136" y1="0" x2="136" y2="272"
              stroke="rgba(225,210,255,0.9)" strokeWidth="0.8" />
          </g>
        </svg>

        {/* Gloss highlight */}
        <div style={{
          position: "absolute", top: "8%", left: "9%",
          width: "42%", height: "38%",
          background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(14px)",
        }} />
      </div>

      {/* 2026 label */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        color: "white", fontSize: 22, fontWeight: 800,
        letterSpacing: 6, fontFamily: "Outfit, sans-serif",
        textShadow: "0 0 22px rgba(139,92,246,1), 0 0 45px rgba(139,92,246,0.6), 0 0 90px rgba(99,102,241,0.4)",
        zIndex: 10, pointerEvents: "none",
      }}>
        2026
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────── */
function SectionLabel({ text }: { text: string }) {
  return (
    <span className="text-xs font-mono font-semibold tracking-[0.2em]"
      style={{ color: "#06b6d4" }}>
      // {text}
    </span>
  );
}

type PillColor = "purple" | "cyan" | "blue" | "green" | "orange";
const PILL_STYLES: Record<PillColor, { bg: string; border: string; text: string }> = {
  purple: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.32)", text: "#c4b5fd" },
  cyan:   { bg: "rgba(6,182,212,0.12)",  border: "rgba(6,182,212,0.32)",  text: "#67e8f9" },
  blue:   { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.32)", text: "#93c5fd" },
  green:  { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.32)", text: "#6ee7b7" },
  orange: { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.32)", text: "#fdba74" },
};
function Pill({ children, color = "purple" }: { children: React.ReactNode; color?: PillColor }) {
  const s = PILL_STYLES[color];
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      {children}
    </span>
  );
}

/* ─── Navbar ─────────────────────────────────────────────────── */
const NAV = ["About", "Skills", "Projects", "Education", "Experience", "Services", "Contact"];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(5,5,20,0.88)" : "rgba(5,5,20,0.35)",
        backdropFilter: "blur(18px)",
        borderBottom: scrolled ? "1px solid rgba(139,92,246,0.13)" : "1px solid transparent",
      }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => go("About")}
          data-hover
          className="flex items-center gap-2.5"
          style={{ background: "none", border: "none" }}>
          <LogoIcon />
          <span className="font-bold text-sm text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
            Yuki Nakamura
          </span>
        </button>

        {/* Links (desktop) */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV.map((l) => (
            <button key={l} onClick={() => go(l)}
              className="nav-link text-sm font-medium text-gray-300"
              style={{ background: "none", border: "none" }}>
              {l}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button onClick={() => go("Contact")} data-hover
          className="hidden lg:flex btn-glow items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 0 22px rgba(168,85,247,0.35)" }}>
          Let&apos;s Talk <ArrowRight size={14} />
        </button>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden text-gray-300 flex flex-col gap-1.5"
          style={{ background: "none", border: "none", width: 24 }}>
          <span className={`block h-0.5 w-full bg-current transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-full bg-current transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-full bg-current transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="lg:hidden px-6 pb-5 flex flex-col gap-3"
          style={{ background: "rgba(5,5,20,0.96)" }}>
          {NAV.map((l) => (
            <button key={l} onClick={() => go(l)}
              className="text-gray-300 text-sm font-medium py-2 text-left hover:text-purple-400 transition-colors"
              style={{ background: "none", border: "none" }}>
              {l}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */
function Hero() {
  return (
    <section id="about" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">

      {/* Bg blobs */}
      {[
        { t: "22%", l: "8%",  size: "38vw", c: "rgba(139,92,246,0.1)" },
        { t: "35%", r: "6%",  size: "32vw", c: "rgba(59,130,246,0.07)" },
        { t: "65%", l: "30%", size: "42vw", c: "rgba(99,102,241,0.06)" },
      ].map((b, i) => (
        <div key={i} className="absolute pointer-events-none"
          style={{
            top: b.t, left: b.l, right: (b as any).r,
            width: b.size, height: b.size,
            background: `radial-gradient(circle, ${b.c} 0%, transparent 70%)`,
            filter: "blur(70px)",
          }} />
      ))}

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px_1fr] gap-6 items-center py-14">

          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }} className="flex flex-col gap-6">

            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-[.18em]"
              style={{ color: "#a855f7" }}>
              <span>CODE</span>
              <span style={{ color: "#6366f1" }}>✦</span>
              <span>BUILD</span>
              <span style={{ color: "#6366f1" }}>✦</span>
              <span>IMPACT</span>
            </div>

            <div>
              <h1 className="text-5xl xl:text-[3.6rem] font-black leading-tight text-white"
                style={{ fontFamily: "Outfit, sans-serif" }}>
                Yuki{" "}
                <span className="shimmer-text">Nakamura</span>
              </h1>
              <p className="mt-3 text-[1.05rem] font-semibold"
                style={{ color: "#818cf8", fontFamily: "Outfit, sans-serif" }}>
                AI-Powered Full-Stack &amp; Mobile Developer
              </p>
            </div>

            <p className="text-sm leading-relaxed text-gray-400 max-w-[420px]">
              I craft modern, responsive and user-friendly digital experiences
              with clean code and cutting-edge technologies.
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { label: "AI & LLM",       icon: "🤖" },
                { label: "Full-Stack",     icon: "🔧" },
                { label: "Mobile",         icon: "📱" },
                { label: "Problem Solver", icon: "⚡" },
              ].map((t) => (
                <span key={t.label} data-hover
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-200 transition-all hover:text-purple-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "border-color .2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.5)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}>
                  <span>{t.icon}</span>{t.label}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button data-hover className="btn-glow flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 0 26px rgba(168,85,247,0.4)" }}
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}>
                View My Work <ArrowRight size={15} />
              </button>
              <a href="/Yuki_Nakamura_Resume.pdf" download data-hover
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-gray-200 transition-all hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.45)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}>
                <Download size={15} /> Download CV
              </a>
            </div>
          </motion.div>

          {/* Center: Globe */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.15 }}
            className="flex items-center justify-center">
            <AnimatedGlobe />
          </motion.div>

          {/* Right: side cards */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col gap-4 lg:items-end">

            {/* Mini stat card */}
            <div className="p-4 rounded-2xl text-right max-w-[220px]"
              style={{
                background: "rgba(13,10,30,0.72)",
                border: "1px solid rgba(139,92,246,0.2)",
                backdropFilter: "blur(12px)",
              }}>
              <p className="text-[10px] font-mono tracking-widest text-gray-500">A NEW CHAPTER</p>
              <p className="text-[10px] font-mono tracking-widest mt-0.5" style={{ color: "#a855f7" }}>SAME PASSION</p>
              <div className="mt-3 flex justify-end">
                <svg viewBox="0 0 44 22" width="44" height="22">
                  {[0,5,10,15,20,25,30,35,40].map((x, i) => {
                    const h = [7,13,9,16,11,18,12,20,14][i];
                    return <rect key={x} x={x} y={22-h} width="4" height={h}
                      fill={`rgba(168,85,247,${0.35+i*0.07})`} rx="1.5" />;
                  })}
                </svg>
              </div>
            </div>

            {/* CTA card */}
            <div data-hover
              className="p-5 rounded-2xl max-w-[248px] cursor-pointer transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.16), rgba(99,102,241,0.08))",
                border: "1px solid rgba(139,92,246,0.28)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 0 35px rgba(139,92,246,0.12)",
              }}
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
              <p className="text-white text-[1.15rem] font-bold leading-snug"
                style={{ fontFamily: "Outfit, sans-serif" }}>
                Let&apos;s build the{" "}
                <span className="shimmer-text">future</span>{" "}
                together.
              </p>
              <div className="mt-4 flex justify-end">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}>
                  <ArrowRight size={15} color="white" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats row */}
      <div className="w-full" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(5,5,20,0.55)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { icon: <Code2 size={22} />, value: "7+",   label: "Years Experience" },
              { icon: <Layers size={22} />, value: "50+", label: "Projects Completed" },
              { icon: "👥",                value: "30+",  label: "Happy Clients" },
              { icon: "💜",                value: "100%", label: "Commitment" },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.1 }}
                className="flex items-center gap-4 py-5 px-6 border-r last:border-r-0"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#6366f1" }}>
                <div>{typeof s.icon === "string" ? <span className="text-xl">{s.icon}</span> : s.icon}</div>
                <div>
                  <p className="text-2xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>{<CountUp value={s.value} />}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Skills ─────────────────────────────────────────────────── */
const SKILLS = [
  {
    icon: <Brain size={22} />, color: "#a855f7", bg: "rgba(168,85,247,0.1)",
    title: "AI & Machine Learning", sub: "LLMs, RAG, Computer Vision, NLP",
    pills: ["OpenAI","LangChain","HuggingFace","Face","PyTorch","TensorFlow"],
    pc: "purple" as PillColor,
  },
  {
    icon: <Layers size={22} />, color: "#06b6d4", bg: "rgba(6,182,212,0.1)",
    title: "Full-Stack Development", sub: "Modern web apps, scalable systems",
    pills: ["React","Next.js","Node.js","Express","MongoDB","PostgreSQL"],
    pc: "cyan" as PillColor,
  },
  {
    icon: <Smartphone size={22} />, color: "#6366f1", bg: "rgba(99,102,241,0.1)",
    title: "Mobile Development", sub: "Cross-platform & native apps",
    pills: ["React Native","Flutter","Swift","Kotlin","Expo"],
    pc: "blue" as PillColor,
  },
  {
    icon: <Wrench size={22} />, color: "#818cf8", bg: "rgba(129,140,248,0.1)",
    title: "Tools & Others", sub: "DevOps, Testing, Design, Etc.",
    pills: ["Git","Docker","AWS","Firebase","Figma","VS Code"],
    pc: "purple" as PillColor,
  },
];

function Skills() {
  return (
    <section id="skills" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel text="MY EXPERTISE" />
            <h2 className="text-3xl font-black text-white mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              Skills &amp; Technologies
            </h2>
            <p className="text-sm text-gray-400 mt-1">Tools I use to turn ideas into reality.</p>
          </div>
          <a href="#" data-hover className="hidden md:flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors">
            View All Skills <ChevronRight size={13} />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {SKILLS.map((sk, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              data-hover className="card-lift p-5 rounded-2xl"
              style={{
                background: "rgba(11,9,28,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
              }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: sk.bg, color: sk.color }}>
                {sk.icon}
              </div>
              <div className="flex items-start justify-between mb-0.5">
                <h3 className="text-sm font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>{sk.title}</h3>
                <ExternalLink size={12} className="text-gray-600 mt-0.5 shrink-0" />
              </div>
              <p className="text-xs text-gray-500 mb-4">{sk.sub}</p>
              <div className="flex flex-wrap gap-1.5">
                {sk.pills.map((p) => <Pill key={p} color={sk.pc}>{p}</Pill>)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Project thumbnail ──────────────────────────────────────── */
type ThumbType = "ai" | "crypto" | "ecommerce" | "portfolio";

function ProjectThumb({ type }: { type: ThumbType }) {
  return (
    <div className="w-full h-40 rounded-xl overflow-hidden relative"
      style={{
        background: {
          ai:        "linear-gradient(135deg,#0d0d2b 0%,#1a0533 55%,#0d0d2b 100%)",
          crypto:    "linear-gradient(135deg,#021018 0%,#031a14 55%,#020e1a 100%)",
          ecommerce: "linear-gradient(135deg,#0a0f1e 0%,#0c1a30 55%,#0a0f1e 100%)",
          portfolio: "linear-gradient(135deg,#0f0a1e 0%,#1a0f2e 55%,#0f0a1e 100%)",
        }[type],
      }}>

      {/* Accent glow */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse at 30% 40%, ${{
          ai: "rgba(168,85,247,0.18)",
          crypto: "rgba(16,185,129,0.18)",
          ecommerce: "rgba(6,182,212,0.18)",
          portfolio: "rgba(139,92,246,0.18)",
        }[type]} 0%, transparent 65%)`,
      }} />

      {/* SVG mock UI */}
      <svg viewBox="0 0 300 160" className="absolute inset-0 w-full h-full">
        {type === "ai" && (<>
          <rect x="20" y="28" width="175" height="26" rx="6" fill="rgba(139,92,246,0.22)" />
          <rect x="20" y="64" width="135" height="18" rx="6" fill="rgba(99,102,241,0.16)" />
          <rect x="20" y="92" width="195" height="18" rx="6" fill="rgba(139,92,246,0.2)" />
          <rect x="20" y="120" width="115" height="14" rx="6" fill="rgba(99,102,241,0.13)" />
          <rect x="158" y="48" width="118" height="18" rx="6" fill="rgba(168,85,247,0.3)" />
          <circle cx="268" cy="28" r="11" fill="rgba(168,85,247,0.45)" />
          <text x="26" y="46" fill="rgba(255,255,255,0.65)" fontSize="9.5" fontFamily="Inter,sans-serif">Build smarter with AI</text>
          <circle cx="42" cy="140" r="5" fill="rgba(168,85,247,0.7)" />
          <circle cx="56" cy="140" r="5" fill="rgba(99,102,241,0.5)" />
          <circle cx="70" cy="140" r="5" fill="rgba(59,130,246,0.4)" />
        </>)}
        {type === "crypto" && (<>
          <polyline points="18,118 55,98 95,108 132,68 170,78 210,48 248,58 282,38"
            fill="none" stroke="#10b981" strokeWidth="2" />
          <polyline points="18,118 55,98 95,108 132,68 170,78 210,48 248,58 282,38 282,160 18,160"
            fill="rgba(16,185,129,0.07)" />
          <rect x="18" y="14" width="118" height="38" rx="6" fill="rgba(16,185,129,0.15)" />
          <text x="28" y="31" fill="rgba(255,255,255,0.45)" fontSize="7.5">Balance</text>
          <text x="28" y="46" fill="rgba(16,185,129,0.9)" fontSize="13" fontWeight="bold">$12,480</text>
          <circle cx="210" cy="48" r="4.5" fill="#10b981" opacity="0.9" />
          <circle cx="132" cy="68" r="3.5" fill="#10b981" opacity="0.7" />
          <rect x="148" y="14" width="52" height="38" rx="6" fill="rgba(6,182,212,0.12)" />
          <rect x="210" y="14" width="72" height="38" rx="6" fill="rgba(16,185,129,0.1)" />
        </>)}
        {type === "ecommerce" && (
            <image
              href={portfolioImage}
              x="18"
              y="14"
              width="262"
              height="122"
              rx="7"
              preserveAspectRatio="xMidYMid slice"
            />
        )}
        {type === "portfolio" && (<>
          <rect x="18" y="14" width="82" height="122" rx="7" fill="rgba(139,92,246,0.12)" />
          <rect x="112" y="14" width="168" height="56" rx="7" fill="rgba(99,102,241,0.12)" />
          <rect x="112" y="80" width="80" height="56" rx="7" fill="rgba(139,92,246,0.1)" />
          <rect x="202" y="80" width="78" height="56" rx="7" fill="rgba(167,139,250,0.1)" />
          <polyline points="122,60 143,44 163,50 183,34 204,42 224,27 252,34 270,24"
            fill="none" stroke="rgba(139,92,246,0.75)" strokeWidth="1.8" />
          {[0,1,2,3].map((i) => (<rect key={i} x={30+i*16} y={80+(i%2===0?22:12)} width="11"
            height={i%2===0?34:44} rx="2.5" fill={`rgba(139,92,246,${0.3+i*0.1})`} />))}
        </>)}
      </svg>

      {/* Bottom fade */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(5,5,20,0.82) 0%, transparent 52%)" }} />
    </div>
  );
}

/* ─── Projects ───────────────────────────────────────────────── */
const PROJECTS = [
  { image: "ai-chat-assistant.png", tag: "AI", tagBg: "rgba(168,85,247,0.85)", title: "AI Chat Assistant", desc: "RAG-based AI assistant with document search and real-time web data.", pills: ["Next.js","OpenAI","LangChain"], pc: "purple" as PillColor },
  { image: "crypto-wallet.png", tag: "Mobile", tagBg: "rgba(16,185,129,0.85)", title: "Crypto Wallet App", desc: "Secure and intuitive crypto wallet with real-time market data.", pills: ["React Native","Expo","TypeScript"], pc: "green" as PillColor },
  { image: "ecommerce-platform.png", tag: "Full-stack", tagBg: "rgba(6,182,212,0.85)", title: "E-commerce Platform", desc: "Modern e-commerce with cart, payments and admin dashboard.", pills: ["Next.js","Node.js","MongoDB"], pc: "cyan" as PillColor },
  { image: "portfolio-preview.png", tag: "Full-stack", tagBg: "rgba(99,102,241,0.85)", title: "Portfolio Website", desc: "Personal portfolio with dynamic content, animations and CMS.", pills: ["React","Tailwind CSS","Framer Motion"], pc: "blue" as PillColor },
];

function Projects() {
  const [preview, setPreview] = useState<number | null>(null);
  const open = (i:number)=>setPreview(i);
  const close = ()=>setPreview(null);
  const move=(d:number)=>setPreview(v=>v===null?null:(v+d+PROJECTS.length)%PROJECTS.length);
  return (<section id="projects" className="py-24 relative">
    <div className="max-w-7xl mx-auto px-6">
      <SectionLabel text="FEATURED WORK" />
      <h2 className="text-3xl font-black text-white mt-2" style={{fontFamily:"Outfit, sans-serif"}}>Selected Projects</h2>
      <p className="text-sm text-gray-400 mt-1 mb-10">A few projects that showcase my skills and passion.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {PROJECTS.map((p,i)=>(<motion.div key={i} className="card-lift p-4 rounded-2xl" data-hover style={{background:"rgba(9,7,24,0.85)",border:"1px solid rgba(255,255,255,0.07)"}}>
        <div className="relative mb-4 h-[220px] rounded-xl overflow-hidden bg-black group cursor-pointer" onClick={()=>open(i)}>
          <img src={`/projects/${p.image}`} className="w-full h-full object-contain"/>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><Search size={34} className="text-white"/></div>
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{background:p.tagBg}}>● {p.tag}</span>
        </div>
        <h3 className="text-sm font-bold text-white">{p.title}</h3><p className="text-xs text-gray-400 mb-3 leading-relaxed">{p.desc}</p>
        <div className="flex flex-wrap gap-1.5 items-center">{p.pills.map(x=><Pill key={x} color={p.pc}>{x}</Pill>)}<a href={p.url || "#"} target="_blank" rel="noreferrer" className="ml-auto w-8 h-8 rounded-full border border-purple-500/40 flex items-center justify-center text-purple-400 hover:bg-purple-500 hover:text-white transition"><ExternalLink size={15}/></a></div>
      </motion.div>))}
      </div>
    </div>
    {preview!==null && <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur flex items-center justify-center p-6" onClick={close}>
      <button className="absolute top-6 right-6 text-white" onClick={close}><X size={32}/></button>
      <button className="absolute left-6 text-white" onClick={(e)=>{e.stopPropagation();move(-1)}}><ChevronLeft size={45}/></button>
      <img onClick={e=>e.stopPropagation()} src={`/projects/${PROJECTS[preview].image}`} className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"/>
      <button className="absolute right-6 text-white" onClick={(e)=>{e.stopPropagation();move(1)}}><ChevronRightIcon size={45}/></button>
    </div>}
  </section>);
}

/* ─── Education + Experience + Services ─────────────────────── */
function BottomSections() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Education */}
          <motion.div id="education"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-7">
              <GraduationCap size={18} style={{ color: "#a855f7" }} />
              <h2 className="text-xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>Education</h2>
            </div>
            <div className="flex flex-col gap-5">
              {[
                { deg: "Bachelor of Computer Science", school: "Tokyo Institute of Technology", period: "2019 – 2023", dot: "#a855f7" },
                { deg: "High School Diploma",           school: "Akashi Municipal High School",  period: "2016 – 2019", dot: "#6366f1" },
                { deg: "Online Certifications",         school: "AWS · Google Cloud · Coursera", period: "2020 – 2025", dot: "#06b6d4" },
              ].map((e, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: e.dot }} />
                    {i < arr.length - 1 &&
                      <div className="w-px flex-1 min-h-[16px]" style={{ background: "rgba(255,255,255,0.08)" }} />}
                  </div>
                  <div className="flex-1 flex justify-between gap-2 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{e.deg}</p>
                      <p className="text-xs text-gray-400">{e.school}</p>
                    </div>
                    <span className="text-xs font-mono shrink-0" style={{ color: "#6366f1" }}>{e.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div id="experience"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-7">
              <Briefcase size={18} style={{ color: "#06b6d4" }} />
              <h2 className="text-xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>Experience</h2>
            </div>
            <div className="flex flex-col gap-4">
              {[
                {
                  title: "Senior Full-Stack Developer", company: "TechCorp Inc.",
                  period: "2023 – Present",
                  bullets: ["Lead development of web and mobile applications", "Collaborate with cross-functional teams", "Improve system performance and scalability"],
                },
                {
                  title: "Junior Developer", company: "Digital Studio Japan",
                  period: "2021 – 2023",
                  bullets: ["Built responsive websites and web apps", "Worked with modern frontend and backend technologies"],
                },
              ].map((exp, i) => (
                <div key={i} className="p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:bg-purple-500/5 hover:border-purple-500/40 hover:shadow-xl"
                  style={{ background: "rgba(11,9,28,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{exp.title}</p>
                      <p className="text-xs font-medium" style={{ color: "#06b6d4" }}>{exp.company}</p>
                    </div>
                    <span className="text-xs font-mono shrink-0" style={{ color: "#6366f1" }}>{exp.period}</span>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="text-xs text-gray-400 flex gap-1.5">
                        <span style={{ color: "#a855f7" }}>•</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Services */}
          <motion.div id="services"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-7">
              <Zap size={18} style={{ color: "#818cf8" }} />
              <h2 className="text-xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>Services</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Globe2 size={19} />,       title: "Web Development", desc: "Modern, fast & scalable web applications",         color: "#06b6d4" },
                { icon: <Smartphone size={19} />,   title: "Mobile Apps",     desc: "Cross-platform & native mobile applications",     color: "#a855f7" },
                { icon: <Brain size={19} />,         title: "AI Solutions",    desc: "LLM, RAG, automation and intelligent systems",    color: "#10b981" },
                { icon: <MessageSquare size={19} />, title: "Consulting",      desc: "Technical strategy and best practices",           color: "#f59e0b" },
              ].map((svc, i) => (
                <div key={i} data-hover className="card-lift p-4 rounded-xl"
                  style={{ background: "rgba(11,9,28,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ color: svc.color }} className="mb-2">{svc.icon}</div>
                  <p className="text-xs font-bold text-white mb-1">{svc.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{svc.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────── */
function CTA() {
  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(76,29,149,0.22) 0%, rgba(49,46,129,0.12) 50%, transparent 100%)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="rounded-3xl px-8 md:px-12 py-14 flex flex-col md:flex-row items-center justify-between gap-8"
          style={{
            background: "rgba(11,9,28,0.65)",
            border: "1px solid rgba(139,92,246,0.18)",
            backdropFilter: "blur(22px)",
            boxShadow: "0 0 80px rgba(139,92,246,0.08)",
          }}>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2"
              style={{ fontFamily: "Outfit, sans-serif" }}>
              Let&apos;s Build Something{" "}
              <span className="shimmer-text">Amazing</span> Together
            </h2>
            <p className="text-sm text-gray-400">Have a project in mind? I&apos;d love to hear about it.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a href="mailto:nyuki6589@gmail.com" data-hover
              className="btn-glow flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 0 26px rgba(168,85,247,0.4)" }}>
              Get in Touch <ArrowRight size={15} />
            </a>
            <a href="mailto:nyuki6589@gmail.com" data-hover
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-gray-300 transition-all hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(168,85,247,0.45)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}>
              <Mail size={15} /> Email Me
            </a>
          </div>
        </motion.div>

        {/* Social */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {[
            { icon: <Github size={18} />,   href: "https://github.com/yukinakamura1221", label: "GitHub" },
            { icon: <Linkedin size={18} />, href: "#",                                   label: "LinkedIn" },
            { icon: <MessageCircle size={18} />, href: "https://wa.me/", label: "WhatsApp", color: "#25D366" },
            { icon: <Gamepad2 size={18} />, href: "https://discord.com/", label: "Discord", color: "#5865F2" },
            { icon: <Mail size={18} />,     href: "mailto:nyuki6589@gmail.com",          label: "Email" },
          ].map((s) => (
            <a key={s.label} href={s.href} data-hover aria-label={s.label} onMouseEnter={(e)=>e.currentTarget.style.color=s.color || "#fff"} onMouseLeave={(e)=>e.currentTarget.style.color="#94a3b8"}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all hover:scale-110"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="py-6 text-xs text-gray-500"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Yuki Nakamura. All rights reserved.</p>
        <p>Designed &amp; Built with ❤️ and clean code</p>
      </div>
    </footer>
  );
}

/* ─── App root ───────────────────────────────────────────────── */
export default function App() {
  return (
    <div className="min-h-screen relative" style={{ background: "#050514", fontFamily: "Inter, sans-serif" }}>
      <GlobalStyles />
      <CustomCursor />
      <Particles />

      {/* Fixed ambient bg lights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[
          { top: "8%",  left: "4%",   size: "38vw", c: "rgba(139,92,246,0.06)" },
          { top: "28%", right: "4%",  size: "34vw", c: "rgba(59,130,246,0.05)" },
          { top: "62%", left: "22%",  size: "44vw", c: "rgba(99,102,241,0.045)" },
          { top: "80%", right: "12%", size: "30vw", c: "rgba(139,92,246,0.04)" },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute", top: b.top, left: (b as any).left, right: (b as any).right,
            width: b.size, height: b.size,
            background: `radial-gradient(circle, ${b.c} 0%, transparent 70%)`,
            filter: "blur(80px)",
          }} />
        ))}
      </div>

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Skills />
        <Projects />
        <BottomSections />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
