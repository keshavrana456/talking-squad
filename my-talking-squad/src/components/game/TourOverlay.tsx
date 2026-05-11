import { useEffect, useState, useCallback } from "react";

const STEPS = [
  {
    selector: '[data-tour="head"]',
    title: "Tap the Head",
    desc: "Smack the parrot to make it dizzy! Tap rapidly to build a combo multiplier — x2, x3, and beyond!",
    shape: "circle" as const,
    pad: 18,
  },
  {
    selector: '[data-tour="wing"]',
    title: "Tap the Wings",
    desc: "Touch either wing and the parrot flaps with a satisfying wing-flap sound.",
    shape: "circle" as const,
    pad: 14,
  },
  {
    selector: '[data-tour="stomach"]',
    title: "Poke the Belly",
    desc: "Poke the parrot's stomach — it freezes up and reacts with a shocked sound!",
    shape: "circle" as const,
    pad: 14,
  },
  {
    selector: '[data-tour="feet"]',
    title: "Tickle the Feet",
    desc: "Tap the claws for a unique tickle reaction complete with its own sound effect.",
    shape: "rect" as const,
    pad: 10,
  },
  {
    selector: '[data-tour="feed"]',
    title: "Feed Button",
    desc: "Watch the parrot enjoy a delicious meal — triggers a fun full-screen feeding video!",
    shape: "rect" as const,
    pad: 10,
  },
  {
    selector: '[data-tour="party"]',
    title: "Party Button",
    desc: "It's party time! Plays a celebration video. The parrot loves to party.",
    shape: "rect" as const,
    pad: 10,
  },
  {
    selector: '[data-tour="mic"]',
    title: "Parrot Voice",
    desc: "Tap, speak into your mic, then tap stop. The parrot repeats your words in a squawky parrot voice!",
    shape: "circle" as const,
    pad: 16,
  },
  {
    selector: '[data-tour="undress"]',
    title: "Undress (18+)",
    desc: "Age-gated content for adults only. Confirm you're 18+ to unlock this feature.",
    shape: "rect" as const,
    pad: 10,
  },
  {
    selector: '[data-tour="sleep"]',
    title: "Sleep Mode",
    desc: "Put the parrot to sleep with peaceful snoring sounds and Zzz bubbles. Tap Wake Up to revive it!",
    shape: "rect" as const,
    pad: 10,
  },
  {
    selector: '[data-tour="gay-mode"]',
    title: "Secret Mode",
    desc: "A mysterious toggle that completely transforms the parrot's look and sounds. Discover it yourself!",
    shape: "rect" as const,
    pad: 10,
  },
  {
    selector: '[data-tour="game"]',
    title: "Play the Game",
    desc: "Opens 10K Squad Contra — a full action game in your browser. Have fun!",
    shape: "rect" as const,
    pad: 10,
  },
];

interface Rect { x: number; y: number; w: number; h: number; }

