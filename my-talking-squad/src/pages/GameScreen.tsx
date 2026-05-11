import { useState, useEffect, useRef, useCallback } from "react";
import { Utensils, PartyPopper, Shirt, Moon, Sun, Gamepad2, Gem, Mic, Square, HelpCircle, Target, Zap, Wind, Circle, Footprints, Play, Sparkles, Cloud, Lock } from "lucide-react";

// Normal bird images
import bodyImg        from "@assets/body_1777927306605.png";
import blinkImg       from "@assets/blink_1777927306604.png";
import listeningImg   from "@assets/default(listening)_1777927306606.png";
import dizzyImg       from "@assets/dizzy_1777927306607.png";
import stopImg        from "@assets/stop_1777927371542.png";
import wingsImg       from "@assets/wings_1777927371544.png";
import mouthOpenImg   from "@assets/Picsart_26-05-05_06-14-46-957_1777942070618.png";
import mainBodyImg    from "@assets/MAIN_BODY_1777927306620.png";
import feetImg        from "@assets/feet_1778417649609.png";

// Gay mode bird images
import gayBodyImg     from "@assets/gay_main_body_1777938920145.png";
import gayBlinkImg    from "@assets/gay_blink_1777938919899.png";
import gayListenImg   from "@assets/gay_listening_1777938919915.png";
import gayDizzyImg    from "@assets/gay_dizzy_1777938919900.png";
import gayStomachImg  from "@assets/gay_stomach_1777938920146.png";
import gayWingsImg    from "@assets/gay_wings_1777938920147.png";
import gaySpeakImg    from "@assets/gay_talking_or_speaking_1777938920146.png";
import gayFeetImg     from "@assets/gay_feet_1778417649610.png";

// Videos & audio
import feedVideo    from "@assets/feed_1777927279095.mp4";
import partyVideo   from "@assets/party_1777927279096.mp4";
import dizzySound   from "@assets/dizzy_1777940586740.mpeg";
import sleepSound   from "@assets/sleep_1778417649610.mpeg";
import stomachSound from "@assets/stomach_1777927264194.mpeg";
import wingsSound   from "@assets/wings_1778417649611.mpeg";
import feetSound    from "@assets/feet_GDpj6ptR_1778463048613.mp3";

import UndressModal from "@/components/game/UndressModal";
import TourOverlay  from "@/components/game/TourOverlay";

type BirdState  = "idle"|"listening"|"speaking"|"dizzy"|"stomach"|"wings"|"blink"|"sleep"|"feet";
type RecordState = "idle"|"recording"|"speaking";
type Weather    = "sunny"|"monsoon"|"rainbow"|"spring"|"sunset"|"sunrise";

const WEATHER_CYCLE: Weather[] = ["sunny","monsoon","spring","sunset","sunrise"];

const RAINDROPS = Array.from({ length: 90 }, (_, i) => ({
  id: i, x: (i * 1.13) % 100, dur: 0.45 + (i * 0.028) % 0.55, delay: (i * 0.083) % 1.5,
}));
const PETALS = Array.from({ length: 32 }, (_, i) => ({
  id: i, x: (i * 3.7) % 100, dur: 3 + (i * 0.4) % 3, delay: (i * 0.22) % 4, rot: (i * 47) % 360,
}));
const STARS = [0,60,120,180,240,300];

function getSupportedMimeType() {
  const types = ["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/ogg","audio/mp4"];
  for (const t of types) { if (MediaRecorder.isTypeSupported(t)) return t; }
  return "";
}

