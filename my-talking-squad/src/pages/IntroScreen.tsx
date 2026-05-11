import { useEffect, useState } from "react";
import eggImg    from "@assets/egg_1777927306618.png";
import introLogo from "@assets/my_talking_squad_png_for_intro_1777927306621.png";
import introBg   from "@assets/intro_bg_1777927306619.png";
import bodyImg   from "@assets/body_1777927306605.png";

interface IntroScreenProps { onComplete: () => void; }

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase,    setPhase]    = useState<"logo" | "egg" | "crack" | "hatch">("logo");
  const [tapCount, setTapCount] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase("egg"), 2000);
    return () => clearTimeout(t);
  }, []);

  function handleEggTap() {
    if (phase !== "egg" && phase !== "crack") return;
    const next = tapCount + 1;
    setTapCount(next);
    setPhase("crack");
    setShakeKey(k => k + 1);
    if (next >= 5) {
      setPhase("hatch");
      setTimeout(onComplete, 1400);
    }
  }

  // Shake intensity grows with each tap
  const shakeIntensity = Math.min(tapCount, 5);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg,#1a0533 0%,#2d0a5e 50%,#1a0533 100%)" }}
    >
      <img src={introBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />

      {/* LOGO phase */}
      {phase === "logo" && (
        <div className="flex flex-col items-center animate-pulse z-10">
          <img src={introLogo} alt="My Talking Squad" className="w-72 md:w-96 drop-shadow-2xl" />
          <p className="text-white/60 mt-6 text-sm tracking-widest animate-bounce">Loading...</p>
        </div>
      )}

      {/* EGG / CRACK phase */}
      {(phase === "egg" || phase === "crack") && (
        <div className="flex flex-col items-center z-10 gap-4 py-4">
          <img src={introLogo} alt="My Talking Squad" className="w-44 md:w-60 drop-shadow-2xl" />
          <p className="text-white/90 text-lg font-bold tracking-wide">TAP THE EGG!</p>

          <div className="relative cursor-pointer select-none" onClick={handleEggTap}>
            {/* shake wrapper — new key on each tap restarts the animation */}
            <div
              key={shakeKey}
              style={{
                animation: shakeKey > 0 ? `eggShake${shakeIntensity} 0.4s cubic-bezier(.36,.07,.19,.97) forwards` : "none",
                transformOrigin: "center bottom",
                display: "inline-block",
              }}
            >
              <img
                src={eggImg}
                alt="Egg"
                className="w-48 md:w-60 drop-shadow-2xl"
                style={{
                  filter: `brightness(${1 + tapCount * 0.06}) drop-shadow(0 0 ${tapCount * 5}px rgba(255,120,120,0.55))`,
                  transform: `scale(${1 + tapCount * 0.012})`,
                  transition: "transform 0.1s, filter 0.15s",
                }}
              />
            </div>

            {/* Glow burst */}
            {tapCount > 0 && (
              <div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,200,200,${tapCount * 0.06}) 0%, transparent 70%)` }} />
            )}
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 -mt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-colors duration-200"
                style={{ background: i < tapCount ? "#ff69b4" : "rgba(255,255,255,0.2)", boxShadow: i < tapCount ? "0 0 5px #ff69b4" : "none" }} />
            ))}
          </div>
        </div>
      )}

      {/* HATCH phase */}
      {phase === "hatch" && (
        <div className="z-10 flex flex-col items-center gap-4">
          <img src={introLogo} alt="My Talking Squad" className="w-44 md:w-60 drop-shadow-2xl" />
          <img
            src={bodyImg}
            alt="Bird hatching"
            className="w-44 md:w-56 drop-shadow-2xl"
            style={{ animation: "hatchPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
          />
          <p className="text-white text-xl font-bold" style={{ animation: "fadeIn 0.3s ease forwards" }}>HATCHING!</p>
        </div>
      )}

      <style>{`
        @keyframes hatchPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(5deg);  opacity: 1; }
          100% { transform: scale(1)    rotate(0deg);  opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        /* Shake animations of increasing intensity */
        @keyframes eggShake1 {
          0%,100% { transform: rotate(0deg) translateX(0); }
          20%     { transform: rotate(-4deg) translateX(-3px); }
          40%     { transform: rotate(4deg)  translateX(3px); }
          60%     { transform: rotate(-3deg) translateX(-2px); }
          80%     { transform: rotate(3deg)  translateX(2px); }
        }
        @keyframes eggShake2 {
          0%,100% { transform: rotate(0deg) translateX(0); }
          20%     { transform: rotate(-6deg) translateX(-5px); }
          40%     { transform: rotate(6deg)  translateX(5px); }
          60%     { transform: rotate(-5deg) translateX(-4px); }
          80%     { transform: rotate(5deg)  translateX(3px); }
        }
        @keyframes eggShake3 {
          0%,100% { transform: rotate(0deg) translateX(0); }
          15%     { transform: rotate(-8deg) translateX(-6px) translateY(-2px); }
          30%     { transform: rotate(8deg)  translateX(6px)  translateY(1px); }
          50%     { transform: rotate(-7deg) translateX(-5px) translateY(-2px); }
          70%     { transform: rotate(7deg)  translateX(5px)  translateY(1px); }
          85%     { transform: rotate(-4deg) translateX(-3px); }
        }
        @keyframes eggShake4 {
          0%,100% { transform: rotate(0deg) translateX(0); }
          10%     { transform: rotate(-10deg) translateX(-8px) translateY(-3px); }
          25%     { transform: rotate(10deg)  translateX(8px)  translateY(2px); }
          40%     { transform: rotate(-9deg)  translateX(-7px) translateY(-3px); }
          55%     { transform: rotate(9deg)   translateX(7px)  translateY(2px); }
          70%     { transform: rotate(-6deg)  translateX(-5px); }
          85%     { transform: rotate(5deg)   translateX(4px); }
        }
        @keyframes eggShake5 {
          0%,100% { transform: rotate(0deg) translateX(0); }
          10%     { transform: rotate(-14deg) translateX(-10px) translateY(-4px); }
          22%     { transform: rotate(14deg)  translateX(10px)  translateY(3px); }
          34%     { transform: rotate(-12deg) translateX(-9px)  translateY(-4px); }
          46%     { transform: rotate(12deg)  translateX(9px)   translateY(3px); }
          58%     { transform: rotate(-10deg) translateX(-7px); }
          70%     { transform: rotate(8deg)   translateX(6px); }
          82%     { transform: rotate(-5deg)  translateX(-3px); }
        }
      `}</style>
    </div>
  );
}