export default function TourOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep]     = useState(0);
  const [rect, setRect]     = useState<Rect | null>(null);
  const [visible, setVisible] = useState(false);

  const current = STEPS[step];
  const total   = STEPS.length;
  const isLast  = step === total - 1;

  const measureStep = useCallback((s: number) => {
    const el = document.querySelector(STEPS[s].selector);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ x: r.left, y: r.top, w: r.width, h: r.height });
    setVisible(true);
  }, []);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => measureStep(step), 120);
    return () => clearTimeout(t);
  }, [step, measureStep]);

  useEffect(() => {
    const onResize = () => measureStep(step);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [step, measureStep]);

  const finish = () => {
    localStorage.setItem("mts-tour-done", "1");
    onDone();
  };
  const handleNext = () => { if (isLast) finish(); else setStep(s => s + 1); };
  const handleSkip = () => finish();

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = current.pad;

  // Spotlight geometry
  let cx = vw / 2, cy = vh / 2;
  let sr = 60;
  let rx = cx - 60, ry = cy - 60, rw = 120, rh = 120;

  if (rect) {
    cx = rect.x + rect.w / 2;
    cy = rect.y + rect.h / 2;
    rx = rect.x - pad;
    ry = rect.y - pad;
    rw = rect.w + pad * 2;
    rh = rect.h + pad * 2;
    sr = Math.max(rw, rh) / 2;
  }

  // Tooltip positioning — prefer below, fall back to above
  const TW = 280, TH = 190;
  let tx = cx - TW / 2;
  let ty = current.shape === "circle" ? cy + sr + 16 : ry + rh + 16;
  if (ty + TH > vh - 16) ty = (current.shape === "circle" ? cy - sr : ry) - TH - 16;
  if (ty < 10) ty = 10;
  tx = Math.max(12, Math.min(vw - TW - 12, tx));

  return (
    <>
      {/* Backdrop click-through area (also advances step on tap outside tooltip) */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9980, pointerEvents: "all" }}
        onClick={handleNext}
      />

      {/* SVG spotlight mask */}
      <svg
        style={{
          position: "fixed", inset: 0, width: "100%", height: "100%",
          zIndex: 9985, pointerEvents: "none",
          opacity: visible ? 1 : 0, transition: "opacity 0.25s ease",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="mts-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {current.shape === "circle"
              ? <circle cx={cx} cy={cy} r={sr} fill="black" />
              : <rect x={rx} y={ry} width={rw} height={rh} rx={12} fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.80)" mask="url(#mts-tour-mask)" />
      </svg>

      {/* Glowing highlight ring */}
      {visible && (
        current.shape === "circle" ? (
          <div style={{
            position: "fixed",
            left: cx - sr - 3, top: cy - sr - 3,
            width: (sr + 3) * 2, height: (sr + 3) * 2,
            borderRadius: "50%",
            border: "2.5px solid rgba(255,105,180,0.95)",
            boxShadow: "0 0 0 4px rgba(255,105,180,0.18), 0 0 28px rgba(255,105,180,0.55)",
            zIndex: 9986, pointerEvents: "none",
            animation: "tourRingPulse 1.6s ease-in-out infinite",
          }} />
        ) : (
          <div style={{
            position: "fixed",
            left: rx - 3, top: ry - 3,
            width: rw + 6, height: rh + 6,
            borderRadius: 15,
            border: "2.5px solid rgba(255,105,180,0.95)",
            boxShadow: "0 0 0 4px rgba(255,105,180,0.18), 0 0 28px rgba(255,105,180,0.55)",
            zIndex: 9986, pointerEvents: "none",
            animation: "tourRingPulse 1.6s ease-in-out infinite",
          }} />
        )
      )}

      {/* Tooltip card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          left: tx, top: ty,
          width: TW,
          zIndex: 9992,
          background: "linear-gradient(145deg,#0f0f2e,#1a0533)",
          border: "1px solid rgba(255,105,180,0.4)",
          borderRadius: 18,
          padding: "16px 18px 14px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,105,180,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
          pointerEvents: "all",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        {/* Header row: step label + progress dots */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(255,105,180,0.75)",
          }}>
            {step + 1} of {total}
          </span>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                height: 5,
                width: i === step ? 18 : 5,
                borderRadius: 3,
                background: i < step
                  ? "rgba(255,105,180,0.6)"
                  : i === step
                    ? "#ff69b4"
                    : "rgba(255,255,255,0.15)",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>

        {/* Feature icon + title */}
        <h3 style={{
          color: "white", fontWeight: 800, fontSize: 15,
          margin: "0 0 5px", letterSpacing: "0.01em",
        }}>
          {current.title}
        </h3>

        {/* Description */}
        <p style={{
          color: "rgba(255,255,255,0.6)", fontSize: 12.5,
          margin: "0 0 14px", lineHeight: 1.55,
        }}>
          {current.desc}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSkip}
            style={{
              flex: "0 0 auto", padding: "9px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.5)",
              fontWeight: 600, fontSize: 12.5, cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            style={{
              flex: 1, padding: "9px 0",
              borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#ff0080,#7700ff)",
              color: "white", fontWeight: 700, fontSize: 13,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(255,0,128,0.35)",
              transition: "transform 0.1s, box-shadow 0.15s",
            }}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isLast ? "Done! 🦜" : "Next →"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tourRingPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(255,105,180,0.18), 0 0 28px rgba(255,105,180,0.55); }
          50%       { box-shadow: 0 0 0 7px rgba(255,105,180,0.08), 0 0 44px rgba(255,105,180,0.75); }
        }
      `}</style>
    </>
  );
}