export default function GameScreen() {
  const [birdState,   setBirdState]   = useState<BirdState>("idle");
  const [recState,    setRecState]    = useState<RecordState>("idle");
  const [isSleeping,  setIsSleeping]  = useState(false);
  const [zzzs,        setZzzs]        = useState(false);
  const [activeVideo, setActiveVideo] = useState<string|null>(null);
  const [showUndress, setShowUndress] = useState(false);
  const [showGayModal,setShowGayModal] = useState(false);
  const [isGayMode,   setIsGayMode]   = useState(false);
  const [speakFrame,  setSpeakFrame]  = useState(false);
  const [weatherIdx,  setWeatherIdx]  = useState(0);
  const [lightning,   setLightning]   = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [showPeppa,   setShowPeppa]   = useState(false);
  const [showSmack,   setShowSmack]   = useState(false);
  const [showGuide,   setShowGuide]   = useState(false);
  const [showTour,    setShowTour]    = useState(() => !localStorage.getItem("mts-tour-done"));
  const [comboCount,  setComboCount]  = useState(0);
  const [showCombo,   setShowCombo]   = useState(false);

  const weather = WEATHER_CYCLE[weatherIdx];

  const mediaRecorderRef = useRef<MediaRecorder|null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const speakIntervalRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const stateTimeoutRef  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const recordTimerRef   = useRef<ReturnType<typeof setTimeout>|null>(null);
  const currentAudioRef  = useRef<HTMLAudioElement|null>(null);
  const isSleepingRef    = useRef(false);
  const birdStateRef     = useRef<BirdState>("idle");
  const recStateRef      = useRef<RecordState>("idle");
  const lastHeadTapRef   = useRef<number>(0);
  const comboTimeoutRef  = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => { isSleepingRef.current = isSleeping; }, [isSleeping]);
  useEffect(() => { birdStateRef.current  = birdState;  }, [birdState]);
  useEffect(() => { recStateRef.current   = recState;   }, [recState]);

  // Weather cycle every 20s
  useEffect(() => {
    const id = setInterval(() => setWeatherIdx(i => (i+1) % WEATHER_CYCLE.length), 20_000);
    return () => clearInterval(id);
  }, []);

  // Lightning during monsoon
  useEffect(() => {
    if (weather !== "monsoon") { setLightning(false); return; }
    const flash = () => { setLightning(true); setTimeout(() => setLightning(false), 130); };
    flash();
    const id = setInterval(() => flash(), 3500 + Math.random() * 4000);
    return () => { clearInterval(id); setLightning(false); };
  }, [weather]);

  // Blink
  useEffect(() => {
    blinkIntervalRef.current = setInterval(() => {
      if (birdStateRef.current === "idle" && !isSleepingRef.current) {
        setBirdState("blink");
        setTimeout(() => setBirdState(s => s === "blink" ? "idle" : s), 180);
      }
    }, 2500);
    return () => { if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current); };
  }, []);

  // ── BIRD IMAGE: base layer (never the mouth-open frame — that's the overlay) ──
  function getBirdBaseImage(): string {
    if (isSleeping) return isGayMode ? gayBlinkImg : blinkImg;
    if (isGayMode) {
      switch (birdState) {
        case "dizzy":    return gayDizzyImg;
        case "stomach":  return gayStomachImg;
        case "wings":    return gayWingsImg;
        case "feet":     return gayFeetImg;
        case "blink":    return gayBlinkImg;
        case "listening":return gayListenImg;
        case "speaking": return gayBodyImg;
        default: return gayBodyImg;
      }
    }
    switch (birdState) {
      case "dizzy":    return dizzyImg;
      case "stomach":  return stopImg;
      case "wings":    return wingsImg;
      case "feet":     return feetImg;
      case "blink":    return blinkImg;
      case "listening":return listeningImg;
      case "speaking": return mainBodyImg;
      default: return bodyImg;
    }
  }

  function stopCurrentAudio() {
    if (currentAudioRef.current) {
      currentAudioRef.current.onended = null;
      currentAudioRef.current.onerror = null;
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  }
  function clearFx() {
    if (stateTimeoutRef.current)  clearTimeout(stateTimeoutRef.current);
    if (speakIntervalRef.current) clearInterval(speakIntervalRef.current);
  }

  // ── RECORDING ──
  const startRecording = useCallback(async () => {
    if (recStateRef.current !== "idle") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecState("recording"); recStateRef.current = "recording";
      setBirdState("listening");

      const mime = getSupportedMimeType();
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
        if (blob.size < 300) { setBirdState("idle"); setRecState("idle"); recStateRef.current = "idle"; return; }
        setRecState("speaking"); recStateRef.current = "speaking";
        playbackWithPitch(blob);
      };
      mr.start(250);
      if (recordTimerRef.current) clearTimeout(recordTimerRef.current);
      recordTimerRef.current = setTimeout(() => stopRecording(), 10_000);
    } catch { setBirdState("idle"); }
  }, []);

  function stopRecording() {
    if (recordTimerRef.current) clearTimeout(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    setRecState("idle"); recStateRef.current = "idle";
  }

  // ── PLAYBACK: squawky parrot voice via Web Audio API pitch shift ──
  function playbackWithPitch(blob: Blob) {
    setBirdState("speaking");
    clearFx();

    if (speakIntervalRef.current) clearInterval(speakIntervalRef.current);
    speakIntervalRef.current = setInterval(() => {
      setSpeakFrame(prev => !prev);
    }, 120);

    const url = URL.createObjectURL(blob);

    function done() {
      if (speakIntervalRef.current) { clearInterval(speakIntervalRef.current); speakIntervalRef.current = null; }
      setSpeakFrame(false);
      setBirdState("idle");
      setRecState("idle"); recStateRef.current = "idle";
      URL.revokeObjectURL(url);
      currentAudioRef.current = null;
    }

    // Use Web Audio API to pitch-shift the parrot voice higher
    fetch(url)
      .then(r => r.arrayBuffer())
      .then(arrayBuf => {
        const ctx = new AudioContext();
        return ctx.decodeAudioData(arrayBuf).then(decoded => ({ ctx, decoded }));
      })
      .then(({ ctx, decoded }) => {
        // Resample to a higher pitch by playing at 1.65x speed without preserving pitch
        // This gives a classic chipmunk/parrot squawk effect
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.playbackRate.value = 1.65;

        // Add a slight bandpass boost to make it more squawky/nasal
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = "peaking";
        bandpass.frequency.value = 2800;
        bandpass.gain.value = 7;
        bandpass.Q.value = 1.2;

        source.connect(bandpass);
        bandpass.connect(ctx.destination);
        source.start(0);

        source.onended = () => { ctx.close(); done(); };

        // Store a fake audio ref so stopCurrentAudio can interrupt if needed
        const fakeAudio = { pause: () => { try { source.stop(); ctx.close(); } catch {} }, onended: null, onerror: null } as any;
        currentAudioRef.current = fakeAudio;
      })
      .catch(() => done());
  }

  // ── INTERACTIONS ──
  function handleHeadClick() {
    if (isSleeping || activeVideo) return;
    clearFx(); stopCurrentAudio();

    // Combo tracking
    const now = Date.now();
    const newCombo = now - lastHeadTapRef.current < 700 ? comboCount + 1 : 1;
    lastHeadTapRef.current = now;
    setComboCount(newCombo);
    setShowCombo(true);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => { setShowCombo(false); setComboCount(0); }, 1100);

    // SMACK shows instantly, dizzy image appears after 1s delay
    setBirdState("idle");
    setShowSmack(true);
    setTimeout(() => setShowSmack(false), 400);
    const audio = new Audio(dizzySound);
    currentAudioRef.current = audio;
    audio.play().catch(() => {});
    stateTimeoutRef.current = setTimeout(() => {
      setBirdState("dizzy");
      audio.onended = () => setBirdState("idle");
      audio.onerror = () => setBirdState("idle");
    }, 1000);
  }

  function handleStomachClick() {
    if (isSleeping || activeVideo) return;
    clearFx(); stopCurrentAudio();
    setBirdState("stomach");
    const audio = new Audio(stomachSound);
    currentAudioRef.current = audio;
    audio.onended = () => setBirdState("idle");
    audio.onerror = () => setBirdState("idle");
    audio.play().catch(() => setBirdState("idle"));
    stateTimeoutRef.current = setTimeout(() => setBirdState("idle"), 5000);
  }

  function handleWingsClick() {
    if (isSleeping || activeVideo) return;
    clearFx(); stopCurrentAudio();
    // Sound plays instantly — wings image shows after 3.5–4s
    const audio = new Audio(wingsSound);
    currentAudioRef.current = audio;
    audio.play().catch(() => {});
    const imageDelay = 3500 + Math.random() * 500;
    stateTimeoutRef.current = setTimeout(() => {
      setBirdState("wings");
      setTimeout(() => setBirdState("idle"), 2000);
    }, imageDelay);
  }

  function handleFeetClick() {
    if (isSleeping || activeVideo) return;
    clearFx(); stopCurrentAudio();
    setBirdState("feet");
    const audio = new Audio(feetSound);
    currentAudioRef.current = audio;
    audio.onended = () => setBirdState("idle");
    audio.onerror = () => setBirdState("idle");
    audio.play().catch(() => setBirdState("idle"));
    stateTimeoutRef.current = setTimeout(() => setBirdState("idle"), 5000);
  }

  function handleFeed()    { if (!isSleeping && !activeVideo) setActiveVideo(feedVideo);  }
  function handleParty()   { if (!isSleeping && !activeVideo) setActiveVideo(partyVideo); }
  function handleUndress() { setShowAgeGate(true); }

  function handleSleep() {
    if (activeVideo) return;
    clearFx();
    const going = !isSleeping;
    setIsSleeping(going);
    if (going) {
      setBirdState("sleep"); setZzzs(true);
      stopCurrentAudio();
      const audio = new Audio(sleepSound);
      currentAudioRef.current = audio;
      audio.loop = true;
      audio.play().catch(() => {});
    } else {
      setBirdState("idle"); setZzzs(false);
      if (currentAudioRef.current) {
        currentAudioRef.current.loop = false;
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    }
  }

  // ── WEATHER VISUALS ──
  const bgMap: Record<Weather, string> = {
    sunny:   "linear-gradient(180deg,#29b6f6 0%,#4fc3f7 30%,#b3e5fc 70%,#e1f5fe 100%)",
    monsoon: "linear-gradient(180deg,#1a1a2e 0%,#2d2d44 45%,#3d3d55 100%)",
    rainbow: "linear-gradient(180deg,#b3e5fc 0%,#e1f5fe 45%,#f3e5f5 100%)",
    spring:  "linear-gradient(180deg,#a5d6a7 0%,#c8e6c9 35%,#f1f8e9 100%)",
    sunset:  "linear-gradient(180deg,#1a237e 0%,#880e4f 25%,#e65100 60%,#ff8f00 80%,#ffd54f 100%)",
    sunrise: "linear-gradient(180deg,#0d47a1 0%,#1565c0 20%,#e65100 55%,#ff8f00 75%,#fff9c4 100%)",
  };

  const isMonsoon = weather === "monsoon";
  const isRainbow = weather === "rainbow";
  const isSpring  = weather === "spring";
  const isSunset  = weather === "sunset";
  const isSunrise = weather === "sunrise";
  const isSunny   = weather === "sunny";
  const showSun   = !isMonsoon;

  const sunPos: Record<Weather,{top:number;left:number;size:number;c1:string;c2:string;rays:boolean}> = {
    sunny:   { top:14,  left:100, size:72, c1:"#fffde7", c2:"#FFD600", rays:true  },
    monsoon: { top:14,  left:100, size:60, c1:"#888",    c2:"#666",    rays:false },
    rainbow: { top:70,  left:130, size:58, c1:"#fffde7", c2:"#FFD600", rays:true  },
    spring:  { top:22,  left:115, size:66, c1:"#fffde7", c2:"#FFD600", rays:true  },
    sunset:  { top:260, left:55,  size:80, c1:"#FF6F00", c2:"#FF3D00", rays:false },
    sunrise: { top:200, left:80,  size:76, c1:"#FFD54F", c2:"#FF8F00", rays:false },
  };
  const sp = sunPos[weather];

  const LEFT_BTNS  = [
    { label:"Feed",  Icon:Utensils,    color:"#22c55e", action:handleFeed,  tourId:"feed"   },
    { label:"Party", Icon:PartyPopper, color:"#a855f7", action:handleParty, tourId:"party"  },
  ];
  const RIGHT_BTNS = [
    { label:"Undress",                      Icon:Shirt,              color:"#ec4899",                     action:handleUndress, tourId:"undress" },
    { label:isSleeping ? "Wake Up":"Sleep", Icon:isSleeping?Sun:Moon, color:isSleeping?"#facc15":"#6366f1", action:handleSleep,   tourId:"sleep"   },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden" style={{
      background: isSleeping ? "linear-gradient(180deg,#06071a 0%,#0d1240 50%,#06071a 100%)" : bgMap[weather],
      transition: "background 2s ease"
    }}>

      {/* Preload all bird images so state switches are instant — no decode lag */}
      <div aria-hidden="true" style={{ position:"absolute", opacity:0, pointerEvents:"none", width:1, height:1, overflow:"hidden" }}>
        {[bodyImg,blinkImg,listeningImg,dizzyImg,stopImg,wingsImg,mouthOpenImg,mainBodyImg,feetImg,
          gayBodyImg,gayBlinkImg,gayListenImg,gayDizzyImg,gayStomachImg,gayWingsImg,gaySpeakImg,gayFeetImg
        ].map((src,i) => <img key={i} src={src} alt="" decoding="async" fetchPriority="high" />)}
      </div>

      {/* Lightning flash */}
      {lightning && <div className="fixed inset-0 z-40 pointer-events-none" style={{ background:"rgba(220,240,255,0.42)" }} />}

      {/* ── SKY ELEMENTS ── */}
      {!isSleeping && (
        <>
          {/* Sun */}
          {showSun && (
            <div className="absolute rounded-full" style={{
              top:sp.top, left:sp.left, width:sp.size, height:sp.size,
              background:`radial-gradient(circle,${sp.c1} 20%,${sp.c2} 100%)`,
              boxShadow:`0 0 0 ${sp.size*0.18}px ${sp.c2}30, 0 0 ${sp.size}px ${sp.c2}90`,
              transition:"top 2s ease,left 2s ease,width 2s ease,height 2s ease",
              zIndex:1,
            }}>
              {sp.rays && [...Array(12)].map((_,i) => (
                <div key={i} className="absolute" style={{
                  top:"50%", left:"50%", width:4, height:34,
                  background:"linear-gradient(180deg,rgba(255,220,0,0.9) 0%,transparent 100%)",
                  borderRadius:4, transformOrigin:"50% 0%",
                  transform:`translate(-50%,-100%) rotate(${i*30}deg)`,
                  animation:"sunRay 3s ease-in-out infinite",
                  animationDelay:`${i*0.09}s`,
                }} />
              ))}
            </div>
          )}

          {/* SVG semicircle rainbow — left side, between clouds */}
          {isRainbow && (
            <svg
              className="absolute pointer-events-none"
              style={{ bottom:"14%", left:"1%", width:"min(420px,58vw)", zIndex:1 }}
              viewBox="0 0 640 330"
              preserveAspectRatio="xMidYMax meet"
            >
              {[
                { color:"#FF0000", r:310, w:18 },
                { color:"#FF7F00", r:286, w:17 },
                { color:"#FFFF00", r:263, w:17 },
                { color:"#00C800", r:240, w:16 },
                { color:"#0000FF", r:218, w:15 },
                { color:"#8B00FF", r:197, w:14 },
              ].map(({ color, r, w }) => (
                <path
                  key={color}
                  d={`M ${320 - r} 330 A ${r} ${r} 0 0 1 ${320 + r} 330`}
                  stroke={color}
                  strokeWidth={w}
                  fill="none"
                  opacity="0.52"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          )}

          {/* Spring petals */}
          {isSpring && PETALS.map(p => (
            <div key={p.id} className="absolute pointer-events-none" style={{
              left:`${p.x}%`, top:"-4%", width:10, height:10,
              borderRadius:"50% 0 50% 0",
              background:["#f9a8d4","#fbcfe8","#fce7f3","#fbb6ce","#f472b6"][p.id%5],
              animation:`petalFall ${p.dur}s ease-in infinite`,
              animationDelay:`${p.delay}s`,
              transform:`rotate(${p.rot}deg)`,
              zIndex:1,
            }} />
          ))}

          {/* Monsoon rain */}
          {isMonsoon && RAINDROPS.map(d => (
            <div key={d.id} className="absolute pointer-events-none" style={{
              left:`${d.x}%`, top:"-3%", width:2, height:20,
              borderRadius:2,
              background:"linear-gradient(180deg,rgba(160,200,255,0),rgba(160,200,255,0.9))",
              animation:`rainfall ${d.dur}s linear infinite`,
              animationDelay:`${d.delay}s`,
              zIndex:2,
            }} />
          ))}

          {/* Clouds */}
          {[
            {top:"5%",  left:"-10%",  delay:0,  dur:40, scale:1   },
            {top:"11%", left:"15%",   delay:12, dur:55, scale:0.8 },
            {top:"3%",  left:"45%",   delay:6,  dur:48, scale:1.2 },
            {top:"14%", left:"70%",   delay:24, dur:62, scale:0.7 },
            {top:"7%",  left:"-24%",  delay:35, dur:58, scale:0.9 },
          ].map((c,i) => (
            <div key={i} className="absolute" style={{ top:c.top, left:c.left, transform:`scale(${c.scale})`, animation:`moveCloud ${c.dur}s linear infinite`, animationDelay:`${c.delay}s`, zIndex:1 }}>
              <CloudShape stormy={isMonsoon} spring={isSpring} sunset={isSunset||isSunrise} />
            </div>
          ))}
        </>
      )}

      {/* Night sky */}
      {isSleeping && (
        <>
          <div className="absolute rounded-full" style={{ top:16, left:110, width:62, height:62, background:"radial-gradient(circle at 38% 35%,#e8e8f0,#8888b0)", boxShadow:"0 0 28px rgba(200,200,255,0.5)", zIndex:1 }} />
          {[...Array(30)].map((_,i) => (
            <div key={i} className="absolute rounded-full" style={{ width:i%4===0?3:2, height:i%4===0?3:2, background:"white", top:`${5+(i*37)%78}%`, left:`${(i*53)%100}%`, opacity:0.3+(i%3)*0.2, animation:`twinkle ${1.2+(i%5)*0.4}s ease-in-out infinite`, animationDelay:`${(i*0.3)%2}s`, zIndex:1 }} />
          ))}
        </>
      )}

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl px-2 py-1.5 text-sm" style={{ background:"rgba(0,0,0,0.38)", backdropFilter:"blur(8px)" }}>
            {{"sunny":"☀️","monsoon":"⛈️","rainbow":"🌈","spring":"🌸","sunset":"🌅","sunrise":"🌄"}[weather]}
          </div>
          <button onClick={() => setShowGuide(true)} className="rounded-xl px-2 py-1.5 flex items-center gap-1 transition-all hover:scale-110 active:scale-95" style={{ background:"rgba(0,0,0,0.38)", backdropFilter:"blur(8px)" }}>
            <HelpCircle size={15} className="text-white/80" />
            <span className="text-white/80 text-xs font-semibold">Guide</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button data-tour="game" onClick={() => window.open("https://10ksquad-contra.vercel.app/","_blank")} className="rounded-xl px-3 py-1.5 flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95" style={{ background:"rgba(0,0,0,0.38)", backdropFilter:"blur(8px)" }}>
            <Gamepad2 size={15} className="text-green-400" />
            <span className="text-white text-xs font-semibold">Game</span>
          </button>
          <button data-tour="gay-mode" onClick={() => setShowGayModal(true)} className="rounded-xl px-3 py-1.5 flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95"
            style={{ background:isGayMode?"linear-gradient(135deg,rgba(255,0,128,0.7),rgba(128,0,255,0.7))":"linear-gradient(135deg,rgba(255,0,128,0.42),rgba(128,0,255,0.38))", backdropFilter:"blur(8px)", border:"1px solid rgba(255,100,200,0.45)" }}>
            <Gem size={15} className="text-pink-300" />
            <span className="text-pink-100 text-xs font-bold">{isGayMode ? "👑 Gay Mode" : "Gay Mode"}</span>
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="relative z-10 flex items-center justify-between px-2 pt-14 pb-3" style={{ height:"calc(100dvh - 0px)", minHeight:0 }}>

        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {LEFT_BTNS.map(({label,Icon,color,action,tourId}) => (
            <ActionBtn key={label} label={label} Icon={Icon} color={color} onClick={action} tourId={tourId} />
          ))}
        </div>

        {/* BIRD + MIC */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div className="relative select-none" style={{
            width:"min(60vw,340px)", aspectRatio:"1/1",
            animation: (birdState === "idle" && !isSleeping) ? "birdFloat 3s ease-in-out infinite" : "none",
          }}>
            {/* Base layer — always visible */}
            <img src={getBirdBaseImage()} alt="Bird" className="absolute inset-0 w-full h-full object-contain" draggable={false}
              style={{ filter:isSleeping?"brightness(0.55) saturate(0.4)":"brightness(1)", transition:"filter 0.4s" }} />

            {/* Mouth-open overlay — pre-loaded, opacity flips instantly (no src swap = no flash) */}
            <img src={mouthOpenImg} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false}
              style={{ opacity: (!isGayMode && birdState === "speaking" && speakFrame) ? 1 : 0 }} />
            <img src={gaySpeakImg} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false}
              style={{ opacity: (isGayMode && birdState === "speaking" && speakFrame) ? 1 : 0 }} />

            {/* COMBO counter */}
            {showCombo && comboCount >= 2 && (
              <div className="absolute pointer-events-none" style={{
                top:"18%", left:"50%", transform:"translateX(-50%)",
                zIndex:30, whiteSpace:"nowrap",
                fontWeight:900, fontStyle:"italic",
                fontSize:"clamp(18px,4.5vw,28px)",
                color: comboCount >= 5 ? "#ff4400" : comboCount >= 3 ? "#ff8800" : "#FFD700",
                textShadow:"2px 2px 0 #fff, 3px 3px 0 rgba(0,0,0,0.3), -1px -1px 0 #fff",
                animation:"smackPop 0.25s cubic-bezier(0.17,0.67,0.35,1.4) forwards",
              }}>x{comboCount} SMACK!</div>
            )}

            {/* SMACK! impact effect on head tap */}
            {showSmack && (
              <div className="absolute pointer-events-none" style={{ top:"8%", left:"12%", width:"76%", height:"50%", zIndex:25, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {/* Flying stars burst outward */}
                {[0,45,90,135,180,225,270,315].map((a,i) => (
                  <div key={a} className="absolute" style={{
                    top:"50%", left:"50%",
                    fontSize: i%2===0 ? 18 : 14,
                    lineHeight:1,
                    transformOrigin:"center center",
                    animation:"starBurst 0.42s ease-out forwards",
                    animationDelay:`${i*0.018}s`,
                    ["--burst-x" as any]: `${Math.round(Math.cos(a*Math.PI/180)*52)}px`,
                    ["--burst-y" as any]: `${Math.round(Math.sin(a*Math.PI/180)*52)}px`,
                  }}>⭐</div>
                ))}
                {/* SMACK text */}
                <div style={{
                  position:"absolute",
                  fontSize:"clamp(22px,5.5vw,36px)",
                  fontWeight:900,
                  fontStyle:"italic",
                  color:"#FF3300",
                  textShadow:"2px 2px 0 #fff,4px 4px 0 rgba(0,0,0,0.25),-1px -1px 0 #fff",
                  letterSpacing:"-0.5px",
                  transform:"rotate(-14deg)",
                  animation:"smackPop 0.38s cubic-bezier(0.17,0.67,0.35,1.2) forwards",
                  whiteSpace:"nowrap",
                }}>SMACK!</div>
              </div>
            )}

            {/* Professional dizzy stars orbiting the head */}
            {birdState === "dizzy" && (
              <div className="absolute pointer-events-none" style={{
                top: "8%", left: "50%", transform: "translateX(-50%)",
                width: 0, height: 0, zIndex: 20,
              }}>
                {/* 3 stars orbiting at 120° apart — each wrapper rotates, star is offset by radius */}
                {[
                  { delay: 0,    size: 22, radius: 52, speed: "1.1s", glow: "gold" },
                  { delay: -0.37, size: 17, radius: 48, speed: "1.1s", glow: "#ffe066" },
                  { delay: -0.74, size: 14, radius: 54, speed: "1.1s", glow: "#ffd700" },
                ].map(({ delay, size, radius, speed, glow }, i) => (
                  <div key={i} style={{
                    position: "absolute",
                    width: 0, height: 0,
                    animation: `spin ${speed} linear infinite`,
                    animationDelay: `${delay}s`,
                  }}>
                    <div style={{
                      position: "absolute",
                      left: 0, top: -radius,
                      transform: "translate(-50%, -50%)",
                      fontSize: size,
                      lineHeight: 1,
                      filter: `drop-shadow(0 0 5px ${glow}) drop-shadow(0 0 10px ${glow})`,
                      animation: `starPulse ${0.55 + i * 0.1}s ease-in-out infinite`,
                      animationDelay: `${i * 0.18}s`,
                    }}>⭐</div>
                  </div>
                ))}
              </div>
            )}

            {/* Zzz floating sleep bubbles */}
            {zzzs && [0,1,2].map(i => (
              <div key={i} className="absolute pointer-events-none" style={{
                right:`${30-i*7}%`, top:`${10-i*10}%`,
                width:20+i*12, height:20+i*12,
                borderRadius:"50%",
                border:`3px solid rgba(180,190,255,${0.75-i*0.1})`,
                background:`rgba(150,165,255,${0.08+i*0.04})`,
                animation:`zzzBubble 2s ease-in-out infinite`,
                animationDelay:`${i*0.65}s`,
                zIndex:20,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <span style={{ fontStyle:"italic", fontWeight:900, fontSize:10+i*5, color:`rgba(200,210,255,${0.9-i*0.1})`, fontFamily:"serif" }}>
                  {"ZzZ"[i]}
                </span>
              </div>
            ))}

            {/* HITBOXES */}
            {/* Head */}
            <div data-tour="head" className="absolute cursor-pointer" onClick={handleHeadClick}
              style={{ top:"0%", left:"12%", width:"76%", height:"52%", borderRadius:"50%", zIndex:15 }} />
            {/* Left wing — wider to cover properly */}
            <div data-tour="wing" className="absolute cursor-pointer" onClick={handleWingsClick}
              style={{ top:"45%", left:"-2%", width:"38%", height:"38%", borderRadius:"50%", zIndex:15 }} />
            {/* Right wing */}
            <div className="absolute cursor-pointer" onClick={handleWingsClick}
              style={{ top:"48%", right:"3%", width:"26%", height:"28%", borderRadius:"50%", zIndex:15 }} />
            {/* Stomach — sits below wings, narrow enough */}
            <div data-tour="stomach" className="absolute cursor-pointer" onClick={handleStomachClick}
              style={{ top:"57%", left:"30%", width:"40%", height:"32%", borderRadius:"50%", zIndex:15 }} />
            {/* Feet — bottom strip covering both claws */}
            <div data-tour="feet" className="absolute cursor-pointer" onClick={handleFeetClick}
              style={{ bottom:"0%", left:"5%", width:"90%", height:"18%", borderRadius:"0 0 50% 50%", zIndex:15 }} />
          </div>

          {/* MIC below bird */}
          <div className="flex flex-col items-center gap-0.5 -mt-1">
            {recState === "recording" ? (
              <button data-tour="mic" onClick={stopRecording} className="rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ width:48, height:48, background:"linear-gradient(135deg,#ef4444,#dc2626)", boxShadow:"0 0 18px rgba(239,68,68,0.8),0 0 36px rgba(239,68,68,0.3)" }}>
                <Square size={18} className="text-white" fill="white" />
              </button>
            ) : (
              <button data-tour="mic" onClick={startRecording} disabled={recState === "speaking"}
                className="rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
                style={{ width:48, height:48, background:recState==="speaking"?"linear-gradient(135deg,#6366f1,#4f46e5)":"linear-gradient(135deg,#ff69b4,#ff1493)", boxShadow:recState==="speaking"?"0 0 16px rgba(99,102,241,0.5)":"0 0 16px rgba(255,105,180,0.7)" }}>
                <Mic size={20} className="text-white" />
              </button>
            )}
            <span className="text-white font-semibold" style={{ fontSize:"10px", textShadow:"0 1px 4px rgba(0,0,0,0.7)" }}>
              {recState==="recording" ? "● REC — tap to stop" : recState==="speaking" ? "Speaking…" : "Tap to talk"}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          {RIGHT_BTNS.map(({label,Icon,color,action,tourId}) => (
            <ActionBtn key={label} label={label} Icon={Icon} color={color} onClick={action} tourId={tourId} />
          ))}
        </div>
      </div>

      {/* Video overlay */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <video src={activeVideo} autoPlay playsInline className="w-full h-full object-contain" onEnded={() => setActiveVideo(null)} />
          <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-2 text-lg hover:bg-black/80">✕</button>
        </div>
      )}

      {/* Undress 18+ gate */}
      {showAgeGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAgeGate(false)} />
          <div className="relative rounded-2xl p-7 w-full max-w-xs z-10 text-center" style={{ background:"linear-gradient(135deg,#1a0533,#0d0d2e)", border:"1px solid rgba(255,100,200,0.4)" }}>
            <div className="text-5xl mb-3">🔞</div>
            <h2 className="text-white text-xl font-bold mb-2">Are you 18+?</h2>
            <p className="text-white/50 text-sm mb-6">This content is for adults only.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowAgeGate(false); setShowUndress(true); }} className="flex-1 rounded-xl py-3 font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background:"linear-gradient(135deg,#ec4899,#be185d)" }}>
                ✅ Yes
              </button>
              <button onClick={() => { setShowAgeGate(false); setShowPeppa(true); setTimeout(() => setShowPeppa(false), 3000); }}
                className="flex-1 rounded-xl py-3 font-bold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background:"linear-gradient(135deg,#6366f1,#4338ca)" }}>
                ❌ No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Peppa Pig message */}
      {showPeppa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="rounded-2xl px-8 py-6 text-center" style={{ background:"linear-gradient(135deg,#ff69b4,#ff1493)", boxShadow:"0 0 60px rgba(255,105,180,0.6)" }}>
            <div className="text-5xl mb-3">🐷</div>
            <p className="text-white text-xl font-black">Go Watch Peppa Pig</p>
          </div>
        </div>
      )}

      {showUndress && <UndressModal onClose={() => setShowUndress(false)} />}

      {/* Guided Tour — shown on first visit, skippable */}
      {showTour && <TourOverlay onDone={() => setShowTour(false)} />}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowGuide(false)} />
          <div className="relative rounded-2xl w-full max-w-sm z-10 overflow-hidden"
            style={{ background:"linear-gradient(160deg,#0f0f2e,#1a0533)", border:"1px solid rgba(255,200,255,0.25)", maxHeight:"90vh", overflowY:"auto" }}>
            {/* Header */}
            <div className="px-5 pt-5 pb-3 sticky top-0 z-10" style={{ background:"linear-gradient(160deg,#0f0f2e,#1a0533)" }}>
              <div className="text-3xl text-center mb-1">🦜</div>
              <h2 className="text-white text-xl font-black text-center tracking-wide">My Talking Squad</h2>
              <p className="text-white/50 text-xs text-center mt-1">How to play</p>
            </div>

            {/* Sections */}
            <div className="px-5 pb-5 space-y-4">

              {/* Touch zones */}
              <div className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={13} className="text-pink-300" />
                  <p className="text-pink-300 text-xs font-bold uppercase tracking-widest">Tap the Bird</p>
                </div>
                {[
                  { Icon:Zap,       label:"Head",    desc:"Smack the parrot — it gets dizzy with stars!" },
                  { Icon:Wind,      label:"Wings",   desc:"Tap a wing — sound plays instantly, wings spread after ~4s." },
                  { Icon:Circle,    label:"Stomach", desc:"Poke the belly — parrot freezes in a stop pose." },
                  { Icon:Footprints,label:"Feet",    desc:"Tickle the claws — unique feet reaction & sound." },
                ].map(r => (
                  <div key={r.label} className="flex items-start gap-3 mb-2 last:mb-0">
                    <r.Icon size={16} className="text-white/70 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-white text-sm font-bold">{r.label} </span>
                      <span className="text-white/60 text-sm">{r.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Activity buttons */}
              <div className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Play size={13} className="text-pink-300" />
                  <p className="text-pink-300 text-xs font-bold uppercase tracking-widest">Activity Buttons</p>
                </div>
                {[
                  { Icon:Utensils,   label:"Feed",    desc:"Watch the parrot eat — plays a fun feed video." },
                  { Icon:PartyPopper,label:"Party",   desc:"It's party time! Plays a party video." },
                  { Icon:Shirt,      label:"Undress", desc:"Age-gated 18+ content — confirm you're an adult first." },
                  { Icon:Moon,       label:"Sleep",   desc:"Put the parrot to sleep. Tap 'Wake Up' to wake it." },
                ].map(r => (
                  <div key={r.label} className="flex items-start gap-3 mb-2 last:mb-0">
                    <r.Icon size={16} className="text-white/70 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-white text-sm font-bold">{r.label} </span>
                      <span className="text-white/60 text-sm">{r.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mic */}
              <div className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Mic size={13} className="text-pink-300" />
                  <p className="text-pink-300 text-xs font-bold uppercase tracking-widest">Parrot Voice</p>
                </div>
                <p className="text-white/70 text-sm">Tap the mic button and speak — the parrot repeats your voice in its own squawky style. Tap the red stop button to end recording early.</p>
              </div>

              {/* Special modes */}
              <div className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={13} className="text-pink-300" />
                  <p className="text-pink-300 text-xs font-bold uppercase tracking-widest">Special Features</p>
                </div>
                {[
                  { Icon:Lock,     label:"Gay Mode", desc:"A secret mode that completely transforms the parrot. Toggle it and find out!" },
                  { Icon:Cloud,    label:"Weather",  desc:"Background changes every 20s — sunny, monsoon, spring, sunset, sunrise." },
                  { Icon:Gamepad2, label:"Game",     desc:"Opens 10K Squad Contra — a full action game in your browser!" },
                ].map(r => (
                  <div key={r.label} className="flex items-start gap-3 mb-2 last:mb-0">
                    <r.Icon size={16} className="text-white/70 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-white text-sm font-bold">{r.label} </span>
                      <span className="text-white/60 text-sm">{r.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Close */}
            <div className="px-5 pb-5">
              <button onClick={() => setShowGuide(false)}
                className="w-full rounded-xl py-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                style={{ background:"linear-gradient(135deg,#ff0080,#7700ff)" }}>
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gay Mode Modal */}
      {showGayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowGayModal(false)} />
          <div className="relative rounded-2xl p-6 w-full max-w-sm z-10 text-center"
            style={{ background:"linear-gradient(135deg,#1a0533,#2d0a5e)", border:"1px solid rgba(255,100,200,0.45)" }}>
            <div className="text-5xl mb-3">🏳️‍🌈</div>
            <h2 className="text-white text-xl font-bold mb-1">{isGayMode ? "You're in Gay Mode 👑" : "Gay Mode"}</h2>
            <p className="text-white/60 text-sm mb-5">
              {isGayMode ? "The king reigns supreme. Switch back to normal mode below." : "Transform the parrot into a king of gay world!"}
            </p>
            <button
              onClick={() => { setIsGayMode(v => !v); setShowGayModal(false); }}
              className="w-full rounded-xl py-3 font-bold text-white transition-all hover:scale-[1.03] active:scale-95 mb-3"
              style={{ background: isGayMode ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "linear-gradient(135deg,#ff0080,#7700ff)" }}>
              {isGayMode ? "🔄 Switch to Normal Mode" : "🏳️‍🌈 Switch to Gay Mode"}
            </button>
            <button onClick={() => setShowGayModal(false)} className="text-white/50 text-sm hover:text-white/80">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, Icon, color, onClick, tourId }: { label:string; Icon:React.ElementType; color:string; onClick:()=>void; tourId?:string }) {
  return (
    <button data-tour={tourId} onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-2xl px-3 py-3 transition-all hover:scale-110 active:scale-90"
      style={{ background:`${color}20`, border:`1.5px solid ${color}70`, minWidth:64, backdropFilter:"blur(8px)", boxShadow:`0 4px 14px ${color}28` }}>
      <Icon size={23} color={color} strokeWidth={1.8} />
      <span className="text-white text-xs font-semibold leading-tight text-center">{label}</span>
    </button>
  );
}

function CloudShape({ stormy, spring, sunset }: { stormy:boolean; spring:boolean; sunset:boolean }) {
  const base = stormy ? "rgba(90,90,115,0.95)"  : spring ? "rgba(255,240,248,0.92)" : sunset ? "rgba(255,200,150,0.8)" : "rgba(255,255,255,0.92)";
  const mid  = stormy ? "rgba(70,70,95,0.88)"   : spring ? "rgba(255,225,240,0.88)" : sunset ? "rgba(255,170,100,0.7)" : "rgba(255,255,255,0.86)";
  const shad = stormy ? "rgba(40,40,65,0.65)"   : spring ? "rgba(240,200,220,0.5)"  : sunset ? "rgba(200,130,80,0.5)"  : "rgba(200,225,245,0.5)";
  return (
    <div className="relative" style={{ width:130, height:56 }}>
      <div className="absolute rounded-full" style={{ bottom:0,  left:18, width:100, height:38, background:base }} />
      <div className="absolute rounded-full" style={{ bottom:18, left:10, width:48,  height:48, background:mid  }} />
      <div className="absolute rounded-full" style={{ bottom:20, left:36, width:54,  height:54, background:base }} />
      <div className="absolute rounded-full" style={{ bottom:16, left:74, width:40,  height:40, background:mid  }} />
      <div className="absolute rounded-full" style={{ bottom:0,  left:20, width:96,  height:22, background:shad }} />
    </div>
  );
}
